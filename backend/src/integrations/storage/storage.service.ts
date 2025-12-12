import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export enum StorageProvider {
  S3 = 'S3',
  AZURE = 'AZURE',
  LOCAL = 'LOCAL',
}

export interface UploadOptions {
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
  folder?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  etag?: string;
}

export interface DownloadResult {
  buffer: Buffer;
  mimeType: string;
  size: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: AWS.S3;
  private provider: StorageProvider;
  private bucketName: string;
  private localStoragePath: string;

  constructor(private configService: ConfigService) {
    this.provider = this.configService.get<StorageProvider>(
      'STORAGE_PROVIDER',
      StorageProvider.LOCAL,
    );
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'lexiflow-documents');
    this.localStoragePath = this.configService.get<string>(
      'LOCAL_STORAGE_PATH',
      './storage/uploads',
    );

    if (this.provider === StorageProvider.S3) {
      this.initializeS3();
    } else if (this.provider === StorageProvider.LOCAL) {
      this.initializeLocalStorage();
    }

    this.logger.log(`Storage service initialized with provider: ${this.provider}`);
  }

  private initializeS3(): void {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    this.s3Client = new AWS.S3({
      region,
      accessKeyId,
      secretAccessKey,
    });

    this.logger.log(`S3 client initialized for region: ${region}`);
  }

  private async initializeLocalStorage(): Promise<void> {
    try {
      await fs.mkdir(this.localStoragePath, { recursive: true });
      this.logger.log(`Local storage initialized at: ${this.localStoragePath}`);
    } catch (error) {
      this.logger.error('Failed to initialize local storage', error.stack);
    }
  }

  /**
   * Upload a file to storage
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    const key = this.generateStorageKey(options.fileName, options.folder);

    switch (this.provider) {
      case StorageProvider.S3:
        return this.uploadToS3(key, options);
      case StorageProvider.LOCAL:
        return this.uploadToLocal(key, options);
      default:
        throw new Error(`Unsupported storage provider: ${this.provider}`);
    }
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(key: string, options: UploadOptions): Promise<UploadResult> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: key,
        Body: options.fileBuffer,
        ContentType: options.mimeType,
        ACL: options.isPublic ? 'public-read' : 'private',
        Metadata: options.metadata || {},
      };

      const result = await this.s3Client.upload(params).promise();

      this.logger.log(`File uploaded to S3: ${key}`);

      return {
        key,
        url: result.Location,
        size: options.fileBuffer.length,
        etag: result.ETag,
      };
    } catch (error) {
      this.logger.error(`Failed to upload to S3: ${key}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload to local storage
   */
  private async uploadToLocal(key: string, options: UploadOptions): Promise<UploadResult> {
    try {
      const filePath = path.join(this.localStoragePath, key);
      const directory = path.dirname(filePath);

      // Create directory if it doesn't exist
      await fs.mkdir(directory, { recursive: true });

      // Write file
      await fs.writeFile(filePath, options.fileBuffer);

      this.logger.log(`File uploaded to local storage: ${key}`);

      const baseUrl = this.configService.get<string>('API_URL', 'http://localhost:3001');
      const url = `${baseUrl}/api/files/${key}`;

      return {
        key,
        url,
        size: options.fileBuffer.length,
      };
    } catch (error) {
      this.logger.error(`Failed to upload to local storage: ${key}`, error.stack);
      throw error;
    }
  }

  /**
   * Download a file from storage
   */
  async download(key: string): Promise<DownloadResult> {
    switch (this.provider) {
      case StorageProvider.S3:
        return this.downloadFromS3(key);
      case StorageProvider.LOCAL:
        return this.downloadFromLocal(key);
      default:
        throw new Error(`Unsupported storage provider: ${this.provider}`);
    }
  }

  /**
   * Download from AWS S3
   */
  private async downloadFromS3(key: string): Promise<DownloadResult> {
    try {
      const params: AWS.S3.GetObjectRequest = {
        Bucket: this.bucketName,
        Key: key,
      };

      const result = await this.s3Client.getObject(params).promise();

      return {
        buffer: result.Body as Buffer,
        mimeType: result.ContentType || 'application/octet-stream',
        size: result.ContentLength || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to download from S3: ${key}`, error.stack);
      throw error;
    }
  }

  /**
   * Download from local storage
   */
  private async downloadFromLocal(key: string): Promise<DownloadResult> {
    try {
      const filePath = path.join(this.localStoragePath, key);
      const buffer = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);

      // Determine MIME type from file extension
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.txt': 'text/plain',
      };

      return {
        buffer,
        mimeType: mimeTypes[ext] || 'application/octet-stream',
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`Failed to download from local storage: ${key}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a file from storage
   */
  async delete(key: string): Promise<void> {
    switch (this.provider) {
      case StorageProvider.S3:
        return this.deleteFromS3(key);
      case StorageProvider.LOCAL:
        return this.deleteFromLocal(key);
      default:
        throw new Error(`Unsupported storage provider: ${this.provider}`);
    }
  }

  /**
   * Delete from AWS S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3Client.deleteObject(params).promise();
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete from S3: ${key}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete from local storage
   */
  private async deleteFromLocal(key: string): Promise<void> {
    try {
      const filePath = path.join(this.localStoragePath, key);
      await fs.unlink(filePath);
      this.logger.log(`File deleted from local storage: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete from local storage: ${key}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a signed URL for temporary access (S3 only)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.provider !== StorageProvider.S3) {
      throw new Error('Signed URLs are only supported for S3 provider');
    }

    try {
      const params: AWS.S3.GetObjectRequest = {
        Bucket: this.bucketName,
        Key: key,
      };

      return this.s3Client.getSignedUrl('getObject', {
        ...params,
        Expires: expiresIn,
      });
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${key}`, error.stack);
      throw error;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder?: string): Promise<string[]> {
    switch (this.provider) {
      case StorageProvider.S3:
        return this.listFilesFromS3(folder);
      case StorageProvider.LOCAL:
        return this.listFilesFromLocal(folder);
      default:
        throw new Error(`Unsupported storage provider: ${this.provider}`);
    }
  }

  /**
   * List files from S3
   */
  private async listFilesFromS3(folder?: string): Promise<string[]> {
    try {
      const params: AWS.S3.ListObjectsV2Request = {
        Bucket: this.bucketName,
        Prefix: folder || '',
      };

      const result = await this.s3Client.listObjectsV2(params).promise();
      return result.Contents?.map(obj => obj.Key || '') || [];
    } catch (error) {
      this.logger.error('Failed to list files from S3', error.stack);
      throw error;
    }
  }

  /**
   * List files from local storage
   */
  private async listFilesFromLocal(folder?: string): Promise<string[]> {
    try {
      const dirPath = folder
        ? path.join(this.localStoragePath, folder)
        : this.localStoragePath;

      const files = await fs.readdir(dirPath, { withFileTypes: true });
      return files
        .filter(file => file.isFile())
        .map(file => (folder ? `${folder}/${file.name}` : file.name));
    } catch (error) {
      this.logger.error('Failed to list files from local storage', error.stack);
      throw error;
    }
  }

  /**
   * Generate a unique storage key
   */
  private generateStorageKey(fileName: string, folder?: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const ext = path.extname(fileName);
    const name = path.basename(fileName, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '-');
    const key = `${sanitizedName}-${timestamp}-${uuid}${ext}`;

    return folder ? `${folder}/${key}` : key;
  }
}
