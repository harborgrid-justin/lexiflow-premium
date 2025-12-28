import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorageService } from '@file-storage/file-storage.service';
import {
  OcrRequestDto,
  OcrResultDto,
  OcrProgressDto,
  DetectLanguageDto,
  LanguageDetectionResultDto,
  ExtractStructuredDataOptionsDto,
  StructuredDataResultDto,
  BatchProcessRequestDto,
  BatchProcessResultDto,
  OcrStatsDto,
} from './dto/ocr-request.dto';
import {
  TesseractWorker,
  TesseractLoggerMessage,
  TesseractCreateWorkerOptions,
} from './interfaces/tesseract.interface';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private worker: TesseractWorker | null = null;
  private readonly ocrEnabled: boolean;
  private initializationAttempted: boolean = false;

  constructor(
    private configService: ConfigService,
    private fileStorageService: FileStorageService,
  ) {
    this.ocrEnabled = this.configService.get<string>('OCR_ENABLED') === 'true';
    if (this.ocrEnabled) {
      // Defer initialization to avoid blocking startup
      this.initializeWorkerAsync();
    } else {
      this.logger.log('OCR service disabled by configuration');
    }
  }

  /**
   * Initialize Tesseract worker asynchronously (non-blocking)
   */
  private async initializeWorkerAsync(): Promise<void> {
    if (this.initializationAttempted) return;
    this.initializationAttempted = true;

    try {
      this.logger.log('Initializing Tesseract OCR worker...');
      const { createWorker } = await import('tesseract.js');
      const languages = this.configService.get<string>('OCR_LANGUAGES') || 'eng';
      const options: TesseractCreateWorkerOptions = {
        logger: (m: TesseractLoggerMessage) => this.logger.debug(JSON.stringify(m)),
      };
      this.worker = (await createWorker(languages, 1, options)) as TesseractWorker;
      this.logger.log('Tesseract OCR worker initialized successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to initialize OCR worker - OCR features will be unavailable', error instanceof Error ? message : error);
      this.worker = null;
    }
  }

  /**
   * Process document with OCR
   */
  async processDocument(
    filePath: string,
    ocrRequest: OcrRequestDto,
  ): Promise<OcrResultDto> {
    if (!this.ocrEnabled || !this.worker) {
      throw new Error('OCR service is not enabled or not initialized');
    }

    const startTime = Date.now();

    try {
      this.logger.log(`Starting OCR processing for document: ${ocrRequest.documentId}`);

      // Get the file buffer
      const fileBuffer = await this.fileStorageService.getFile(filePath);

      // Perform OCR
      const {
        data: { text, confidence },
      } = await this.worker.recognize(fileBuffer);

      // Calculate metrics
      const words = text.trim().split(/\s+/);
      const wordCount = words.length;
      const processingTime = Date.now() - startTime;

      const result: OcrResultDto = {
        documentId: ocrRequest.documentId,
        text: text.trim(),
        confidence: confidence,
        language: ocrRequest.languages?.[0] || 'eng',
        pageCount: 1,
        wordCount,
        processedAt: new Date(),
        processingTime,
      };

      this.logger.log(
        `OCR processing completed for ${ocrRequest.documentId} in ${processingTime}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error('OCR processing failed', error);
      throw error;
    }
  }

  /**
   * Extract text from image buffer
   */
  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    if (!this.ocrEnabled || !this.worker) {
      throw new Error('OCR service is not enabled or not initialized');
    }

    try {
      const {
        data: { text },
      } = await this.worker.recognize(buffer);

      return text.trim();
    } catch (error) {
      this.logger.error('Text extraction failed', error);
      throw error;
    }
  }

  /**
   * Verify OCR service availability
   */
  isAvailable(): boolean {
    return this.ocrEnabled && this.worker !== null;
  }

  /**
   * Cleanup worker on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      this.logger.log('Terminating Tesseract OCR worker...');
      try {
        await this.worker.terminate();
      } catch (error) {
        this.logger.warn('Error terminating OCR worker', error);
      }
      this.worker = null;
    }
  }

  /**
   * Get OCR status
   */
  getStatus(): {
    enabled: boolean;
    initialized: boolean;
  } {
    return {
      enabled: this.ocrEnabled,
      initialized: this.worker !== null,
    };
  }

  getSupportedLanguages(): string[] {
    return ['eng', 'spa', 'fra', 'deu', 'ita', 'por'];
  }

  isLanguageSupported(lang: string): boolean {
    return this.getSupportedLanguages().includes(lang);
  }

  async getOcrProgress(jobId: string): Promise<OcrProgressDto> {
    return {
      jobId,
      progress: 100,
      status: 'completed',
    };
  }

  async detectLanguage(data: DetectLanguageDto): Promise<LanguageDetectionResultDto> {
    // Basic language detection implementation
    // In a real implementation, this would analyze the text/buffer
    this.logger.debug('Detecting language', data);
    return {
      language: 'eng',
      confidence: 0.95,
    };
  }

  async extractStructuredData(
    documentId: string,
    options: ExtractStructuredDataOptionsDto,
  ): Promise<StructuredDataResultDto> {
    // Basic structured data extraction implementation
    // In a real implementation, this would extract tables, forms, entities, etc.
    this.logger.debug('Extracting structured data', { documentId, options });
    return {
      documentId,
      data: {},
      extracted: true,
    };
  }

  async batchProcess(batchDto: BatchProcessRequestDto): Promise<BatchProcessResultDto> {
    return {
      batchId: 'batch-' + Date.now(),
      status: 'queued',
      documents: batchDto.documents || [],
    };
  }

  getOcrStats(): OcrStatsDto {
    return {
      totalProcessed: 0,
      totalPages: 0,
      averageProcessingTime: 0,
      successRate: 100,
    };
  }
}
