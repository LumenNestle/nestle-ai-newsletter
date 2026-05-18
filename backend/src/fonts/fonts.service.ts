import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { basename, extname, posix } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { storage_object_source } from '@prisma/client';
import type {
  UploadedFontDto,
  UploadedFontFile,
  UploadFontsResponseDto,
} from './dto/upload-font.dto';

type PersistedFont = {
  id: string;
  name: string;
  style: string;
  bucket: string;
  object_key: string;
  font_groups: {
    name: string;
  };
};

type SeededFontInput = {
  name: string;
  groupName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes?: number | bigint | null;
};

const userStorageObjectSource: storage_object_source = 'USER';
const systemStorageObjectSource: storage_object_source = 'SYSTEM';

@Injectable()
export class FontsService {
  private readonly logger = new Logger(FontsService.name);
  private readonly allowedFontExtensions = new Set([
    '.ttf',
    '.otf',
    '.woff',
    '.woff2',
  ]);
  private readonly allowedFontMimeTypes = new Set([
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',
    'application/font-sfnt',
    'application/x-font-ttf',
    'application/x-font-opentype',
    'application/octet-stream',
  ]);
  private readonly maxFontSizeBytes = 10 * 1024 * 1024;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadFonts(
    files: UploadedFontFile[],
    groupName: string,
  ): Promise<UploadFontsResponseDto> {
    try {
      const normalizedGroupName = groupName.trim();
      const fontGroup = await this.findOrCreateFontGroup(normalizedGroupName);

      const fonts = await Promise.all(
        files.map(async (file) => {
          this.validateFontFile(file);
          const storageKey = this.createUserUploadStorageKey(
            normalizedGroupName,
            file.originalname,
          );

          await this.storageService.uploadObject(
            this.getFontBucketName(),
            storageKey,
            file.buffer,
            file.mimetype,
          );

          const font = await this.prisma.fonts.create({
            data: {
              font_group_id: fontGroup.id,
              name: file.originalname,
              style: this.inferFontStyle(file.originalname),
              bucket: this.getFontBucketName(),
              object_key: storageKey,
              object_prefix: this.getObjectPrefix(storageKey),
              file_name: this.getFileName(storageKey),
              extension: this.getExtension(storageKey),
              mime_type: file.mimetype,
              size_bytes: file.size,
              source: userStorageObjectSource,
            },
            select: {
              id: true,
              name: true,
              style: true,
              bucket: true,
              object_key: true,
              font_groups: {
                select: {
                  name: true,
                },
              },
            },
          });

          return this.toUploadedFontDto(font);
        }),
      );

      return { fonts };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Font upload failed.');

      throw new ServiceUnavailableException(
        'No se pudieron cargar las fuentes en este momento.',
      );
    }
  }

  async listFonts(groupName?: string): Promise<UploadFontsResponseDto> {
    try {
      const normalizedGroupName = groupName?.trim();
      const fonts = await this.prisma.fonts.findMany({
        where: normalizedGroupName
          ? {
              font_groups: {
                name: normalizedGroupName,
              },
            }
          : undefined,
        orderBy: [{ font_groups: { name: 'asc' } }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          style: true,
          bucket: true,
          object_key: true,
          font_groups: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        fonts: await Promise.all(
          fonts.map((font) => this.toUploadedFontDto(font)),
        ),
      };
    } catch {
      this.logger.error('Font list failed.');

      throw new ServiceUnavailableException(
        'No se pudieron obtener las fuentes en este momento.',
      );
    }
  }

  async upsertSeededFont(input: SeededFontInput): Promise<UploadedFontDto> {
    const fontGroup = await this.findOrCreateFontGroup(input.groupName);
    const existingFont = await this.prisma.fonts.findFirst({
      where: {
        bucket: this.getFontBucketName(),
        object_key: input.storageKey,
      },
      select: {
        id: true,
      },
    });

    const fontData = {
      font_group_id: fontGroup.id,
      name: input.name,
      style: this.inferFontStyle(input.name),
      bucket: this.getFontBucketName(),
      object_key: input.storageKey,
      object_prefix: this.getObjectPrefix(input.storageKey),
      file_name: this.getFileName(input.storageKey),
      extension: this.getExtension(input.storageKey),
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes ?? null,
      source: systemStorageObjectSource,
    };

    const font = existingFont
      ? await this.prisma.fonts.update({
          where: {
            id: existingFont.id,
          },
          data: fontData,
          select: {
            id: true,
            name: true,
            style: true,
            bucket: true,
            object_key: true,
            font_groups: {
              select: {
                name: true,
              },
            },
          },
        })
      : await this.prisma.fonts.create({
          data: fontData,
          select: {
            id: true,
            name: true,
            style: true,
            bucket: true,
            object_key: true,
            font_groups: {
              select: {
                name: true,
              },
            },
          },
        });

    return this.toUploadedFontDto(font);
  }

  private async findOrCreateFontGroup(name: string): Promise<{ id: string; name: string }> {
    return this.prisma.font_groups.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  private validateFontFile(file: UploadedFontFile): void {
    const extension = extname(file.originalname).toLowerCase();

    if (!this.allowedFontExtensions.has(extension)) {
      throw new BadRequestException(
        'Solo se permiten fuentes TTF, OTF, WOFF o WOFF2.',
      );
    }

    if (!this.allowedFontMimeTypes.has(file.mimetype)) {
      throw new BadRequestException(
        'Debe cargar una fuente con un tipo de archivo valido.',
      );
    }

    if (file.size > this.maxFontSizeBytes) {
      throw new BadRequestException(
        'Cada archivo debe pesar 10 MB o menos.',
      );
    }

    if (!file.buffer?.length) {
      throw new BadRequestException('El archivo cargado esta vacio.');
    }
  }

  private async toUploadedFontDto(
    font: PersistedFont,
  ): Promise<UploadedFontDto> {
    return {
      id: font.id,
      name: font.name,
      style: font.style,
      groupName: font.font_groups.name,
      url: await this.storageService.getSignedUrl(font.bucket, font.object_key),
    };
  }

  private getFontBucketName(): string {
    return this.storageService.getFontsBucket();
  }

  private createUserUploadStorageKey(
    groupName: string,
    fileName: string,
  ): string {
    const safeExtension = extname(fileName).toLowerCase();
    const normalizedBaseName = this.normalizePathSegment(
      basename(fileName, safeExtension),
    );
    const normalizedGroupName = this.normalizePathSegment(groupName);
    return `fonts/uploads/${normalizedGroupName}/${normalizedBaseName}-${randomUUID()}${safeExtension}`;
  }

  private inferFontStyle(fileName: string): string {
    const baseName = basename(fileName, extname(fileName));
    const styleToken = baseName.split('-').pop()?.trim();
    return styleToken || 'Regular';
  }

  private normalizePathSegment(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'font';
  }

  private getObjectPrefix(storageKey: string): string {
    const objectPrefix = posix.dirname(storageKey);
    return objectPrefix === '.' ? '' : objectPrefix;
  }

  private getFileName(storageKey: string): string {
    return basename(storageKey);
  }

  private getExtension(storageKey: string): string | null {
    const extension = extname(storageKey).toLowerCase();
    return extension ? extension.slice(1) : null;
  }
}
