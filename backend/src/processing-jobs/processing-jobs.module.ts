import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ProcessingJobsController } from './processing-jobs.controller';
import { ProcessingJobsService } from './processing-jobs.service';
import { ProcessingJob } from './entities/processing-job.entity';
import { DocumentProcessor } from './processors/document-processor';
import { OcrModule } from '@ocr/ocr.module';
import { DocumentsModule } from '@documents/documents.module';

/**
 * Processing Jobs Module
 * Handles background document processing with Bull queues
 * 
 * Circular Dependency Note:
 * This module has a circular dependency with DocumentsModule.
 * ProcessingJobs need Documents to read/update document metadata.
 * Documents need ProcessingJobs to create processing tasks.
 * Using forwardRef() to resolve this at runtime.
 * @see https://docs.nestjs.com/fundamentals/circular-dependency
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProcessingJob]),
    BullModule.registerQueue({
      name: 'document-processing',
    }),
    OcrModule,
    forwardRef(() => DocumentsModule),
  ],
  controllers: [ProcessingJobsController],
  providers: [ProcessingJobsService, DocumentProcessor],
  exports: [ProcessingJobsService],
})
export class ProcessingJobsModule {}
