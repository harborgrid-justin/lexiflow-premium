import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  _InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as PathsConfig from '../config/paths.config';
import * as MasterConfig from '../config/master.config';
import { mkdir, writeFile, readFile, unlink, readdir } from 'fs/promises';
import { FileUploadResult } from './interfaces/storage-file.interface';
import {
  calculateChecksum,
  verifyChecksum,
  fileExists,
  getFileSize,
  getFileMetadata,
  sanitizeFilename,
  isAllowedMimeType,
} from '../common/utils/file.utils';
import { formatBytes } from '../common/utils/format.utils';
import { validateDiskSpace } from '../common/utils/disk.utils';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly minDiskSpace: number;
  private readonly allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadDir = PathsConfig.UPLOAD_DIR;
    this.maxFileSize =
      this.configService.get<number>('resourceLimits.fileStorage.maxFileSize') || MasterConfig.FILE_MAX_SIZE;
    this.minDiskSpace =
      this.configService.get<number>('resourceLimits.fileStorage.minDiskSpace') || MasterConfig.FILE_MIN_DISK_SPACE;
    this.allowedMimeTypes =
      this.configService.get<string[]>('resourceLimits.fileStorage.allowedMimeTypes') || [];

    this.ensureUploadDirectory();

    this.logger.log(
      `File storage limits: maxFileSize=${formatBytes(this.maxFileSize)}, minDiskSpace=${formatBytes(this.minDiskSpace)}`,
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
          `File size ${formatBytes(file.size)} exceeds maximum allowed size of ${formatBytes(this.maxFileSize)}`,
        );
      }

      // Validate MIME type if allowlist is configured
      if (!isAllowedMimeType(file.mimetype, this.allowedMimeTypes)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
        );
      }

      // Check available disk space
      await validateDiskSpace(this.uploadDir, file.size, this.minDiskSpace);

      // Create directory structure
      const dirPath = path.join(this.uploadDir, caseId, documentId, version.toString());
      await mkdir(dirPath, { recursive: true });

      // Generate safe filename
      const filename = sanitizeFilename(file.originalname);
      const filePath = path.join(dirPath, filename);

      // Write file
      await writeFile(filePath, file.buffer);

      // Calculate checksum
      const checksum = calculateChecksum(file.buffer);

      // Get file stats
      const fileSize = await getFileSize(filePath);

      this.logger.log(`File stored: ${filePath} (${formatBytes(fileSize)})`);

      return {
        filename,
        path: filePath,
        size: fileSize,
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

      const exists = await fileExists(absolutePath);
      if (!exists) {
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

      const exists = await fileExists(absolutePath);
      if (exists) {
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
   * Verify file checksum
   */
  async verifyChecksum(filePath: string, expectedChecksum: string): Promise<boolean> {
    try {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.uploadDir, filePath);
      return await verifyChecksum(absolutePath, expectedChecksum);
    } catch (error) {
      this.logger.error('Failed to verify checksum', error);
      return false;
    }
  }

  /**
   * Get file size
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      return await getFileSize(filePath);
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

      const metadata = await getFileMetadata(absolutePath);
      return {
        size: metadata.size,
        createdAt: metadata.createdAt,
        modifiedAt: metadata.modifiedAt,
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

  async cleanupOrphans(_validDocIds: string[]): Promise<{ removed: number }> {
    // Stub implementation
    return { removed: 0 };
  }

}
