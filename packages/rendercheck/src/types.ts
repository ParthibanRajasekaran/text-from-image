export interface VerifyOptions {
  imagePath?: string;
  imageBuffer?: Buffer;
  expectedText: string;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export type VerificationOutcome = 'pass' | 'fail' | 'partial';

export interface VerificationResult {
  outcome: VerificationOutcome;
  foundWords: string[];
  missingWords: string[];
  extractedText: string;
  confidence: number;
  message: string;
}
