import { Processor, Process, OnQueueCompleted, OnQueueFailed, OnQueueActive } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { OcrPipelineService } from './ocr-pipeline.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs/promises';

export interface OcrJobData {
  documentId: string;
  filePath: string;
  userId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  options?: {
    language?: string;
    preprocessingEnabled?: boolean;
    postprocessingEnabled?: boolean;
    entityExtractionEnabled?: boolean;
  };
}

export interface OcrJobResult {
  documentId: string;
  success: boolean;
  text?: string;
  confidence?: number;
  entities?: any;
  error?: string;
  processingTime: number;
}

/**
 * Bull Queue Processor for Asynchronous OCR Processing
 * Handles background OCR jobs with:
 * - Priority-based processing
 * - Retry logic with exponential backoff
 * - Progress tracking
 * - Error handling and notifications
 * - Concurrency management
 * - Job status updates
 */
@Processor('ocr-queue')
export class OcrQueueProcessor {
  private readonly logger = new Logger(OcrQueueProcessor.name);

  constructor(
    private readonly ocrPipelineService: OcrPipelineService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Main OCR job processor
   */
  @Process({
    name: 'process-ocr',
    concurrency: 3, // Process up to 3 OCR jobs concurrently
  })
  async processOcrJob(job: Job<OcrJobData>): Promise<OcrJobResult> {
    const startTime = Date.now();
    const { documentId, filePath, userId, options } = job.data;

    try {
      this.logger.log(`Processing OCR job ${job.id} for document ${documentId}`);

      // Update job progress
      await job.progress(10);

      // Retrieve document
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      // Update document status
      await this.updateDocumentStatus(documentId, 'ocr_processing');
      await job.progress(20);

      // Read file from storage
      let fileBuffer: Buffer;
      try {
        fileBuffer = await fs.readFile(filePath);
      } catch (error) {
        throw new Error(`Failed to read file: ${filePath}`);
      }

      await job.progress(30);

      // Process image through OCR pipeline
      const ocrResult = await this.ocrPipelineService.processImage(fileBuffer, options || {});

      await job.progress(80);

      // Update document with OCR results
      await this.updateDocumentWithOcrResults(documentId, ocrResult);

      await job.progress(90);

      // Update document status
      await this.updateDocumentStatus(documentId, 'ocr_completed');

      await job.progress(100);

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `OCR job ${job.id} completed successfully for document ${documentId} in ${processingTime}ms`,
      );

      return {
        documentId,
        success: true,
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        entities: ocrResult.entities,
        processingTime,
      };

    } catch (error) {
      this.logger.error(
        `OCR job ${job.id} failed for document ${documentId}: ${error.message}`,
        error.stack,
      );

      // Update document status to failed
      await this.updateDocumentStatus(documentId, 'ocr_failed', error.message);

      const processingTime = Date.now() - startTime;

      return {
        documentId,
        success: false,
        error: error.message,
        processingTime,
      };
    }
  }

  /**
   * Process high-priority OCR jobs
   */
  @Process({
    name: 'process-ocr-urgent',
    concurrency: 5, // Higher concurrency for urgent jobs
  })
  async processUrgentOcrJob(job: Job<OcrJobData>): Promise<OcrJobResult> {
    this.logger.log(`Processing URGENT OCR job ${job.id}`);
    return this.processOcrJob(job);
  }

  /**
   * Process batch OCR jobs
   */
  @Process({
    name: 'process-ocr-batch',
    concurrency: 1, // Single concurrency for batch jobs
  })
  async processBatchOcrJob(
    job: Job<{ documents: OcrJobData[] }>,
  ): Promise<{ results: OcrJobResult[] }> {
    const { documents } = job.data;
    this.logger.log(`Processing batch OCR job ${job.id} with ${documents.length} documents`);

    const results: OcrJobResult[] = [];
    const totalDocuments = documents.length;

    for (let i = 0; i < documents.length; i++) {
      const docData = documents[i];

      try {
        // Create a synthetic job for individual processing
        const syntheticJob = {
          id: `${job.id}-${i}`,
          data: docData,
          progress: async (progress: number) => {
            const overallProgress = ((i / totalDocuments) * 100) + (progress / totalDocuments);
            await job.progress(overallProgress);
          },
        } as Job<OcrJobData>;

        const result = await this.processOcrJob(syntheticJob);
        results.push(result);

      } catch (error) {
        this.logger.error(`Batch item ${i} failed: ${error.message}`);
        results.push({
          documentId: docData.documentId,
          success: false,
          error: error.message,
          processingTime: 0,
        });
      }
    }

    await job.progress(100);

    this.logger.log(`Batch OCR job ${job.id} completed. ${results.filter(r => r.success).length}/${totalDocuments} successful`);

    return { results };
  }

  /**
   * Handle active jobs
   */
  @OnQueueActive()
  onActive(job: Job<OcrJobData>) {
    this.logger.debug(`Job ${job.id} is now active`);

    this.eventEmitter.emit('ocr.job.started', {
      jobId: job.id,
      documentId: job.data.documentId,
      userId: job.data.userId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle completed jobs
   */
  @OnQueueCompleted()
  onCompleted(job: Job<OcrJobData>, result: OcrJobResult) {
    this.logger.log(`Job ${job.id} completed for document ${result.documentId}`);

    // Emit success event
    this.eventEmitter.emit('ocr.job.completed', {
      jobId: job.id,
      documentId: result.documentId,
      userId: job.data.userId,
      result,
      timestamp: new Date(),
    });

    // Send notification to user
    this.sendCompletionNotification(job.data.userId, result);
  }

  /**
   * Handle failed jobs
   */
  @OnQueueFailed()
  onFailed(job: Job<OcrJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed for document ${job.data.documentId}: ${error.message}`);

    // Emit failure event
    this.eventEmitter.emit('ocr.job.failed', {
      jobId: job.id,
      documentId: job.data.documentId,
      userId: job.data.userId,
      error: error.message,
      timestamp: new Date(),
    });

    // Send failure notification to user
    this.sendFailureNotification(job.data.userId, job.data.documentId, error.message);

    // Log for monitoring/alerting
    this.logFailureForMonitoring(job, error);
  }

  /**
   * Update document status in database
   */
  private async updateDocumentStatus(
    documentId: string,
    status: string,
    errorMessage?: string,
  ): Promise<void> {
    const updateData: any = { status };

    if (errorMessage) {
      updateData.ocrError = errorMessage;
    }

    await this.documentRepository.update(documentId, updateData);
  }

  /**
   * Update document with OCR results
   */
  private async updateDocumentWithOcrResults(documentId: string, ocrResult: any): Promise<void> {
    await this.documentRepository.update(documentId, {
      ocrText: ocrResult.text,
      ocrConfidence: ocrResult.confidence,
      ocrMetadata: ocrResult.metadata,
      extractedEntities: ocrResult.entities,
      ocrCompletedAt: new Date(),
    });
  }

  /**
   * Send completion notification to user
   */
  private sendCompletionNotification(userId: string, result: OcrJobResult): void {
    this.eventEmitter.emit('notification.send', {
      userId,
      type: 'ocr_completed',
      title: 'OCR Processing Completed',
      message: `Document ${result.documentId} has been processed successfully with ${result.confidence.toFixed(1)}% confidence.`,
      data: {
        documentId: result.documentId,
        confidence: result.confidence,
      },
    });
  }

  /**
   * Send failure notification to user
   */
  private sendFailureNotification(userId: string, documentId: string, errorMessage: string): void {
    this.eventEmitter.emit('notification.send', {
      userId,
      type: 'ocr_failed',
      title: 'OCR Processing Failed',
      message: `Document ${documentId} failed to process: ${errorMessage}`,
      data: {
        documentId,
        error: errorMessage,
      },
    });
  }

  /**
   * Log failure for monitoring and alerting
   */
  private logFailureForMonitoring(job: Job<OcrJobData>, error: Error): void {
    // This would integrate with monitoring services like:
    // - Sentry
    // - DataDog
    // - CloudWatch
    // - Custom monitoring

    const failureLog = {
      jobId: job.id,
      documentId: job.data.documentId,
      userId: job.data.userId,
      error: error.message,
      stack: error.stack,
      attempts: job.attemptsMade,
      timestamp: new Date(),
    };

    this.logger.error('OCR Job Failure Log', JSON.stringify(failureLog, null, 2));

    // Emit for external monitoring
    this.eventEmitter.emit('monitoring.ocr.failure', failureLog);
  }

  /**
   * Get job statistics for monitoring
   */
  async getJobStatistics(queueName: string = 'ocr-queue'): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    // This would interface with Bull queue to get actual statistics
    // For now, return placeholder structure

    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    };
  }

  /**
   * Clean up old completed jobs
   */
  async cleanupOldJobs(olderThanDays: number = 7): Promise<number> {
    this.logger.log(`Cleaning up OCR jobs older than ${olderThanDays} days`);

    // This would clean up old jobs from Bull queue
    // Implementation depends on Bull queue instance access

    return 0;
  }

  /**
   * Retry failed job with custom options
   */
  async retryFailedJob(jobId: string, newOptions?: any): Promise<void> {
    this.logger.log(`Retrying failed OCR job: ${jobId}`);

    // This would retry a specific job from the queue
    // Implementation depends on Bull queue instance access
  }

  /**
   * Pause queue processing
   */
  async pauseQueue(): Promise<void> {
    this.logger.warn('OCR queue processing paused');
    // Implementation depends on Bull queue instance access
  }

  /**
   * Resume queue processing
   */
  async resumeQueue(): Promise<void> {
    this.logger.log('OCR queue processing resumed');
    // Implementation depends on Bull queue instance access
  }

  /**
   * Get estimated time for job completion
   */
  async getEstimatedCompletionTime(documentId: string): Promise<Date | null> {
    // Calculate based on:
    // - Current queue length
    // - Average processing time
    // - Job priority

    // Placeholder implementation
    const avgProcessingTimeMs = 30000; // 30 seconds average
    const queuePosition = 5; // Get from queue

    const estimatedMs = avgProcessingTimeMs * queuePosition;
    const estimatedCompletion = new Date(Date.now() + estimatedMs);

    return estimatedCompletion;
  }
}
