import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ProcessingJobsController } from './processing-jobs.controller';
import { ProcessingJobsService } from './processing-jobs.service';
import { ProcessingJob } from './entities/processing-job.entity';
import { DocumentProcessor } from './processors/document-processor';
import { OcrModule } from '../ocr/ocr.module';
import { DocumentsModule } from '../documents/documents.module';

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
