import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Resource } from '../modules/auth/enum/resources';
import { FontsService } from './fonts.service';
import type {
  UploadedFontFile,
  UploadFontsResponseDto,
} from './dto/upload-font.dto';

@Controller(Resource.FONTS)
export class FontsController {
  constructor(private readonly fontsService: FontsService) {}

  @Get()
  listFonts(
    @Headers('authorization') authorization: string | undefined,
    @Query('groupName') groupName?: string,
  ): Promise<UploadFontsResponseDto> {
    this.assertAuthenticated(authorization);
    return this.fontsService.listFonts(groupName);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadFonts(
    @Headers('authorization') authorization: string | undefined,
    @Body('groupName') groupName: string | undefined,
    @UploadedFiles() files: UploadedFontFile[] | undefined,
  ): Promise<UploadFontsResponseDto> {
    this.assertAuthenticated(authorization);

    if (!files?.length) {
      throw new BadRequestException('Debe cargar al menos un archivo.');
    }

    if (!groupName?.trim()) {
      throw new BadRequestException(
        'Debe indicar un grupo de fuentes valido.',
      );
    }

    return this.fontsService.uploadFonts(files, groupName);
  }

  private assertAuthenticated(authorization: string | undefined): void {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication is required');
    }
  }
}
