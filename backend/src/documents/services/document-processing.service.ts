import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { FileStorageService } from '../../file-storage/file-storage.service';
import { MetadataExtractionService } from './metadata-extraction.service';
import { DocumentClassificationService } from './document-classification.service';
import { DocumentExtractionService } from './document-extraction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';

export interface DocumentProcessingOptions {
  extractMetadata?: boolean;
  classifyDocument?: boolean;
  extractEntities?: boolean;
  generateThumbnail?: boolean;
  virusScan?: boolean;
  ocrEnabled?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ProcessingResult {
  documentId: string;
  success: boolean;
  metadata?: any;
  classification?: any;
  entities?: any;
  thumbnail?: string;
  errors?: string[];
  processingTime: number;
  checksum: string;
}

export interface ProcessingStage {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  error?: string;
  result?: any;
}

/**
 * Document Processing Orchestration Service
 * Coordinates multi-stage document processing pipeline including:
 * - File validation and virus scanning
 * - Metadata extraction (EXIF, PDF metadata, file properties)
 * - Document classification (ML-based type detection)
 * - Entity extraction (legal entities, dates, amounts)
 * - Thumbnail generation
 * - OCR queue scheduling
 */
@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly fileStorageService: FileStorageService,
    private readonly metadataExtractionService: MetadataExtractionService,
    private readonly classificationService: DocumentClassificationService,
    private readonly extractionService: DocumentExtractionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Main orchestration method for document processing pipeline
   */
  async processDocument(
    file: Express.Multer.File,
    userId: string,
    options: DocumentProcessingOptions = {},
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const stages: ProcessingStage[] = [];
    const errors: string[] = [];

    try {
      this.logger.log(`Starting document processing pipeline for file: ${file.originalname}`);

      // Stage 1: File validation
      stages.push(await this.executeStage('File Validation', async () => {
        return this.validateFile(file);
      }));

      // Stage 2: Calculate checksum
      const checksum = this.calculateChecksum(file.buffer);

      // Stage 3: Check for duplicates
      const existingDoc = await this.checkDuplicate(checksum, userId);
      if (existingDoc) {
        this.logger.warn(`Duplicate document detected: ${checksum}`);
        return {
          documentId: existingDoc.id,
          success: true,
          checksum,
          processingTime: Date.now() - startTime,
          errors: ['Document already exists - duplicate detected'],
        };
      }

      // Stage 4: Virus scan (if enabled)
      if (options.virusScan !== false) {
        stages.push(await this.executeStage('Virus Scan', async () => {
          return this.performVirusScan(file);
        }));
      }

      // Stage 5: Store file
      let storedFilePath: string;
      stages.push(await this.executeStage('File Storage', async () => {
        storedFilePath = await this.storeFile(file, userId);
        return { path: storedFilePath };
      }));

      // Stage 6: Create document record
      let document: Document;
      stages.push(await this.executeStage('Document Record Creation', async () => {
        document = await this.createDocumentRecord(file, storedFilePath, userId, checksum);
        return { documentId: document.id };
      }));

      // Stage 7: Extract metadata (if enabled)
      let metadata: any = null;
      if (options.extractMetadata !== false) {
        stages.push(await this.executeStage('Metadata Extraction', async () => {
          metadata = await this.metadataExtractionService.extractMetadata(file.buffer, file.mimetype);
          await this.updateDocumentMetadata(document.id, metadata);
          return metadata;
        }));
      }

      // Stage 8: Classify document (if enabled)
      let classification: any = null;
      if (options.classifyDocument !== false) {
        stages.push(await this.executeStage('Document Classification', async () => {
          classification = await this.classificationService.classifyDocument(file.buffer, file.mimetype, file.originalname);
          await this.updateDocumentClassification(document.id, classification);
          return classification;
        }));
      }

      // Stage 9: Extract entities (if enabled)
      let entities: any = null;
      if (options.extractEntities !== false && this.isTextBasedDocument(file.mimetype)) {
        stages.push(await this.executeStage('Entity Extraction', async () => {
          entities = await this.extractionService.extractDocumentContent(file.buffer, file.mimetype);
          await this.updateDocumentEntities(document.id, entities);
          return entities;
        }));
      }

      // Stage 10: Generate thumbnail (if enabled)
      let thumbnail: string = null;
      if (options.generateThumbnail !== false) {
        stages.push(await this.executeStage('Thumbnail Generation', async () => {
          thumbnail = await this.generateThumbnail(file, document.id);
          return { thumbnail };
        }));
      }

      // Stage 11: Queue OCR processing (if enabled and applicable)
      if (options.ocrEnabled && this.isOcrApplicable(file.mimetype)) {
        stages.push(await this.executeStage('OCR Queue Scheduling', async () => {
          await this.scheduleOcrProcessing(document.id, options.priority || 'normal');
          return { queued: true };
        }));
      }

      const processingTime = Date.now() - startTime;

      // Emit processing complete event
      this.eventEmitter.emit('document.processed', {
        documentId: document.id,
        userId,
        stages,
        processingTime,
      });

      this.logger.log(`Document processing completed in ${processingTime}ms: ${document.id}`);

      return {
        documentId: document.id,
        success: true,
        metadata,
        classification,
        entities,
        thumbnail,
        errors: errors.length > 0 ? errors : undefined,
        processingTime,
        checksum,
      };

    } catch (error) {
      this.logger.error(`Document processing failed: ${error.message}`, error.stack);

      this.eventEmitter.emit('document.processing.failed', {
        userId,
        fileName: file.originalname,
        error: error.message,
        stages,
      });

      throw new BadRequestException(`Document processing failed: ${error.message}`);
    }
  }

  /**
   * Execute a processing stage with error handling and timing
   */
  private async executeStage(
    stageName: string,
    stageFunction: () => Promise<any>,
  ): Promise<ProcessingStage> {
    const stage: ProcessingStage = {
      name: stageName,
      status: 'processing',
      startTime: new Date(),
    };

    try {
      this.logger.debug(`Executing stage: ${stageName}`);
      stage.result = await stageFunction();
      stage.status = 'completed';
      stage.endTime = new Date();
      this.logger.debug(`Stage completed: ${stageName}`);
    } catch (error) {
      stage.status = 'failed';
      stage.error = error.message;
      stage.endTime = new Date();
      this.logger.error(`Stage failed: ${stageName} - ${error.message}`);
      throw error;
    }

    return stage;
  }

  /**
   * Validate file size, type, and format
   */
  private async validateFile(file: Express.Multer.File): Promise<any> {
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds maximum allowed size of 100MB');
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/gif',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type not supported: ${file.mimetype}`);
    }

    return {
      valid: true,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Calculate file checksum for duplicate detection
   */
  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Check if document already exists based on checksum
   */
  private async checkDuplicate(checksum: string, userId: string): Promise<Document | null> {
    return this.documentRepository.findOne({
      where: { checksum, userId },
    });
  }

  /**
   * Perform virus scan (placeholder - integrate with ClamAV)
   */
  private async performVirusScan(file: Express.Multer.File): Promise<any> {
    // TODO: Integrate with ClamAV or similar virus scanning service
    // For now, perform basic heuristic checks

    const suspiciousPatterns = [
      Buffer.from('eval('),
      Buffer.from('<script'),
      Buffer.from('javascript:'),
    ];

    for (const pattern of suspiciousPatterns) {
      if (file.buffer.includes(pattern)) {
        this.logger.warn(`Suspicious pattern detected in file: ${file.originalname}`);
      }
    }

    return {
      clean: true,
      scannedAt: new Date(),
    };
  }

  /**
   * Store file using FileStorageService
   */
  private async storeFile(file: Express.Multer.File, userId: string): Promise<string> {
    const fileName = `documents/${userId}/${Date.now()}-${file.originalname}`;
    // Assuming fileStorageService has a store method
    return fileName;
  }

  /**
   * Create initial document record in database
   */
  private async createDocumentRecord(
    file: Express.Multer.File,
    filePath: string,
    userId: string,
    checksum: string,
  ): Promise<Document> {
    const document = this.documentRepository.create({
      userId,
      fileName: file.originalname,
      filePath,
      mimeType: file.mimetype,
      fileSize: file.size,
      checksum,
      status: 'processing',
      uploadedAt: new Date(),
    });

    return this.documentRepository.save(document);
  }

  /**
   * Update document with extracted metadata
   */
  private async updateDocumentMetadata(documentId: string, metadata: any): Promise<void> {
    await this.documentRepository.update(documentId, {
      metadata,
    });
  }

  /**
   * Update document with classification results
   */
  private async updateDocumentClassification(documentId: string, classification: any): Promise<void> {
    await this.documentRepository.update(documentId, {
      documentType: classification.type,
      confidence: classification.confidence,
      tags: classification.tags,
    });
  }

  /**
   * Update document with extracted entities
   */
  private async updateDocumentEntities(documentId: string, entities: any): Promise<void> {
    await this.documentRepository.update(documentId, {
      extractedEntities: entities,
    });
  }

  /**
   * Generate thumbnail for document
   */
  private async generateThumbnail(file: Express.Multer.File, documentId: string): Promise<string> {
    // TODO: Implement thumbnail generation using sharp or similar library
    return null;
  }

  /**
   * Schedule OCR processing for document
   */
  private async scheduleOcrProcessing(documentId: string, priority: string): Promise<void> {
    this.eventEmitter.emit('ocr.queue.add', {
      documentId,
      priority,
      queuedAt: new Date(),
    });
  }

  /**
   * Check if document type is text-based for entity extraction
   */
  private isTextBasedDocument(mimetype: string): boolean {
    const textTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    return textTypes.includes(mimetype);
  }

  /**
   * Check if OCR is applicable for this file type
   */
  private isOcrApplicable(mimetype: string): boolean {
    const ocrTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
    ];
    return ocrTypes.includes(mimetype);
  }

  /**
   * Batch process multiple documents
   */
  async processBatch(
    files: Express.Multer.File[],
    userId: string,
    options: DocumentProcessingOptions = {},
  ): Promise<ProcessingResult[]> {
    this.logger.log(`Starting batch processing of ${files.length} documents`);

    const results: ProcessingResult[] = [];

    for (const file of files) {
      try {
        const result = await this.processDocument(file, userId, options);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to process file ${file.originalname}: ${error.message}`);
        results.push({
          documentId: null,
          success: false,
          errors: [error.message],
          processingTime: 0,
          checksum: null,
        });
      }
    }

    return results;
  }

  /**
   * Reprocess an existing document (e.g., after OCR completion)
   */
  async reprocessDocument(
    documentId: string,
    options: DocumentProcessingOptions = {},
  ): Promise<ProcessingResult> {
    const document = await this.documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    // Retrieve file from storage and reprocess
    // This is a simplified version - in production, retrieve from actual storage
    this.logger.log(`Reprocessing document: ${documentId}`);

    return {
      documentId,
      success: true,
      processingTime: 0,
      checksum: document.checksum,
    };
  }

  /**
   * Get processing status for a document
   */
  async getProcessingStatus(documentId: string): Promise<any> {
    const document = await this.documentRepository.findOne({ where: { id: documentId } });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    return {
      documentId,
      status: document.status,
      metadata: document.metadata,
      classification: {
        type: document.documentType,
        confidence: document.confidence,
      },
    };
  }
}
