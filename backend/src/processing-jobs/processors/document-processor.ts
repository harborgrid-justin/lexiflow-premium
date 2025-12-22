import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ProcessingJobsService } from '../processing-jobs.service';
import { OcrService } from '../../ocr/ocr.service';
import { DocumentsService } from '../../documents/documents.service';
import { JobType, JobStatus } from '../dto/job-status.dto';

@Processor('document-processing')
export class DocumentProcessor {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private processingJobsService: ProcessingJobsService,
    private ocrService: OcrService,
    private documentsService: DocumentsService,
  ) {}

  @Process(JobType.OCR)
  async handleOcrJob(job: Job): Promise<void> {
    const { jobId, documentId, parameters } = job.data;

    try {
      this.logger.log(`Processing OCR job: ${jobId}`);

      // Update job status to processing
      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.PROCESSING,
        0,
      );

      // Get document
      const document = await this.documentsService.findOne(documentId);

      if (!document.filePath) {
        throw new Error('Document has no file');
      }

      // Process OCR
      const ocrResult = await this.ocrService.processDocument(
        document.filePath,
        {
          documentId,
          languages: parameters?.languages || ['eng'],
        },
      );

      // Update progress
      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.PROCESSING,
        50,
      );

      // Update document with OCR results
      await this.documentsService.markOcrProcessed(
        documentId,
        ocrResult.text,
      );

      // Complete job
      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.COMPLETED,
        100,
        {
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          wordCount: ocrResult.wordCount,
        },
      );

      this.logger.log(`OCR job completed: ${jobId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const _stack = error instanceof Error ? error._stack : undefined;
      this.logger.error(`OCR job failed: ${jobId}`, error);
      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.FAILED,
        undefined,
        undefined,
        message,
      );
    }
  }

  @Process(JobType.METADATA_EXTRACTION)
  async handleMetadataExtractionJob(job: Job): Promise<void> {
    const { jobId, _documentId } = job.data;

    try {
      this.logger.log(`Processing metadata extraction job: ${jobId}`);

      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.PROCESSING,
        0,
      );

      // Implement metadata extraction logic here
      // This is a placeholder for future implementation

      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.COMPLETED,
        100,
        { message: 'Metadata extraction completed' },
      );

      this.logger.log(`Metadata extraction job completed: ${jobId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const _stack = error instanceof Error ? error._stack : undefined;
      this.logger.error(`Metadata extraction job failed: ${jobId}`, error);
      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.FAILED,
        undefined,
        undefined,
        message,
      );
    }
  }

  @Process(JobType.REDACTION)
  async handleRedactionJob(job: Job): Promise<void> {
    const { jobId, _documentId, _parameters } = job.data;

    try {
      this.logger.log(`Processing redaction job: ${jobId}`);

      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.PROCESSING,
        0,
      );

      // Implement redaction logic here
      // This is a placeholder for future implementation

      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.COMPLETED,
        100,
        { message: 'Redaction completed' },
      );

      this.logger.log(`Redaction job completed: ${jobId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const _stack = error instanceof Error ? error._stack : undefined;
      this.logger.error(`Redaction job failed: ${jobId}`, error);
      await this.processingJobsService.updateJobStatus(
        jobId,
        JobStatus.FAILED,
        undefined,
        undefined,
        message,
      );
    }
  }
}
