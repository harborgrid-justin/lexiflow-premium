import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as crypto from 'crypto';
import { mkdir, writeFile, readFile, unlink, stat } from 'fs/promises';
import { StorageFile, FileUploadResult } from './interfaces/storage-file.interface';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    this.ensureUploadDirectory();
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
   */
  async storeFile(
    file: Express.Multer.File,
    caseId: string,
    documentId: string,
    version: number,
  ): Promise<FileUploadResult> {
    try {
      // Create directory structure
      const dirPath = path.join(
        this.uploadDir,
        caseId,
        documentId,
        version.toString(),
      );
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

      this.logger.log(`File stored: ${filePath}`);

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
    } catch (error) {
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
      const buffer = await this.getFile(filePath);
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
    const fs = require('fs').promises;
    await fs.copyFile(sourcePath, destPath);
  }

  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    const fs = require('fs').promises;
    await fs.rename(sourcePath, destPath);
  }

  async listFiles(dirPath: string): Promise<string[]> {
    const fs = require('fs').promises;
    try {
      return await fs.readdir(dirPath);
    } catch {
      return [];
    }
  }

  async getStorageStats(): Promise<any> {
    return {
      totalFiles: 0,
      totalSize: 0,
      used: 0,
      available: 1000000000,
    };
  }

  async cleanupOrphans(validDocIds: string[]): Promise<number> {
    // Stub implementation
    return 0;
  }
}
