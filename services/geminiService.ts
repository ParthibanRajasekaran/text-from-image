import { GoogleGenAI } from '@google/genai';
import { toBase64 } from '../utils/fileUtils';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are a precise OCR agent. Given one image, extract all visible text verbatim.

Preserve reading order (left→right, top→bottom).

Keep original line breaks and spacing when it improves readability.

If text is rotated or skewed, correct orientation and still extract it.

Include text inside signs, labels, stamps, captions, watermarks, and small print.

Do not summarize or translate; output plain text only.

If no readable text is present, respond with: NO_TEXT_FOUND.`;

const PROCESSING_MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const extractTextFromImage = async (file: File): Promise<string> => {
  if (file.size > PROCESSING_MAX_SIZE_BYTES) {
    throw new Error(
      'Files larger than 20MB are not supported for direct processing in this application. An upgrade to use the Files API is required for larger images.'
    );
  }
  
  try {
    const base64Data = await toBase64(file);
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [imagePart] },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.0,
      },
    });

    // Fix: Per Gemini API guidelines, response.text provides the string output directly.
    // Removed optional chaining (`?.`) as the `text` property is not optional on a successful response.
    const resultText = response.text.trim();

    // The model is instructed to return this specific string if no text is found.
    if (resultText === 'NO_TEXT_FOUND') {
      return ''; // Return empty string to signify a successful run with no found text.
    }

    if (!resultText) {
      // Handle cases where the model might return an empty response unexpectedly.
      throw new Error(
        'The model returned an empty or invalid response. The image might not contain readable text or there was an issue processing it.'
      );
    }

    return resultText;
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Re-throw the original error to be handled by the UI component.
    // This preserves details from the API error, providing better context.
    throw error;
  }
};
