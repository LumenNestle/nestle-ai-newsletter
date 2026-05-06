export interface UploadedFontFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadedFontDto {
  id: string;
  name: string;
  url: string;
  style: string;
  groupName: string;
}

export interface UploadFontsResponseDto {
  fonts: UploadedFontDto[];
}
