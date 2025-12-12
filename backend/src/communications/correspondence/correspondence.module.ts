import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrespondenceController } from './correspondence.controller';
import { CorrespondenceService } from './correspondence.service';

/**
 * Correspondence Module
 *
 * Provides legal correspondence management functionality
 * Handles letters, emails, faxes, notices, and legal documents
 *
 * @module CorrespondenceModule
 */
@Module({
  imports: [
    // TypeORM entities will be imported here once created by Agent 1
    // TypeOrmModule.forFeature([CommunicationItem, Attachment]),
  ],
  controllers: [CorrespondenceController],
  providers: [CorrespondenceService],
  exports: [CorrespondenceService],
})
export class CorrespondenceModule {}
