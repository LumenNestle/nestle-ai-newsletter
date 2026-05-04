export interface ImproveTextRequestDto {
  text: string;
}

export interface ImproveTextResponseDto {
  originalText: string;
  improvedText: string;
  provider: 'gemini' | 'nestle';
  model: string;
}
