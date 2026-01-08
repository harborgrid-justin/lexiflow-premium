import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentClassification } from './entities/document-classification.entity';
import { RetentionPolicy } from './entities/retention-policy.entity';
import { DocumentTemplate } from './entities/document-template.entity';
import { FileStorageModule } from '@file-storage/file-storage.module';
import { ProcessingJobsModule } from '@processing-jobs/processing-jobs.module';
import { DocumentVersioningService } from './document-versioning.service';
import { DocumentComparisonService } from './document-comparison.service';
import { DocumentClassificationService } from './document-classification.service';
import { DocumentRetentionService } from './document-retention.service';
import { DocumentSearchService } from './document-search.service';

/**
 * Documents Module - Enterprise Document Management System
 *
 * Features:
 * - Document CRUD operations, file uploads, and processing
 * - Full version history with rollback capabilities
 * - Document comparison and diff generation
 * - AI-powered document classification
 * - Retention policy management and automated enforcement
 * - Full-text search with advanced filtering
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
    TypeOrmModule.forFeature([
      Document,
      DocumentVersion,
      DocumentClassification,
      RetentionPolicy,
      DocumentTemplate,
    ]),
    FileStorageModule,
    forwardRef(() => ProcessingJobsModule),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    DocumentVersioningService,
    DocumentComparisonService,
    DocumentClassificationService,
    DocumentRetentionService,
    DocumentSearchService,
  ],
  exports: [
    DocumentsService,
    DocumentVersioningService,
    DocumentComparisonService,
    DocumentClassificationService,
    DocumentRetentionService,
    DocumentSearchService,
  ],
})
export class DocumentsModule {}
