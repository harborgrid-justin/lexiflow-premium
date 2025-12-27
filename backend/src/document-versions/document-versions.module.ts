import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentVersionsController } from './document-versions.controller';
import { DocumentVersionsService } from './document-versions.service';
import { DocumentVersion } from './entities/document-version.entity';
import { FileStorageModule } from '@file-storage/file-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentVersion]),
    FileStorageModule,
  ],
  controllers: [DocumentVersionsController],
  providers: [DocumentVersionsService],
  exports: [DocumentVersionsService],
})
export class DocumentVersionsModule {}
