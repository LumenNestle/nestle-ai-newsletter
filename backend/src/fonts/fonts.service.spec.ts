import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FontsService } from './fonts.service';
import type { UploadedFontFile } from './dto/upload-font.dto';

function createService() {
  const uploadObjectMock = jest.fn().mockResolvedValue(undefined);
  const getSignedUrlMock = jest
    .fn()
    .mockResolvedValue('http://localhost:9000/nestle-ai-newsletter-fonts/fake');
  const prisma = {
    font_groups: {
      upsert: jest.fn().mockResolvedValue({
        id: 'font-group-id',
        name: 'Nestle',
      }),
    },
    fonts: {
      create: jest.fn().mockResolvedValue({
        id: 'font-id',
        name: 'NestleTextTF-BoldItalic.ttf',
        style: 'BoldItalic',
        bucket: 'nestle-ai-newsletter-fonts',
        object_key: 'fonts/uploads/nestle/nestletexttf-bolditalic-fake.ttf',
        font_groups: {
          name: 'Nestle',
        },
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'seed-font-id',
          name: 'NestleTextTF-BoldItalic.ttf',
          style: 'BoldItalic',
          bucket: 'nestle-ai-newsletter-fonts',
          object_key: 'fonts/nestle/NestleTextTF-BoldItalic.ttf',
          font_groups: {
            name: 'Nestle',
          },
        },
      ]),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  const storageService = {
    uploadObject: uploadObjectMock,
    getSignedUrl: getSignedUrlMock,
    getFontsBucket: jest.fn().mockReturnValue('nestle-ai-newsletter-fonts'),
  } as unknown as StorageService;

  return {
    service: new FontsService(prisma, storageService),
    uploadObjectMock,
    prisma,
  };
}

describe('FontsService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('uploads valid fonts through the storage service', async () => {
    const { service, uploadObjectMock } = createService();

    await expect(
      service.uploadFonts(
        [
          {
            originalname: 'NestleTextTF-BoldItalic.ttf',
            mimetype: 'font/ttf',
            size: 4096,
            buffer: Buffer.from('fake-font'),
          },
        ],
        'Nestle',
      ),
    ).resolves.toEqual({
      fonts: [
        {
          id: 'font-id',
          name: 'NestleTextTF-BoldItalic.ttf',
          style: 'BoldItalic',
          groupName: 'Nestle',
          url: 'http://localhost:9000/nestle-ai-newsletter-fonts/fake',
        },
      ],
    });

    expect(uploadObjectMock).toHaveBeenCalledWith(
      'nestle-ai-newsletter-fonts',
      expect.stringMatching(
        /^fonts\/uploads\/nestle\/nestletexttf-bolditalic-/,
      ),
      Buffer.from('fake-font'),
      'font/ttf',
    );
  });

  it('lists persisted fonts with signed urls', async () => {
    const { service } = createService();

    await expect(service.listFonts('Nestle')).resolves.toEqual({
      fonts: [
        {
          id: 'seed-font-id',
          name: 'NestleTextTF-BoldItalic.ttf',
          style: 'BoldItalic',
          groupName: 'Nestle',
          url: 'http://localhost:9000/nestle-ai-newsletter-fonts/fake',
        },
      ],
    });
  });

  it('rejects invalid font files', async () => {
    const { service } = createService();

    await expect(
      service.uploadFonts(
        [
          {
            originalname: 'document.pdf',
            mimetype: 'application/pdf',
            size: 1200,
            buffer: Buffer.from('fake'),
          } as UploadedFontFile,
        ],
        'Nestle',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
