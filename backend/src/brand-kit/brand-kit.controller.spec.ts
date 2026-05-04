import { Test, TestingModule } from '@nestjs/testing';
import { BrandKitController } from './brand-kit.controller';

describe('BrandKitController', () => {
  let controller: BrandKitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandKitController],
    }).compile();

    controller = module.get<BrandKitController>(BrandKitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
