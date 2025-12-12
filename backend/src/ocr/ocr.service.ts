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

      // Load language if different from current
      const languages = ocrRequest.languages || ['eng'];
      const languageString = languages.join('+');

      // Reload worker with requested languages if needed
      await this.worker.loadLanguage(languageString);
      await this.worker.initialize(languageString);

      // Perform OCR with quality settings
      const {
        data: { text, confidence, lines, words },
      } = await this.worker.recognize(fileBuffer, {
        rotateAuto: true,
        rotateRadians: 0,
      });

      // Calculate detailed confidence metrics
      const confidenceMetrics = this.calculateConfidenceMetrics(lines, words);

      // Calculate metrics
      const wordArray = text.trim().split(/\s+/);
      const wordCount = wordArray.length;
      const processingTime = Date.now() - startTime;

      // Detect actual language from text
      const detectedLanguage = this.detectLanguageFromText(text);

      const result: OcrResultDto = {
        documentId: ocrRequest.documentId,
        text: text.trim(),
        confidence: confidence,
        language: detectedLanguage || languages[0],
        pageCount: 1, // This is simplified; actual page count would need PDF parsing
        wordCount,
        processedAt: new Date(),
        processingTime,
        confidenceMetrics,
      };

      this.logger.log(
        `OCR processing completed for ${ocrRequest.documentId} in ${processingTime}ms with ${confidence.toFixed(2)}% confidence`,
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

  /**
   * Calculate detailed confidence metrics from OCR results
   */
  private calculateConfidenceMetrics(lines: any, words: any): {
    averageWordConfidence: number;
    averageLineConfidence: number;
    lowConfidenceWords: number;
    lowConfidenceThreshold: number;
  } {
    const lowConfidenceThreshold = 60;
    let totalWordConfidence = 0;
    let totalLineConfidence = 0;
    let lowConfidenceWords = 0;
    let wordCount = 0;

    if (words && Array.isArray(words)) {
      words.forEach((word: any) => {
        if (word.confidence !== undefined) {
          totalWordConfidence += word.confidence;
          wordCount++;
          if (word.confidence < lowConfidenceThreshold) {
            lowConfidenceWords++;
          }
        }
      });
    }

    if (lines && Array.isArray(lines)) {
      lines.forEach((line: any) => {
        if (line.confidence !== undefined) {
          totalLineConfidence += line.confidence;
        }
      });
    }

    return {
      averageWordConfidence: wordCount > 0 ? totalWordConfidence / wordCount : 0,
      averageLineConfidence: lines?.length > 0 ? totalLineConfidence / lines.length : 0,
      lowConfidenceWords,
      lowConfidenceThreshold,
    };
  }

  /**
   * Detect language from text using simple heuristics
   */
  private detectLanguageFromText(text: string): string {
    // Simple language detection based on common words
    const commonWords: Record<string, string[]> = {
      eng: ['the', 'and', 'is', 'of', 'to', 'in', 'that', 'for', 'with'],
      spa: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'por', 'con'],
      fra: ['le', 'de', 'un', 'et', 'être', 'à', 'il', 'que', 'dans'],
      deu: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit'],
      ita: ['il', 'di', 'e', 'la', 'per', 'che', 'in', 'un', 'con'],
      por: ['o', 'de', 'e', 'a', 'que', 'em', 'um', 'para', 'com'],
    };

    const textLower = text.toLowerCase();
    const scores: Record<string, number> = {};

    for (const [lang, words] of Object.entries(commonWords)) {
      scores[lang] = 0;
      words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = textLower.match(regex);
        if (matches) {
          scores[lang] += matches.length;
        }
      });
    }

    // Find language with highest score
    let maxScore = 0;
    let detectedLang = 'eng';

    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang;
      }
    }

    return detectedLang;
  }

  /**
   * Process document with multiple languages
   */
  async processMultiLanguageDocument(
    filePath: string,
    ocrRequest: OcrRequestDto,
  ): Promise<OcrResultDto[]> {
    if (!this.ocrEnabled || !this.worker) {
      throw new Error('OCR service is not enabled or not initialized');
    }

    const results: OcrResultDto[] = [];
    const languages = ocrRequest.languages || ['eng'];

    // Process document with each language
    for (const language of languages) {
      try {
        const result = await this.processDocument(filePath, {
          ...ocrRequest,
          languages: [language],
        });
        results.push(result);
      } catch (error) {
        this.logger.warn(`Failed to process with language ${language}`, error);
      }
    }

    return results;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return [
      'eng', // English
      'spa', // Spanish
      'fra', // French
      'deu', // German
      'ita', // Italian
      'por', // Portuguese
      'rus', // Russian
      'chi_sim', // Chinese Simplified
      'chi_tra', // Chinese Traditional
      'jpn', // Japanese
      'kor', // Korean
      'ara', // Arabic
    ];
  }
}
