interface GenerateContentCandidate {
  content?: {
    parts?: Array<{
      text?: string;
    }>;
  };
}

export interface GeminiGenerateContentSuccess {
  candidates?: GenerateContentCandidate[];
  error?: {
    message?: string;
  };
}

export interface NestleGeniaGenerateContentSuccess {
  candidates?: GenerateContentCandidate[];
  error?: string | { message?: string };
}
