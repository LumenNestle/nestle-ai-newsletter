import { asset_type } from '@prisma/client';

export interface UploadedAssetFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadedAssetDto {
  id: string;
  name: string;
  url: string;
  type: asset_type;
}

export interface UploadAssetsResponseDto {
  assets: UploadedAssetDto[];
}
