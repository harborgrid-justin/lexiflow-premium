import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentVersionsController } from './document-versions.controller';
import { DocumentVersionsService } from './document-versions.service';
import { DocumentVersion } from './entities/document-version.entity';
import { VersionChange } from './entities/version-change.entity';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { VersionComparisonService } from './services/version-comparison.service';
import { ChangeTrackingService } from './services/change-tracking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentVersion, VersionChange]),
    FileStorageModule,
  ],
  controllers: [DocumentVersionsController],
  providers: [
    DocumentVersionsService,
    VersionComparisonService,
    ChangeTrackingService,
  ],
  exports: [
    DocumentVersionsService,
    VersionComparisonService,
    ChangeTrackingService,
  ],
})
export class DocumentVersionsModule {}
