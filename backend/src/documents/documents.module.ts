import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { ProcessingJobsModule } from '../processing-jobs/processing-jobs.module';

/**
 * Documents Module
 * Manages document CRUD operations, file uploads, and processing
 * 
 * Circular Dependency Note:
 * This module has a circular dependency with ProcessingJobsModule.
 * Documents need ProcessingJobs to trigger background processing.
 * ProcessingJobs need Documents to update document status.
 * Using forwardRef() to resolve this at runtime.
 * @see https://docs.nestjs.com/fundamentals/circular-dependency
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    FileStorageModule,
    forwardRef(() => ProcessingJobsModule),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
