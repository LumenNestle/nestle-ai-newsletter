import { asset_type } from '@prisma/client';

export interface UploadedAiFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadedAiAssetDto {
  id: string;
  name: string;
  url: string;
  type: asset_type;
}

export interface UploadAiAssetsResponseDto {
  assets: UploadedAiAssetDto[];
}
