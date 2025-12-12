import { Injectable, Logger } from '@nestjs/common';
import { OcrPreprocessingService } from './ocr-preprocessing.service';
import { OcrPostprocessingService } from './ocr-postprocessing.service';
import { LegalEntityExtractionService } from './legal-entity-extraction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Tesseract from 'tesseract.js';

export interface OcrPipelineOptions {
  language?: string;
  preprocessingEnabled?: boolean;
  postprocessingEnabled?: boolean;
  entityExtractionEnabled?: boolean;
  pageSegmentationMode?: number;
  ocrEngineMode?: number;
  confidence?: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
  pages: OcrPageResult[];
  processingTime: number;
  metadata: {
    language: string;
    totalWords: number;
    totalLines: number;
    averageConfidence: number;
  };
  entities?: any;
  warnings: string[];
}

export interface OcrPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  words: OcrWord[];
  lines: OcrLine[];
  blocks: OcrBlock[];
}

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface OcrLine {
  text: string;
  confidence: number;
  words: OcrWord[];
  bbox: BoundingBox;
}

export interface OcrBlock {
  text: string;
  confidence: number;
  lines: OcrLine[];
  bbox: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PipelineStage {
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

/**
 * Multi-Stage OCR Processing Pipeline
 * Orchestrates complete OCR workflow:
 * 1. Image preprocessing (enhancement, cleanup)
 * 2. OCR engine execution (Tesseract)
 * 3. Text postprocessing (cleanup, formatting)
 * 4. Entity extraction (legal entities)
 * 5. Confidence analysis and validation
 */
@Injectable()
export class OcrPipelineService {
  private readonly logger = new Logger(OcrPipelineService.name);
  private tesseractWorker: Tesseract.Worker;

  constructor(
    private readonly preprocessingService: OcrPreprocessingService,
    private readonly postprocessingService: OcrPostprocessingService,
    private readonly entityExtractionService: LegalEntityExtractionService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeTesseract();
  }

  /**
   * Initialize Tesseract OCR worker
   */
  private async initializeTesseract() {
    try {
      this.logger.log('Initializing Tesseract OCR worker...');
      this.tesseractWorker = await Tesseract.createWorker('eng');
      this.logger.log('Tesseract worker initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Tesseract: ${error.message}`);
    }
  }

  /**
   * Process image through complete OCR pipeline
   */
  async processImage(
    imageBuffer: Buffer,
    options: OcrPipelineOptions = {},
  ): Promise<OcrResult> {
    const startTime = Date.now();
    const stages: PipelineStage[] = [];
    const warnings: string[] = [];

    try {
      this.logger.log('Starting OCR pipeline processing');

      // Stage 1: Preprocessing
      let processedImage = imageBuffer;
      if (options.preprocessingEnabled !== false) {
        const preprocessStage = await this.executeStage('Preprocessing', async () => {
          return this.preprocessingService.preprocessImage(imageBuffer);
        });
        stages.push(preprocessStage);
        processedImage = preprocessStage.result.processedImage;

        if (preprocessStage.result.warnings) {
          warnings.push(...preprocessStage.result.warnings);
        }
      }

      // Stage 2: OCR Execution
      let ocrRawResult: any;
      const ocrStage = await this.executeStage('OCR Execution', async () => {
        return this.performOcr(processedImage, options);
      });
      stages.push(ocrStage);
      ocrRawResult = ocrStage.result;

      // Check confidence
      if (ocrRawResult.confidence < 60) {
        warnings.push(`Low OCR confidence: ${ocrRawResult.confidence.toFixed(2)}%`);
      }

      // Stage 3: Postprocessing
      let cleanedText = ocrRawResult.text;
      if (options.postprocessingEnabled !== false) {
        const postprocessStage = await this.executeStage('Postprocessing', async () => {
          return this.postprocessingService.postprocessText(ocrRawResult.text);
        });
        stages.push(postprocessStage);
        cleanedText = postprocessStage.result.cleanedText;

        if (postprocessStage.result.corrections > 0) {
          warnings.push(`Applied ${postprocessStage.result.corrections} text corrections`);
        }
      }

      // Stage 4: Entity Extraction
      let entities: any = null;
      if (options.entityExtractionEnabled !== false) {
        const entityStage = await this.executeStage('Entity Extraction', async () => {
          return this.entityExtractionService.extractEntities(cleanedText);
        });
        stages.push(entityStage);
        entities = entityStage.result;
      }

      // Generate pages
      const pages = this.generatePageResults(ocrRawResult);

      // Calculate metadata
      const metadata = this.calculateMetadata(cleanedText, pages, options.language || 'eng');

      const processingTime = Date.now() - startTime;

      // Emit completion event
      this.eventEmitter.emit('ocr.completed', {
        processingTime,
        confidence: ocrRawResult.confidence,
        wordCount: metadata.totalWords,
      });

      this.logger.log(`OCR pipeline completed in ${processingTime}ms`);

      return {
        text: cleanedText,
        confidence: ocrRawResult.confidence,
        pages,
        processingTime,
        metadata,
        entities,
        warnings,
      };

    } catch (error) {
      this.logger.error(`OCR pipeline failed: ${error.message}`, error.stack);

      this.eventEmitter.emit('ocr.failed', {
        error: error.message,
        stages,
      });

      throw error;
    }
  }

  /**
   * Execute a pipeline stage with error handling
   */
  private async executeStage(
    stageName: string,
    stageFunction: () => Promise<any>,
  ): Promise<PipelineStage> {
    const stage: PipelineStage = {
      name: stageName,
      startTime: new Date(),
      status: 'processing',
    };

    try {
      this.logger.debug(`Executing OCR stage: ${stageName}`);
      stage.result = await stageFunction();
      stage.status = 'completed';
      stage.endTime = new Date();
      stage.duration = stage.endTime.getTime() - stage.startTime.getTime();
      this.logger.debug(`Stage completed: ${stageName} (${stage.duration}ms)`);
    } catch (error) {
      stage.status = 'failed';
      stage.error = error.message;
      stage.endTime = new Date();
      stage.duration = stage.endTime.getTime() - stage.startTime.getTime();
      this.logger.error(`Stage failed: ${stageName} - ${error.message}`);
      throw error;
    }

    return stage;
  }

  /**
   * Perform OCR using Tesseract
   */
  private async performOcr(imageBuffer: Buffer, options: OcrPipelineOptions): Promise<any> {
    try {
      if (!this.tesseractWorker) {
        await this.initializeTesseract();
      }

      // Set language if specified
      if (options.language) {
        await this.tesseractWorker.loadLanguage(options.language);
        await this.tesseractWorker.initialize(options.language);
      }

      // Perform OCR
      const result = await this.tesseractWorker.recognize(imageBuffer);

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words,
        lines: result.data.lines,
        blocks: result.data.blocks,
        paragraphs: result.data.paragraphs,
      };

    } catch (error) {
      this.logger.error(`Tesseract OCR failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate page results from OCR output
   */
  private generatePageResults(ocrResult: any): OcrPageResult[] {
    const pages: OcrPageResult[] = [];

    // For single-page processing, create one page result
    const page: OcrPageResult = {
      pageNumber: 1,
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      words: this.convertWords(ocrResult.words),
      lines: this.convertLines(ocrResult.lines),
      blocks: this.convertBlocks(ocrResult.blocks),
    };

    pages.push(page);

    return pages;
  }

  /**
   * Convert Tesseract words to our format
   */
  private convertWords(tesseractWords: any[]): OcrWord[] {
    if (!tesseractWords) return [];

    return tesseractWords.map(word => ({
      text: word.text,
      confidence: word.confidence,
      bbox: {
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
      },
    }));
  }

  /**
   * Convert Tesseract lines to our format
   */
  private convertLines(tesseractLines: any[]): OcrLine[] {
    if (!tesseractLines) return [];

    return tesseractLines.map(line => ({
      text: line.text,
      confidence: line.confidence,
      words: this.convertWords(line.words),
      bbox: {
        x: line.bbox.x0,
        y: line.bbox.y0,
        width: line.bbox.x1 - line.bbox.x0,
        height: line.bbox.y1 - line.bbox.y0,
      },
    }));
  }

  /**
   * Convert Tesseract blocks to our format
   */
  private convertBlocks(tesseractBlocks: any[]): OcrBlock[] {
    if (!tesseractBlocks) return [];

    return tesseractBlocks.map(block => ({
      text: block.text,
      confidence: block.confidence,
      lines: this.convertLines(block.lines),
      bbox: {
        x: block.bbox.x0,
        y: block.bbox.y0,
        width: block.bbox.x1 - block.bbox.x0,
        height: block.bbox.y1 - block.bbox.y0,
      },
    }));
  }

  /**
   * Calculate metadata from OCR results
   */
  private calculateMetadata(text: string, pages: OcrPageResult[], language: string): any {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const lines = text.split('\n').filter(l => l.trim().length > 0);

    let totalConfidence = 0;
    let wordCount = 0;

    for (const page of pages) {
      for (const word of page.words) {
        totalConfidence += word.confidence;
        wordCount++;
      }
    }

    const averageConfidence = wordCount > 0 ? totalConfidence / wordCount : 0;

    return {
      language,
      totalWords: words.length,
      totalLines: lines.length,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
    };
  }

  /**
   * Process multiple images in batch
   */
  async processBatch(
    images: Array<{ buffer: Buffer; fileName: string }>,
    options: OcrPipelineOptions = {},
  ): Promise<Array<{ fileName: string; result: OcrResult | null; error?: string }>> {
    this.logger.log(`Starting batch OCR processing of ${images.length} images`);

    const results: Array<{ fileName: string; result: OcrResult | null; error?: string }> = [];

    for (const image of images) {
      try {
        const result = await this.processImage(image.buffer, options);
        results.push({
          fileName: image.fileName,
          result,
        });
      } catch (error) {
        this.logger.error(`Batch OCR failed for ${image.fileName}: ${error.message}`);
        results.push({
          fileName: image.fileName,
          result: null,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Process PDF document (page by page)
   */
  async processPdfDocument(
    pdfBuffer: Buffer,
    options: OcrPipelineOptions = {},
  ): Promise<OcrResult[]> {
    // This would integrate with pdf-lib or similar to extract pages
    // For now, return placeholder
    this.logger.log('PDF OCR processing requires pdf-lib integration');

    throw new Error('PDF OCR not yet implemented - requires pdf-lib integration');
  }

  /**
   * Validate OCR quality and confidence
   */
  async validateOcrQuality(result: OcrResult): Promise<{
    isValid: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check overall confidence
    if (result.confidence < 70) {
      issues.push('Low overall confidence');
      score -= 30;
      recommendations.push('Consider rescanning with higher resolution');
    } else if (result.confidence < 85) {
      issues.push('Medium confidence - some errors may exist');
      score -= 15;
      recommendations.push('Review text carefully for errors');
    }

    // Check for warnings
    if (result.warnings.length > 0) {
      score -= result.warnings.length * 5;
    }

    // Check word count
    if (result.metadata.totalWords < 10) {
      issues.push('Very low word count detected');
      score -= 20;
      recommendations.push('Verify image contains readable text');
    }

    // Check for gibberish patterns
    const gibberishRatio = this.detectGibberish(result.text);
    if (gibberishRatio > 0.3) {
      issues.push('High gibberish ratio detected');
      score -= 25;
      recommendations.push('Image quality may be too low for accurate OCR');
    }

    score = Math.max(0, score);

    return {
      isValid: score >= 70,
      score,
      issues,
      recommendations,
    };
  }

  /**
   * Detect gibberish in text
   */
  private detectGibberish(text: string): number {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 1;

    let gibberishCount = 0;

    for (const word of words) {
      // Check for excessive consonants or non-standard patterns
      const consonantRatio = (word.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length / word.length;

      if (consonantRatio > 0.8 || word.length > 20 || /[^a-zA-Z0-9\s.,!?;:'"-]/.test(word)) {
        gibberishCount++;
      }
    }

    return gibberishCount / words.length;
  }

  /**
   * Cleanup Tesseract worker on service destruction
   */
  async onModuleDestroy() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.logger.log('Tesseract worker terminated');
    }
  }

  /**
   * Get OCR statistics for monitoring
   */
  getStatistics(): any {
    return {
      workerStatus: this.tesseractWorker ? 'initialized' : 'not_initialized',
      supportedLanguages: ['eng', 'spa', 'fra', 'deu'], // Tesseract supported languages
    };
  }
}
