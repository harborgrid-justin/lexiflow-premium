import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

export interface StorageProvider {
  store(buffer: Buffer, key: string, metadata?: any): Promise<string>;
  retrieve(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string): string;
  getMetadata(key: string): Promise<any>;
}

export interface LocalStorageOptions {
  basePath: string;
  createDirectories?: boolean;
  permissions?: string;
}

/**
 * Local Filesystem Storage Provider
 * Implements file storage on local/network filesystem:
 * - Hierarchical directory structure
 * - Automatic directory creation
 * - File permissions management
 * - Metadata storage (JSON sidecar files)
 * - Path sanitization for security
 * - Atomic writes using temp files
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly basePath: string;
  private readonly createDirectories: boolean;
  private readonly permissions: string;

  constructor(options: LocalStorageOptions) {
    this.basePath = path.resolve(options.basePath);
    this.createDirectories = options.createDirectories !== false;
    this.permissions = options.permissions || '0644';

    this.logger.log(`Local storage initialized at: ${this.basePath}`);
    this.ensureBasePath();
  }

  /**
   * Ensure base path exists
   */
  private async ensureBasePath(): Promise<void> {
    try {
      await fs.access(this.basePath);
    } catch (error) {
      if (this.createDirectories) {
        await fs.mkdir(this.basePath, { recursive: true, mode: 0o755 });
        this.logger.log(`Created base directory: ${this.basePath}`);
      } else {
        throw new Error(`Base path does not exist: ${this.basePath}`);
      }
    }
  }

  /**
   * Store file in local filesystem
   */
  async store(buffer: Buffer, key: string, metadata?: any): Promise<string> {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const fullPath = path.join(this.basePath, sanitizedKey);
      const directory = path.dirname(fullPath);

      // Ensure directory exists
      await fs.mkdir(directory, { recursive: true, mode: 0o755 });

      // Write to temporary file first (atomic write)
      const tempPath = `${fullPath}.tmp.${Date.now()}`;
      await fs.writeFile(tempPath, buffer);

      // Rename to final location (atomic operation)
      await fs.rename(tempPath, fullPath);

      // Set permissions
      await fs.chmod(fullPath, parseInt(this.permissions, 8));

      // Store metadata if provided
      if (metadata) {
        await this.storeMetadata(sanitizedKey, metadata);
      }

      this.logger.debug(`Stored file: ${sanitizedKey}`);

      return sanitizedKey;

    } catch (error) {
      this.logger.error(`Failed to store file ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieve file from local filesystem
   */
  async retrieve(key: string): Promise<Buffer> {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const fullPath = path.join(this.basePath, sanitizedKey);

      const buffer = await fs.readFile(fullPath);

      this.logger.debug(`Retrieved file: ${sanitizedKey}`);

      return buffer;

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      this.logger.error(`Failed to retrieve file ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete file from local filesystem
   */
  async delete(key: string): Promise<void> {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const fullPath = path.join(this.basePath, sanitizedKey);

      // Delete main file
      await fs.unlink(fullPath);

      // Delete metadata file if exists
      const metadataPath = this.getMetadataPath(sanitizedKey);
      try {
        await fs.unlink(metadataPath);
      } catch (error) {
        // Ignore if metadata file doesn't exist
      }

      this.logger.debug(`Deleted file: ${sanitizedKey}`);

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      this.logger.error(`Failed to delete file ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const fullPath = path.join(this.basePath, sanitizedKey);

      await fs.access(fullPath);
      return true;

    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file URL (for local storage, this is file:// protocol)
   */
  getUrl(key: string): string {
    const sanitizedKey = this.sanitizeKey(key);
    const fullPath = path.join(this.basePath, sanitizedKey);
    return `file://${fullPath}`;
  }

  /**
   * Get file metadata
   */
  async getMetadata(key: string): Promise<any> {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const metadataPath = this.getMetadataPath(sanitizedKey);

      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(metadataContent);

    } catch (error) {
      if (error.code === 'ENOENT') {
        // No metadata file exists
        const fullPath = path.join(this.basePath, sanitizedKey);
        const stats = await fs.stat(fullPath);

        return {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      }

      throw error;
    }
  }

  /**
   * Store metadata in sidecar JSON file
   */
  private async storeMetadata(key: string, metadata: any): Promise<void> {
    const metadataPath = this.getMetadataPath(key);
    const directory = path.dirname(metadataPath);

    await fs.mkdir(directory, { recursive: true });

    const enrichedMetadata = {
      ...metadata,
      storedAt: new Date().toISOString(),
      key,
    };

    await fs.writeFile(metadataPath, JSON.stringify(enrichedMetadata, null, 2));
  }

  /**
   * Get metadata file path
   */
  private getMetadataPath(key: string): string {
    return path.join(this.basePath, `${key}.metadata.json`);
  }

  /**
   * Sanitize key to prevent directory traversal attacks
   */
  private sanitizeKey(key: string): string {
    // Remove any path traversal attempts
    let sanitized = key.replace(/\.\./g, '');

    // Remove leading slashes
    sanitized = sanitized.replace(/^\/+/, '');

    // Normalize path separators
    sanitized = sanitized.replace(/\\/g, '/');

    // Remove any null bytes
    sanitized = sanitized.replace(/\0/g, '');

    return sanitized;
  }

  /**
   * List files in a directory
   */
  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const searchPath = prefix
        ? path.join(this.basePath, this.sanitizeKey(prefix))
        : this.basePath;

      const files = await this.listFilesRecursive(searchPath, this.basePath);

      return files;

    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Recursively list files
   */
  private async listFilesRecursive(directory: string, basePath: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.listFilesRecursive(fullPath, basePath);
          files.push(...subFiles);
        } else if (!entry.name.endsWith('.metadata.json')) {
          // Return relative path from base
          const relativePath = path.relative(basePath, fullPath);
          files.push(relativePath);
        }
      }
    } catch (error) {
      // Ignore permission errors
      if (error.code !== 'EACCES') {
        throw error;
      }
    }

    return files;
  }

  /**
   * Copy file within storage
   */
  async copy(sourceKey: string, destKey: string): Promise<string> {
    const sanitizedSource = this.sanitizeKey(sourceKey);
    const sanitizedDest = this.sanitizeKey(destKey);

    const sourcePath = path.join(this.basePath, sanitizedSource);
    const destPath = path.join(this.basePath, sanitizedDest);

    const destDir = path.dirname(destPath);
    await fs.mkdir(destDir, { recursive: true });

    await fs.copyFile(sourcePath, destPath);

    this.logger.debug(`Copied file: ${sanitizedSource} -> ${sanitizedDest}`);

    return sanitizedDest;
  }

  /**
   * Move file within storage
   */
  async move(sourceKey: string, destKey: string): Promise<string> {
    const sanitizedSource = this.sanitizeKey(sourceKey);
    const sanitizedDest = this.sanitizeKey(destKey);

    const sourcePath = path.join(this.basePath, sanitizedSource);
    const destPath = path.join(this.basePath, sanitizedDest);

    const destDir = path.dirname(destPath);
    await fs.mkdir(destDir, { recursive: true });

    await fs.rename(sourcePath, destPath);

    this.logger.debug(`Moved file: ${sanitizedSource} -> ${sanitizedDest}`);

    return sanitizedDest;
  }

  /**
   * Get storage statistics
   */
  async getStatistics(): Promise<{
    totalFiles: number;
    totalSize: number;
    oldestFile: Date;
    newestFile: Date;
  }> {
    const files = await this.listFiles();
    let totalSize = 0;
    let oldestFile: Date = new Date();
    let newestFile: Date = new Date(0);

    for (const file of files) {
      const fullPath = path.join(this.basePath, file);
      const stats = await fs.stat(fullPath);

      totalSize += stats.size;

      if (stats.birthtime < oldestFile) {
        oldestFile = stats.birthtime;
      }

      if (stats.birthtime > newestFile) {
        newestFile = stats.birthtime;
      }
    }

    return {
      totalFiles: files.length,
      totalSize,
      oldestFile,
      newestFile,
    };
  }

  /**
   * Clean up old files
   */
  async cleanupOldFiles(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const files = await this.listFiles();
    let deletedCount = 0;

    for (const file of files) {
      const fullPath = path.join(this.basePath, file);
      const stats = await fs.stat(fullPath);

      if (stats.mtime < cutoffDate) {
        await fs.unlink(fullPath);
        deletedCount++;
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} files older than ${olderThanDays} days`);

    return deletedCount;
  }
}
