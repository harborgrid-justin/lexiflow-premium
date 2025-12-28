/**
 * Tesseract worker interfaces for type safety
 */

export interface TesseractLoggerMessage {
  workerId?: string;
  jobId?: string;
  status: string;
  progress?: number;
}

export interface TesseractRecognizeResult {
  data: {
    text: string;
    confidence: number;
    words?: Array<{
      text: string;
      confidence: number;
      bbox?: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
      };
    }>;
  };
}

export interface TesseractWorker {
  recognize(image: Buffer | string): Promise<TesseractRecognizeResult>;
  terminate(): Promise<void>;
}

export interface TesseractCreateWorkerOptions {
  logger?: (message: TesseractLoggerMessage) => void;
}
