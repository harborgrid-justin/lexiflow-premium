import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController, DocumentTemplatesController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { DocumentTemplate } from './entities/document-template.entity';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { ProcessingJobsModule } from '../processing-jobs/processing-jobs.module';
import { MetadataExtractionService } from './services/metadata-extraction.service';
import { DocumentTemplateService } from './services/document-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentTemplate]),
    FileStorageModule,
    forwardRef(() => ProcessingJobsModule),
  ],
  controllers: [DocumentsController, DocumentTemplatesController],
  providers: [
    DocumentsService,
    MetadataExtractionService,
    DocumentTemplateService,
  ],
  exports: [
    DocumentsService,
    MetadataExtractionService,
    DocumentTemplateService,
  ],
})
export class DocumentsModule {}
