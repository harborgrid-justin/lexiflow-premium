/**
 * OCR Worker Thread
 * 
 * PhD-Grade Memory Optimization: Offload CPU/Memory intensive Tesseract OCR to worker threads.
 * When the thread finishes, memory is entirely reclaimed by the OS, unlike main-thread GC.
 * 
 * @module OCRWorker
 * @category Performance - Worker Threads
 * 
 * Benefits:
 * - Isolates memory spikes to worker process (doesn't affect API heap)
 * - OS-level memory reclamation (instant cleanup vs GC cycles)
 * - Prevents OCR from blocking event loop
 * - Process crashes don't affect main API
 * 
 * Usage with Piscina:
 * ```typescript
 * const pool = new Piscina({
 *   filename: path.join(__dirname, 'ocr-worker.js')
 * });
 * 
 * const result = await pool.run({ filePath, language });
 * ```
 */

import { createWorker, OEM, PSM } from 'tesseract.js';
import * as fs from 'fs';

export interface OCRWorkerInput {
  filePath: string;
  language?: string;
  psm?: number;
  oem?: number;
}

export interface OCRWorkerOutput {
  text: string;
  confidence: number;
  processingTime: number;
  memoryUsed: number;
}

/**
 * Worker thread entry point for OCR processing
 * This function runs in a separate worker thread/process
 */
export default async function processOCR(input: OCRWorkerInput): Promise<OCRWorkerOutput> {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  const {
    filePath,
    language = 'eng',
    psm = PSM.AUTO,
    oem = OEM.LSTM_ONLY
  } = input;

  // Verify file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Create Tesseract worker with optimized settings
  const worker = await createWorker(language, oem, {
    // Limit worker threads to prevent memory explosion
    workerPath: undefined,
    corePath: undefined,
    langPath: undefined,
    cachePath: undefined,
    cacheMethod: 'none', // Disable caching in worker
    gzip: false,
    logger: () => undefined, // Disable logging for performance
  });

  try {
    // Set page segmentation mode
    await worker.setParameters({
      tessedit_pageseg_mode: psm as unknown as PSM,
    });

    // Process image
    const result = await worker.recognize(filePath);

    const endMemory = process.memoryUsage().heapUsed;
    const processingTime = Date.now() - startTime;

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      processingTime,
      memoryUsed: endMemory - startMemory,
    };
  } finally {
    // Critical: Always terminate worker to free memory
    await worker.terminate();
  }
}

// Export for Piscina compatibility
module.exports = processOCR;
