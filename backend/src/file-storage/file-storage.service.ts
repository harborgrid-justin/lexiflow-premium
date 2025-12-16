import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';
import { mkdir, writeFile, readFile, unlink, stat, readdir, statfs } from 'fs/promises';
import { StorageFile, FileUploadResult } from './interfaces/storage-file.interface';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly minDiskSpace: number;
  private readonly allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    this.maxFileSize =
      this.configService.get<number>('resourceLimits.fileStorage.maxFileSize') || 524288000; // 500MB
    this.minDiskSpace =
      this.configService.get<number>('resourceLimits.fileStorage.minDiskSpace') || 1073741824; // 1GB
    this.allowedMimeTypes =
      this.configService.get<string[]>('resourceLimits.fileStorage.allowedMimeTypes') || [];

    this.ensureUploadDirectory();

    this.logger.log(
      `File storage limits: maxFileSize=${this.formatBytes(this.maxFileSize)}, minDiskSpace=${this.formatBytes(this.minDiskSpace)}`,
    );
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Upload directory ensured at: ${this.uploadDir}`);
    } catch (error) {
      this.logger.error('Failed to create upload directory', error);
    }
  }

  /**
   * Store a file with organized path structure: /uploads/{caseId}/{documentId}/{version}/filename
   *
   * Resource protections:
   * - Validates file size against configured max (default 500MB)
   * - Verifies sufficient disk space before write (default 1GB minimum)
   * - Validates MIME type against allowlist (if configured)
   */
  async storeFile(
    file: Express.Multer.File,
    caseId: string,
    documentId: string,
    version: number,
  ): Promise<FileUploadResult> {
    try {
      // Validate file size
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File size ${this.formatBytes(file.size)} exceeds maximum allowed size of ${this.formatBytes(this.maxFileSize)}`,
        );
      }

      // Validate MIME type if allowlist is configured
      if (this.allowedMimeTypes.length > 0 && !this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
        );
      }

      // Check available disk space
      await this.ensureDiskSpace(file.size);

      // Create directory structure
      const dirPath = path.join(this.uploadDir, caseId, documentId, version.toString());
      await mkdir(dirPath, { recursive: true });

      // Generate safe filename
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const filename = `${safeBaseName}${ext}`;
      const filePath = path.join(dirPath, filename);

      // Write file
      await writeFile(filePath, file.buffer);

      // Calculate checksum
      const checksum = await this.calculateChecksum(file.buffer);

      // Get file stats
      const stats = await stat(filePath);

      this.logger.log(`File stored: ${filePath} (${this.formatBytes(stats.size)})`);

      return {
        filename,
        path: filePath,
        size: stats.size,
        mimetype: file.mimetype,
        checksum,
        uploadedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to store file', error);
      throw error;
    }
  }

  /**
   * Retrieve a file as a buffer
   */
  async getFile(filePath: string): Promise<Buffer> {
    try {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.uploadDir, filePath);

      const fileExists = await this.fileExists(absolutePath);
      if (!fileExists) {
        throw new NotFoundException(`File not found: ${filePath}`);
      }

      return await readFile(absolutePath);
    } catch (error) {
      this.logger.error(`Failed to retrieve file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.uploadDir, filePath);

      const fileExists = await this.fileExists(absolutePath);
      if (fileExists) {
        await unlink(absolutePath);
        this.logger.log(`File deleted: ${absolutePath}`);
      }
    } catch (error: any) {
      // Ignore ENOENT errors (file already deleted)
      if (error.code === 'ENOENT') {
        return;
      }
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Calculate file checksum (SHA-256)
   */
  async calculateChecksum(buffer: Buffer): Promise<string> {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Verify file checksum
   */
  async verifyChecksum(filePath: string, expectedChecksum: string): Promise<boolean> {
    try {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.uploadDir, filePath);
      const buffer = await readFile(absolutePath);
      const actualChecksum = await this.calculateChecksum(buffer);
      return actualChecksum === expectedChecksum;
    } catch (error) {
      this.logger.error('Failed to verify checksum', error);
      return false;
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file size
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await stat(filePath);
      return stats.size;
    } catch (error) {
      this.logger.error(`Failed to get file size: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<{
    size: number;
    createdAt: Date;
    modifiedAt: Date;
  }> {
    try {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.uploadDir, filePath);

      const stats = await stat(absolutePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${filePath}`, error);
      throw error;
    }
  }

  async getFileInfo(filePath: string): Promise<any> {
    return this.getFileMetadata(filePath);
  }

  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    const buffer = await readFile(sourcePath);
    const destDir = path.dirname(destPath);
    await mkdir(destDir, { recursive: true });
    await writeFile(destPath, buffer);
    this.logger.log(`File copied: ${sourcePath} -> ${destPath}`);
  }

  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    const buffer = await readFile(sourcePath);
    const destDir = path.dirname(destPath);
    await mkdir(destDir, { recursive: true });
    await writeFile(destPath, buffer);
    await unlink(sourcePath);
    this.logger.log(`File moved: ${sourcePath} -> ${destPath}`);
  }

  async listFiles(dirPath: string): Promise<string[]> {
    try {
      return await readdir(dirPath);
    } catch {
      return [];
    }
  }

  async getStorageStats(): Promise<any> {
    return {
      totalFiles: 0,
      totalSize: 0,
      usedSpace: 0,
      available: 1000000000,
    };
  }

  async cleanupOrphans(validDocIds: string[]): Promise<{ removed: number }> {
    // Stub implementation
    return { removed: 0 };
  }

  /**
   * Ensure sufficient disk space is available
   */
  private async ensureDiskSpace(requiredBytes: number): Promise<void> {
    try {
      // Get disk space statistics
      const stats = await this.getDiskSpace();
      const availableSpace = stats.available;

      // Check if we have minimum required space after this write
      const spaceAfterWrite = availableSpace - requiredBytes;

      if (spaceAfterWrite < this.minDiskSpace) {
        throw new InternalServerErrorException(
          `Insufficient disk space. Available: ${this.formatBytes(availableSpace)}, ` +
            `Required: ${this.formatBytes(requiredBytes + this.minDiskSpace)}`,
        );
      }

      this.logger.debug(
        `Disk space check passed: ${this.formatBytes(availableSpace)} available, ` +
          `${this.formatBytes(spaceAfterWrite)} after write`,
      );
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.warn('Could not check disk space, proceeding with write', error);
    }
  }

  /**
   * Get disk space statistics for the upload directory
   */
  private async getDiskSpace(): Promise<{ available: number; total: number }> {
    try {
      // For Linux/Unix systems, use statfs
      const stats = await statfs(this.uploadDir);
      return {
        available: stats.bavail * stats.bsize,
        total: stats.blocks * stats.bsize,
      };
    } catch (error) {
      // Fallback: use os.freemem() for approximate available space
      this.logger.warn('statfs not available, using os.freemem() approximation');
      return {
        available: os.freemem(),
        total: os.totalmem(),
      };
    }
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
