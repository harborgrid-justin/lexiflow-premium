import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWorker, Worker } from 'tesseract.js';
import { FileStorageService } from '../file-storage/file-storage.service';
import { OcrRequestDto, OcrResultDto } from './dto/ocr-request.dto';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private worker: Worker | null = null;
  private readonly ocrEnabled: boolean;

  constructor(
    private configService: ConfigService,
    private fileStorageService: FileStorageService,
  ) {
    this.ocrEnabled = this.configService.get<boolean>('OCR_ENABLED') !== false;
    if (this.ocrEnabled) {
      this.initializeWorker();
    }
  }

  /**
   * Initialize Tesseract worker
   */
  private async initializeWorker(): Promise<void> {
    try {
      this.logger.log('Initializing Tesseract OCR worker...');
      this.worker = await createWorker();
      const languages = this.configService.get<string>('OCR_LANGUAGES') || 'eng';
      await this.worker.loadLanguage(languages);
      await this.worker.initialize(languages);
      this.logger.log('Tesseract OCR worker initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize OCR worker', error);
      this.ocrEnabled = false;
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
        pageCount: 1, // This is simplified; actual page count would need PDF parsing
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
  async extractTextFromBuffer(
    buffer: Buffer,
    languages: string[] = ['eng'],
  ): Promise<string> {
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
      await this.worker.terminate();
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
}
