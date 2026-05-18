import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MockAuthGuard } from '../modules/auth/guards/mockup.guard';
import { PermissionsGuard } from '../modules/auth/guards/permissions.guard';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

describe('AssetsController', () => {
  let controller: AssetsController;
  const assetsService = {
    listAssets: jest.fn(),
    uploadAssets: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetsService,
          useValue: assetsService,
        },
      ],
    })
      .overrideGuard(MockAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AssetsController>(AssetsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('rejects asset uploads with invalid asset type', () => {
    expect(() => controller.uploadAssets('NOT_VALID', [])).toThrow(
      BadRequestException,
    );
  });

  it('rejects asset listing with invalid asset type', () => {
    expect(() => controller.listAssets('NOT_VALID')).toThrow(BadRequestException);
  });

  it('rejects asset uploads without files', () => {
    expect(() => controller.uploadAssets('IMAGE', [])).toThrow(
      BadRequestException,
    );
  });
});
