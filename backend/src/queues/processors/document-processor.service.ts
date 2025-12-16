import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../constants';

export interface DocumentProcessingJob {
  documentId: string;
  operation: 'ocr' | 'extract' | 'analyze' | 'index';
  options?: any;
}

@Processor(QUEUE_NAMES.DOCUMENT_PROCESSING)
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  // Note: OCR processing is handled by ProcessingJobsModule's DocumentProcessor
  // to avoid duplicate handler registration

  @Process('extract')
  async handleExtraction(job: Job<DocumentProcessingJob>) {
    this.logger.log(`Extracting data from document: ${job.data.documentId}`);

    try {
      // Simulate data extraction
      await this.delay(3000);

      this.logger.log(
        `Extraction completed for document: ${job.data.documentId}`,
      );
      return { success: true, documentId: job.data.documentId };
    } catch (error) {
      this.logger.error(`Extraction failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('analyze')
  async handleAnalysis(job: Job<DocumentProcessingJob>) {
    this.logger.log(`Analyzing document: ${job.data.documentId}`);

    try {
      // Simulate document analysis
      await this.delay(4000);

      this.logger.log(`Analysis completed for document: ${job.data.documentId}`);
      return { success: true, documentId: job.data.documentId };
    } catch (error) {
      this.logger.error(`Analysis failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('index')
  async handleIndexing(job: Job<DocumentProcessingJob>) {
    this.logger.log(`Indexing document: ${job.data.documentId}`);

    try {
      // Simulate document indexing
      await this.delay(2000);

      this.logger.log(`Indexing completed for document: ${job.data.documentId}`);
      return { success: true, documentId: job.data.documentId };
    } catch (error) {
      this.logger.error(`Indexing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
