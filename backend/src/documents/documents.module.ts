import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { ProcessingJobsModule } from '../processing-jobs/processing-jobs.module';

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
