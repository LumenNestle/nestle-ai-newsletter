import {
  Body,
  BadRequestException,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import type {
  ImproveTextRequestDto,
  ImproveTextResponseDto,
} from './dto/improve-text.dto';
import type {
  GenerateNewsletterRequestDto,
  GenerateNewsletterResponseDto,
} from './dto/generate-newsletter.dto';
import {
  generateNewsletterBodySchema,
} from './dto/generate-newsletter.dto';
import type {
  UploadedAiFile,
  UploadAiAssetsResponseDto,
} from './dto/upload-ai-asset.dto';
import { Resource } from '../modules/auth/enum/resources';
import { ZodValidationPipe } from '../common/zod/zod-validation.pipe';

@Controller(Resource.AI)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('improve-text')
  improveText(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: ImproveTextRequestDto,
  ): Promise<ImproveTextResponseDto> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication is required');
    }

    return this.aiService.improveText(body);
  }

  @Post('assets')
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadAssets(
    @Headers('authorization') authorization: string | undefined,
    @UploadedFiles() files: UploadedAiFile[] | undefined,
  ): Promise<UploadAiAssetsResponseDto> {
    this.assertAuthenticated(authorization);

    if (!files?.length) {
      throw new BadRequestException('Debe cargar al menos un archivo.');
    }

    return this.aiService.uploadAssets(files);
  }

  @Post('generate-newsletter')
  generateNewsletter(
    @Headers('authorization') authorization: string | undefined,
    @Body(new ZodValidationPipe(generateNewsletterBodySchema))
    body: GenerateNewsletterRequestDto,
  ): Promise<GenerateNewsletterResponseDto> {
    this.assertAuthenticated(authorization);

    return this.aiService.generateNewsletter(body);
  }

  private assertAuthenticated(authorization: string | undefined): void {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication is required');
    }
  }
}
