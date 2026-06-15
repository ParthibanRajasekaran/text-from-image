import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { VerifyOptions, VerificationResult } from './types';

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

function compareWords(extracted: string[], expected: string[]): {
  found: string[];
  missing: string[];
} {
  const foundSet = new Set(extracted);
  const found = expected.filter((word) => foundSet.has(word));
  const missing = expected.filter((word) => !foundSet.has(word));
  return { found, missing };
}

async function callOcrApi(
  imageBuffer: Buffer,
  apiKey: string,
  baseUrl: string,
  timeout: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${baseUrl}/api/v1/ocr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `OCR API error: ${response.status} ${error.message || response.statusText}`
      );
    }

    const data = (await response.json()) as { text?: string };
    if (!data.text) {
      throw new Error('OCR API returned no text');
    }
    return data.text;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function verify(options: VerifyOptions): Promise<VerificationResult> {
  const {
    imagePath,
    imageBuffer,
    expectedText,
    apiKey,
    baseUrl = 'https://freetextfromimage.com',
    timeout = 30_000,
  } = options;

  if (!expectedText || expectedText.trim().length === 0) {
    throw new Error('expectedText is required and cannot be empty');
  }

  if (!imagePath && !imageBuffer) {
    throw new Error('Either imagePath or imageBuffer is required');
  }

  let buffer = imageBuffer;
  if (imagePath && !imageBuffer) {
    const fullPath = resolve(imagePath);
    buffer = readFileSync(fullPath);
  }

  if (!buffer || buffer.length === 0) {
    throw new Error('Image buffer is empty');
  }

  if (!apiKey) {
    throw new Error(
      'API key is required. Local OCR mode is not yet supported in this package. ' +
      'Use the API or the browser tool at https://freetextfromimage.com/ai-verification-playground'
    );
  }

  const extractedText = await callOcrApi(buffer, apiKey, baseUrl, timeout);

  const expectedWords = normalizeText(expectedText);
  const extractedWords = normalizeText(extractedText);
  const { found, missing } = compareWords(extractedWords, expectedWords);

  let outcome: 'pass' | 'fail' | 'partial';
  if (missing.length === 0) {
    outcome = 'pass';
  } else if (found.length === 0) {
    outcome = 'fail';
  } else {
    outcome = 'partial';
  }

  const confidence = found.length / expectedWords.length;

  return {
    outcome,
    foundWords: found,
    missingWords: missing,
    extractedText,
    confidence,
    message:
      outcome === 'pass'
        ? `✓ All ${expectedWords.length} expected words found`
        : outcome === 'fail'
          ? `✗ None of the ${expectedWords.length} expected words found`
          : `≈ Found ${found.length}/${expectedWords.length} expected words`,
  };
}
