import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UploadedAiFile } from './dto/upload-ai-asset.dto';

type ConfigValues = Record<string, string | undefined>;

function createConfigService(values: ConfigValues): ConfigService {
  return {
    get: (key: string) => values[key],
  } as ConfigService;
}

function createService(values: ConfigValues = {}) {
  const prisma = {
    assets: {
      create: jest.fn(),
    },
  } as unknown as PrismaService;
  const supabaseService = {
    uploadAsset: jest.fn(),
  } as unknown as SupabaseService;

  return {
    service: new AiService(createConfigService(values), prisma, supabaseService),
    prisma,
    supabaseService,
  };
}

describe('AiService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('throws when no provider credentials are configured', async () => {
    const { service } = createService();

    await expect(
      service.improveText({ text: 'Texto de prueba' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('improves text with Gemini by default when GEMINI_API_KEY exists', async () => {
    const { service } = createService({
        GEMINI_API_KEY: 'test-key',
        GEMINI_MODEL: 'gemini-2.5-flash-lite',
      });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: 'Texto mejorado' }],
              },
            },
          ],
        }),
    }) as typeof fetch;

    await expect(
      service.improveText({ text: 'Texto original' }),
    ).resolves.toEqual({
      originalText: 'Texto original',
      improvedText: 'Texto mejorado',
      provider: 'gemini',
      model: 'gemini-2.5-flash-lite',
    });
  });

  it('improves text with Nestle GenIA when AI_PROVIDER=nestle', async () => {
    const { service } = createService({
        AI_PROVIDER: 'nestle',
        CLIENT_ID: 'client-id',
        CLIENT_SECRET: 'client-secret',
        NESTLE_GENIA_URL:
          'https://eur-sdr-int-pub.nestle.com/api/dv-exp-sandbox-openai-api/1/genai/GCP/gemini-2.5-pro/generateContent',
      });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: 'Texto mejorado por Nestle' }],
              },
            },
          ],
        }),
    }) as typeof fetch;

    await expect(
      service.improveText({ text: 'Texto original' }),
    ).resolves.toEqual({
      originalText: 'Texto original',
      improvedText: 'Texto mejorado por Nestle',
      provider: 'nestle',
      model: 'gemini-2.5-pro',
    });
  });

  it('generates newsletter blocks with structured context', async () => {
    const { service } = createService({
      GEMINI_API_KEY: 'test-key',
      GEMINI_MODEL: 'gemini-2.5-flash-lite',
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      blocks: [
                        {
                          id: 'headline',
                          name: 'Titulo principal',
                          text: 'Nuevo titulo generado',
                          backgroundColor: '#97CAEB',
                        },
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
    }) as typeof fetch;

    await expect(
      service.generateNewsletter({
        area: 'COMUNICACION_INTERNA',
        templateId: 'weekly-brief',
        topic: 'Seguridad',
        objective: 'Informar avances',
        audience: 'Equipo interno',
        keyMessages: ['Mensaje clave'],
        tone: 'Claro',
        linksOrSources: [],
        assetIds: [],
      }),
    ).resolves.toEqual({
      blocks: [
        {
          id: 'headline',
          name: 'Titulo principal',
          text: 'Nuevo titulo generado',
          backgroundColor: '#97CAEB',
        },
      ],
      provider: 'gemini',
      model: 'gemini-2.5-flash-lite',
    });

    const fetchBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body as string,
    ) as {
      contents: Array<{ parts: Array<{ text: string }> }>;
    };

    expect(fetchBody.contents[0].parts[0].text).toContain('"topic":"Seguridad"');
    expect(fetchBody.contents[0].parts[0].text).toContain(
      '"templateId":"weekly-brief"',
    );
  });

  it('rejects invalid asset files', async () => {
    const { service } = createService();

    await expect(
      service.uploadAssets([
        {
          originalname: 'document.pdf',
          mimetype: 'application/pdf',
          size: 1200,
          buffer: Buffer.from('fake'),
        } as UploadedAiFile,
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
