import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { asset_type } from '@prisma/client';
import { z } from 'zod';
import {
  ImproveTextRequestDto,
  ImproveTextResponseDto,
} from './dto/improve-text.dto';
import {
  GenerateNewsletterRequestDto,
  GenerateNewsletterResponseDto,
  GeneratedNewsletterBlockDto,
} from './dto/generate-newsletter.dto';
import {
  UploadedAiFile,
  UploadAiAssetsResponseDto,
} from './dto/upload-ai-asset.dto';
import {
  GeminiGenerateContentSuccess,
  NestleGeniaGenerateContentSuccess,
} from './ai.types';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

type GenerateContentResponse =
  | GeminiGenerateContentSuccess
  | NestleGeniaGenerateContentSuccess;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly publicErrorMessage =
    'No se pudo mejorar el texto en este momento.';
  private readonly generationPublicErrorMessage =
    'No se pudo generar el newsletter en este momento.';
  private readonly allowedAssetMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ]);
  private readonly maxAssetSizeBytes = 5 * 1024 * 1024;
  private readonly textImprovementInstruction =
    'You are a Spanish copy editor for internal Nestle newsletters. Improve the text for clarity, fluency, tone, and readability while keeping the original meaning. Return only the improved text in Spanish, with no markdown, bullets, or explanations.';
  private readonly defaultNestleGeniaUrl =
    'https://eur-sdr-int-pub.nestle.com/api/dv-exp-sandbox-openai-api/1/genai/GCP/gemini-2.5-pro/generateContent';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async improveText(
    request: ImproveTextRequestDto,
  ): Promise<ImproveTextResponseDto> {
    const originalText = request.text?.trim();

    if (!originalText) {
      throw new BadRequestException(
        'El texto es requerido y no puede estar vacío',
      );
    }

    if (originalText.length > 3000) {
      throw new BadRequestException(
        'El texto debe tener 3000 caracteres o menos',
      );
    }

    if (this.readProvider() === 'nestle') {
      return this.improveWithNestleGenia(originalText);
    }

    return this.improveWithGemini(originalText);
  }

  async uploadAssets(
    files: UploadedAiFile[],
  ): Promise<UploadAiAssetsResponseDto> {
    try {
      const assets = await Promise.all(
        files.map(async (file) => {
          this.validateAssetFile(file);

          const uploadedAsset = await this.supabaseService.uploadAsset(
            file.originalname,
            file.buffer,
            file.mimetype,
          );

          const asset = await this.prisma.assets.create({
            data: {
              name: file.originalname,
              url: uploadedAsset.url,
              type: asset_type.IMAGE,
            },
            select: {
              id: true,
              name: true,
              url: true,
              type: true,
            },
          });

          return asset;
        }),
      );

      return { assets };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('AI asset upload failed.');

      throw new ServiceUnavailableException(
        'No se pudieron cargar los assets en este momento.',
      );
    }
  }

  async generateNewsletter(
    request: GenerateNewsletterRequestDto,
  ): Promise<GenerateNewsletterResponseDto> {
    const prompt = this.buildNewsletterGenerationPrompt(request);
    const providerResponse =
      this.readProvider() === 'nestle'
        ? await this.generateWithNestleGenia(prompt)
        : await this.generateWithGemini(prompt);
    const rawText = providerResponse.text;

    return {
      blocks: this.parseGeneratedNewsletterBlocks(rawText),
      provider: providerResponse.provider,
      model: providerResponse.model,
    };
  }

  private readEnv(key: string): string | null {
    const value = this.configService.get<string>(key)?.trim();
    return value ? value : null;
  }

  private readProvider(): 'gemini' | 'nestle' {
    return this.readEnv('AI_PROVIDER')?.toLowerCase() === 'nestle'
      ? 'nestle'
      : 'gemini';
  }

  private async improveWithGemini(
    originalText: string,
  ): Promise<ImproveTextResponseDto> {
    const apiKey = this.readEnv('GEMINI_API_KEY');
    const model =
      this.readEnv('GEMINI_MODEL') ??
      this.readEnv('GEMINI_TEXT_MODEL') ??
      'gemini-2.5-flash-lite';

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Gemini is not configured on the server.',
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(this.buildGenerateContentPayload(originalText)),
        signal: AbortSignal.timeout(15000),
      },
    );

    const responseBody = (await response
      .json()
      .catch(() => null)) as GeminiGenerateContentSuccess | null;

    if (!response.ok) {
      throw this.createProviderException(
        'gemini',
        response.status,
        responseBody?.error?.message ??
          `Gemini returned status ${response.status}.`,
      );
    }

    return {
      originalText,
      improvedText: this.extractGeminiText(responseBody, model, 'gemini'),
      provider: 'gemini',
      model,
    };
  }

  private async improveWithNestleGenia(
    originalText: string,
  ): Promise<ImproveTextResponseDto> {
    const clientId = this.readEnv('CLIENT_ID');
    const clientSecret = this.readEnv('CLIENT_SECRET');
    const url = this.readEnv('NESTLE_GENIA_URL') ?? this.defaultNestleGeniaUrl;
    const model =
      this.readEnv('NESTLE_GENIA_MODEL') ?? this.extractNestleModelFromUrl(url);

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        'Nestle GenIA is not configured on the server.',
      );
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        client_id: clientId,
        client_secret: clientSecret,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(this.buildGenerateContentPayload(originalText)),
      signal: AbortSignal.timeout(15000),
    });

    const responseBody = (await response
      .json()
      .catch(() => null)) as NestleGeniaGenerateContentSuccess | null;

    if (!response.ok) {
      throw this.createProviderException(
        'nestle',
        response.status,
        this.extractNestleErrorMessage(responseBody, response.status),
      );
    }

    return {
      originalText,
      improvedText: this.extractGeminiText(responseBody, model, 'nestle'),
      provider: 'nestle',
      model,
    };
  }

  private async generateWithGemini(prompt: string): Promise<{
    text: string;
    provider: 'gemini';
    model: string;
  }> {
    const apiKey = this.readEnv('GEMINI_API_KEY');
    const model =
      this.readEnv('GEMINI_MODEL') ??
      this.readEnv('GEMINI_TEXT_MODEL') ??
      'gemini-2.5-flash-lite';

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Gemini is not configured on the server.',
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(this.buildNewsletterGenerateContentPayload(prompt)),
        signal: AbortSignal.timeout(15000),
      },
    );

    const responseBody = (await response
      .json()
      .catch(() => null)) as GeminiGenerateContentSuccess | null;

    if (!response.ok) {
      throw this.createProviderException(
        'gemini',
        response.status,
        responseBody?.error?.message ??
          `Gemini returned status ${response.status}.`,
        this.generationPublicErrorMessage,
      );
    }

    return {
      text: this.extractGeminiText(responseBody, model, 'gemini'),
      provider: 'gemini',
      model,
    };
  }

  private async generateWithNestleGenia(prompt: string): Promise<{
    text: string;
    provider: 'nestle';
    model: string;
  }> {
    const clientId = this.readEnv('CLIENT_ID');
    const clientSecret = this.readEnv('CLIENT_SECRET');
    const url = this.readEnv('NESTLE_GENIA_URL') ?? this.defaultNestleGeniaUrl;
    const model =
      this.readEnv('NESTLE_GENIA_MODEL') ?? this.extractNestleModelFromUrl(url);

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        'Nestle GenIA is not configured on the server.',
      );
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        client_id: clientId,
        client_secret: clientSecret,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(this.buildNewsletterGenerateContentPayload(prompt)),
      signal: AbortSignal.timeout(15000),
    });

    const responseBody = (await response
      .json()
      .catch(() => null)) as NestleGeniaGenerateContentSuccess | null;

    if (!response.ok) {
      throw this.createProviderException(
        'nestle',
        response.status,
        this.extractNestleErrorMessage(responseBody, response.status),
        this.generationPublicErrorMessage,
      );
    }

    return {
      text: this.extractGeminiText(responseBody, model, 'nestle'),
      provider: 'nestle',
      model,
    };
  }

  private buildGenerateContentPayload(originalText: string): object {
    return {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${this.textImprovementInstruction}\n\nText to improve:\n${originalText}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 300,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
      ],
    };
  }

  private buildNewsletterGenerateContentPayload(prompt: string): object {
    return {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.5,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 900,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
      ],
    };
  }

  private buildNewsletterGenerationPrompt(
    request: GenerateNewsletterRequestDto,
  ): string {
    const promptContext = {
      area: request.area,
      templateId: request.templateId,
      topic: request.topic,
      objective: request.objective,
      audience: request.audience,
      keyMessages: request.keyMessages,
      tone: request.tone,
      relevantDates: request.relevantDates ?? null,
      cta: request.cta ?? null,
      contact: request.contact ?? null,
      linksOrSources: request.linksOrSources,
      additionalContext: request.additionalContext ?? null,
      assetIds: request.assetIds,
    };

    return [
      'You are a Spanish copywriter for internal Nestle newsletters.',
      'Generate concise, brand-safe newsletter copy in Spanish for an internal communications team.',
      'Return only valid JSON with this exact shape:',
      '{"blocks":[{"id":"header","name":"Encabezado","text":"...","backgroundColor":"#FFFFFF"},{"id":"headline","name":"Titulo principal","text":"...","backgroundColor":"#97CAEB"},{"id":"body","name":"Cuerpo","text":"...","backgroundColor":"#FFFFFF"},{"id":"cta","name":"Llamado a la accion","text":"...","backgroundColor":"#FFC600"}]}',
      'Do not include markdown, comments, explanations, HTML, or fields not shown in the schema.',
      'Use the supplied structured context as the only source material. If a value is missing, write a neutral internal-newsletter fallback.',
      `Structured context JSON: ${JSON.stringify(promptContext)}`,
    ].join('\n');
  }

  private parseGeneratedNewsletterBlocks(
    rawText: string,
  ): GeneratedNewsletterBlockDto[] {
    const jsonText = this.extractJsonText(rawText);
    const responseSchema = z.object({
      blocks: z
        .array(
          z.object({
            id: z.string().trim().min(1),
            name: z.string().trim().min(1),
            text: z.string().trim().min(1),
            backgroundColor: z
              .string()
              .trim()
              .regex(/^#[0-9A-Fa-f]{6}$/),
          }),
        )
        .min(1),
    });
    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonText) as unknown;
    } catch {
      throw new BadGatewayException({
        message: this.generationPublicErrorMessage,
      });
    }

    const blockSchema = responseSchema.safeParse(parsed);

    if (!blockSchema.success) {
      throw new BadGatewayException({
        message: this.generationPublicErrorMessage,
      });
    }

    return blockSchema.data.blocks;
  }

  private extractJsonText(rawText: string): string {
    const trimmedText = rawText.trim();
    const fencedJson = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

    return fencedJson?.[1]?.trim() ?? trimmedText;
  }

  private validateAssetFile(file: UploadedAiFile): void {
    if (!this.allowedAssetMimeTypes.has(file.mimetype)) {
      throw new BadRequestException(
        'Solo se permiten imagenes JPG, PNG, WebP, GIF o SVG.',
      );
    }

    if (file.size > this.maxAssetSizeBytes) {
      throw new BadRequestException(
        'Cada archivo debe pesar 5 MB o menos.',
      );
    }

    if (!file.buffer?.length) {
      throw new BadRequestException('El archivo cargado esta vacio.');
    }
  }

  private extractNestleModelFromUrl(url: string): string {
    const match = url.match(/\/genai\/[^/]+\/([^/]+)\/generateContent$/);
    return match?.[1] ?? 'gemini-2.5-pro';
  }

  private extractNestleErrorMessage(
    responseBody: NestleGeniaGenerateContentSuccess | null,
    responseStatus: number,
  ): string {
    if (typeof responseBody?.error === 'string' && responseBody.error.trim()) {
      return responseBody.error.trim();
    }

    if (
      typeof responseBody?.error === 'object' &&
      responseBody.error?.message?.trim()
    ) {
      return responseBody.error.message.trim();
    }

    return `Nestle GenIA returned status ${responseStatus}.`;
  }

  private extractGeminiText(
    responseBody: GenerateContentResponse | null,
    model: string,
    provider: 'gemini' | 'nestle',
  ): string {
    const candidateText = responseBody?.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text?.trim() ?? '')
      .find((text) => text.length > 0);

    if (candidateText) {
      return candidateText;
    }

    throw this.createProviderException(
      provider,
      502,
      `${provider === 'nestle' ? 'Nestle GenIA' : 'Gemini'} model ${model} did not return any text content.`,
    );
  }

  private createProviderException(
    provider: 'gemini' | 'nestle',
    providerStatus: number,
    providerError: string,
    publicMessage = this.publicErrorMessage,
  ): BadGatewayException {
    this.logger.error(
      `AI improveText failed with provider=${provider} status=${providerStatus} error=${providerError}`,
    );

    return new BadGatewayException({
      message: publicMessage,
      providerError,
      providerStatus,
      provider,
    });
  }
}
