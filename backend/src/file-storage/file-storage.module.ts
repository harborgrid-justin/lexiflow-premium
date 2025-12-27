import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileStorageService } from './file-storage.service';

/**
 * File Storage Module
 * Abstraction layer for file system and cloud storage operations
 * Features:
 * - Local file system storage
 * - Cloud storage integration (S3, Azure Blob)
 * - File upload and download handling
 * - Temporary file management and cleanup
 * 
 * Exports: FileStorageService for use by DocumentsModule, OcrModule, etc.
 */
@Module({
  imports: [ConfigModule],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
