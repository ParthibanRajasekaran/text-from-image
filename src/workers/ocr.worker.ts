/**
 * OCR Worker Thread
 * 
 * Offloads heavy OCR library imports and processing to a separate worker thread.
 * This keeps the main thread responsive and defers loading of onnxruntime-web,
 * tesseract.js, and @xenova/transformers until user actually performs OCR.
 * 
 * Message Protocol:
 * Main → Worker: { type: 'RUN', payload: File }
 * Worker → Main: { type: 'DONE', result: string } | { type: 'ERROR', error: string }
 */

interface WorkerMessage {
  type: 'RUN' | 'DONE' | 'ERROR';
  payload?: File;
  result?: string;
  error?: string;
}

/**
 * Extract text with details (returns which method was used)
 * Heavy imports happen here in the worker thread
 */
async function extractTextWithDetails(
  file: File,
  options: { minConfidence?: number; minTextLength?: number } = {}
) {
  try {
    // Lazy imports - only happen when worker processes OCR
    const { extractTextWithDetails: extract } = await import('../../services/hybridService');

    const result = await extract(file, {
      minConfidence: options.minConfidence ?? 60,
      minTextLength: options.minTextLength ?? 3,
    });

    return result.text;
  } catch (error: any) {
    throw new Error(error.message || 'OCR processing failed');
  }
}

/**
 * Message handler - processes OCR requests from main thread
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  if (type !== 'RUN') {
    self.postMessage({ type: 'ERROR', error: 'Unknown message type' });
    return;
  }

  if (!payload) {
    self.postMessage({ type: 'ERROR', error: 'No file provided' });
    return;
  }

  try {
    const result = await extractTextWithDetails(payload);
    self.postMessage({ type: 'DONE', result });
  } catch (error: any) {
    self.postMessage({ type: 'ERROR', error: error.message || 'Unknown error' });
  }
};
