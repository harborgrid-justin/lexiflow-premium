import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MasterConfig from '@config/master.config';

/**
 * FileStorageConfigService
 *
 * Provides globally injectable access to file storage configuration.
 * Consolidates max size, MIME types, temp cleanup, and security settings.
 */
@Injectable()
export class FileStorageConfigService {
  constructor(private readonly configService: ConfigService) {}

  // File Size Limits
  get maxFileSize(): number {
    return MasterConfig.FILE_MAX_SIZE;
  }

  get maxUploadSize(): number {
    return MasterConfig.MAX_FILE_SIZE;
  }

  get minDiskSpace(): number {
    return MasterConfig.FILE_MIN_DISK_SPACE;
  }

  get chunkSize(): number {
    return MasterConfig.FILE_CHUNK_SIZE;
  }

  // Upload Settings
  get uploadDir(): string {
    return this.configService.get<string>('app.fileStorage.uploadDir') || './uploads';
  }

  get uploadTimeoutMs(): number {
    return MasterConfig.FILE_UPLOAD_TIMEOUT_MS;
  }

  // MIME Types
  get allowedMimeTypes(): string[] {
    return MasterConfig.FILE_ALLOWED_MIME_TYPES;
  }

  get prohibitedExtensions(): string[] {
    return MasterConfig.FILE_PROHIBITED_EXTENSIONS;
  }

  // Security & Processing
  get enableVirusScan(): boolean {
    return MasterConfig.FILE_ENABLE_VIRUS_SCAN;
  }

  get autoDeleteTemp(): boolean {
    return MasterConfig.FILE_AUTO_DELETE_TEMP;
  }

  get tempCleanupIntervalMs(): number {
    return MasterConfig.FILE_TEMP_CLEANUP_INTERVAL_MS;
  }

  // Features
  get enableDeduplication(): boolean {
    return MasterConfig.FILE_ENABLE_DEDUPLICATION;
  }

  get enableVersioning(): boolean {
    return MasterConfig.FILE_ENABLE_VERSIONING;
  }

  /**
   * Check if a MIME type is allowed
   */
  isMimeTypeAllowed(mimeType: string): boolean {
    return this.allowedMimeTypes.includes(mimeType);
  }

  /**
   * Check if a file extension is prohibited
   */
  isExtensionProhibited(extension: string): boolean {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    return this.prohibitedExtensions.includes(ext.toLowerCase());
  }

  /**
   * Check if file size is within limits
   */
  isFileSizeValid(sizeInBytes: number): boolean {
    return sizeInBytes <= this.maxFileSize;
  }

  /**
   * Get upload configuration
   */
  getUploadConfig(): Record<string, unknown> {
    return {
      dir: this.uploadDir,
      maxSize: this.maxFileSize,
      chunkSize: this.chunkSize,
      timeoutMs: this.uploadTimeoutMs,
    };
  }

  /**
   * Get security configuration
   */
  getSecurityConfig(): Record<string, unknown> {
    return {
      virusScan: this.enableVirusScan,
      autoDeleteTemp: this.autoDeleteTemp,
      prohibitedExtensions: this.prohibitedExtensions,
    };
  }

  /**
   * Get summary of configuration
   */
  getSummary(): Record<string, unknown> {
    return {
      limits: {
        maxFileSize: this.maxFileSize,
        minDiskSpace: this.minDiskSpace,
        chunkSize: this.chunkSize,
      },
      upload: {
        dir: this.uploadDir,
        timeoutMs: this.uploadTimeoutMs,
      },
      security: this.getSecurityConfig(),
      features: {
        deduplication: this.enableDeduplication,
        versioning: this.enableVersioning,
      },
      allowedTypes: this.allowedMimeTypes.length,
      prohibitedExtensions: this.prohibitedExtensions.length,
    };
  }
}
