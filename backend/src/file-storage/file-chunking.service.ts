import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface ChunkMetadata {
  uploadId: string;
  fileName: string;
  totalSize: number;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  checksum: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ChunkUploadResult {
  uploadId: string;
  chunkIndex: number;
  checksum: string;
  uploadedChunks: number;
  totalChunks: number;
  isComplete: boolean;
}

export interface AssembledFileResult {
  uploadId: string;
  fileName: string;
  fileBuffer: Buffer;
  totalSize: number;
  checksum: string;
}

/**
 * File Chunking Service for Large File Uploads
 * Handles resumable chunked uploads for large files:
 * - Split large files into manageable chunks
 * - Resume interrupted uploads
 * - Verify chunk integrity with checksums
 * - Assemble chunks into complete file
 * - Automatic cleanup of expired uploads
 * - Parallel chunk upload support
 */
@Injectable()
export class FileChunkingService {
  private readonly logger = new Logger(FileChunkingService.name);

  // In-memory storage for chunk metadata (use Redis in production)
  private readonly chunkMetadataStore = new Map<string, ChunkMetadata>();
  private readonly chunkDataStore = new Map<string, Map<number, Buffer>>();

  // Default chunk size: 5MB
  private readonly DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

  // Upload expiry time: 24 hours
  private readonly UPLOAD_EXPIRY_HOURS = 24;

  /**
   * Initialize chunked upload session
   */
  initiateChunkedUpload(
    fileName: string,
    totalSize: number,
    userId: string,
    chunkSize?: number,
  ): ChunkMetadata {
    try {
      const uploadId = this.generateUploadId();
      const effectiveChunkSize = chunkSize || this.DEFAULT_CHUNK_SIZE;
      const totalChunks = Math.ceil(totalSize / effectiveChunkSize);

      const metadata: ChunkMetadata = {
        uploadId,
        fileName,
        totalSize,
        chunkSize: effectiveChunkSize,
        totalChunks,
        uploadedChunks: [],
        checksum: '',
        userId,
        createdAt: new Date(),
        expiresAt: this.getExpiryDate(),
      };

      this.chunkMetadataStore.set(uploadId, metadata);
      this.chunkDataStore.set(uploadId, new Map());

      this.logger.log(
        `Initiated chunked upload: ${uploadId} (${totalChunks} chunks of ${this.formatBytes(effectiveChunkSize)})`,
      );

      return metadata;

    } catch (error) {
      this.logger.error(`Failed to initiate chunked upload: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload a single chunk
   */
  async uploadChunk(
    uploadId: string,
    chunkIndex: number,
    chunkData: Buffer,
  ): Promise<ChunkUploadResult> {
    try {
      // Validate upload session
      const metadata = this.chunkMetadataStore.get(uploadId);

      if (!metadata) {
        throw new BadRequestException('Invalid upload ID or upload session expired');
      }

      // Check if expired
      if (new Date() > metadata.expiresAt) {
        this.cleanupUpload(uploadId);
        throw new BadRequestException('Upload session expired');
      }

      // Validate chunk index
      if (chunkIndex < 0 || chunkIndex >= metadata.totalChunks) {
        throw new BadRequestException(`Invalid chunk index: ${chunkIndex}`);
      }

      // Validate chunk size (last chunk may be smaller)
      const expectedSize = this.getExpectedChunkSize(chunkIndex, metadata);
      if (chunkData.length !== expectedSize) {
        throw new BadRequestException(
          `Chunk size mismatch. Expected ${expectedSize}, got ${chunkData.length}`,
        );
      }

      // Calculate chunk checksum
      const chunkChecksum = this.calculateChecksum(chunkData);

      // Store chunk data
      const chunks = this.chunkDataStore.get(uploadId);
      chunks.set(chunkIndex, chunkData);

      // Update metadata
      if (!metadata.uploadedChunks.includes(chunkIndex)) {
        metadata.uploadedChunks.push(chunkIndex);
        metadata.uploadedChunks.sort((a, b) => a - b);
      }

      const isComplete = metadata.uploadedChunks.length === metadata.totalChunks;

      this.logger.debug(
        `Chunk uploaded: ${uploadId} [${chunkIndex + 1}/${metadata.totalChunks}] - Complete: ${isComplete}`,
      );

      return {
        uploadId,
        chunkIndex,
        checksum: chunkChecksum,
        uploadedChunks: metadata.uploadedChunks.length,
        totalChunks: metadata.totalChunks,
        isComplete,
      };

    } catch (error) {
      this.logger.error(`Failed to upload chunk: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get upload status
   */
  getUploadStatus(uploadId: string): ChunkMetadata {
    const metadata = this.chunkMetadataStore.get(uploadId);

    if (!metadata) {
      throw new BadRequestException('Invalid upload ID or upload session expired');
    }

    return metadata;
  }

  /**
   * Get missing chunks
   */
  getMissingChunks(uploadId: string): number[] {
    const metadata = this.chunkMetadataStore.get(uploadId);

    if (!metadata) {
      throw new BadRequestException('Invalid upload ID or upload session expired');
    }

    const allChunks = Array.from({ length: metadata.totalChunks }, (_, i) => i);
    const missingChunks = allChunks.filter(i => !metadata.uploadedChunks.includes(i));

    return missingChunks;
  }

  /**
   * Assemble all chunks into complete file
   */
  async assembleChunks(uploadId: string): Promise<AssembledFileResult> {
    try {
      const metadata = this.chunkMetadataStore.get(uploadId);

      if (!metadata) {
        throw new BadRequestException('Invalid upload ID or upload session expired');
      }

      // Verify all chunks are uploaded
      if (metadata.uploadedChunks.length !== metadata.totalChunks) {
        const missing = this.getMissingChunks(uploadId);
        throw new BadRequestException(
          `Upload incomplete. Missing chunks: ${missing.join(', ')}`,
        );
      }

      // Get all chunks
      const chunks = this.chunkDataStore.get(uploadId);

      if (!chunks || chunks.size !== metadata.totalChunks) {
        throw new BadRequestException('Chunk data integrity error');
      }

      // Assemble chunks in order
      const chunkBuffers: Buffer[] = [];
      let totalAssembledSize = 0;

      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunk = chunks.get(i);

        if (!chunk) {
          throw new BadRequestException(`Missing chunk data for index ${i}`);
        }

        chunkBuffers.push(chunk);
        totalAssembledSize += chunk.length;
      }

      // Combine all chunks
      const fileBuffer = Buffer.concat(chunkBuffers, totalAssembledSize);

      // Verify total size
      if (fileBuffer.length !== metadata.totalSize) {
        throw new BadRequestException(
          `Size mismatch. Expected ${metadata.totalSize}, got ${fileBuffer.length}`,
        );
      }

      // Calculate final checksum
      const checksum = this.calculateChecksum(fileBuffer);

      this.logger.log(
        `Assembled file: ${uploadId} (${this.formatBytes(fileBuffer.length)}) - Checksum: ${checksum}`,
      );

      // Update metadata with final checksum
      metadata.checksum = checksum;

      // Clean up after successful assembly (optional - keep for resume capability)
      // this.cleanupUpload(uploadId);

      return {
        uploadId,
        fileName: metadata.fileName,
        fileBuffer,
        totalSize: fileBuffer.length,
        checksum,
      };

    } catch (error) {
      this.logger.error(`Failed to assemble chunks: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel upload and cleanup
   */
  cancelUpload(uploadId: string): void {
    this.cleanupUpload(uploadId);
    this.logger.log(`Upload cancelled: ${uploadId}`);
  }

  /**
   * Cleanup upload data
   */
  private cleanupUpload(uploadId: string): void {
    this.chunkMetadataStore.delete(uploadId);
    this.chunkDataStore.delete(uploadId);
  }

  /**
   * Generate unique upload ID
   */
  private generateUploadId(): string {
    return `upload_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Calculate checksum for data
   */
  private calculateChecksum(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get expected chunk size for a given chunk index
   */
  private getExpectedChunkSize(chunkIndex: number, metadata: ChunkMetadata): number {
    const isLastChunk = chunkIndex === metadata.totalChunks - 1;

    if (isLastChunk) {
      // Last chunk may be smaller
      const remainingBytes = metadata.totalSize % metadata.chunkSize;
      return remainingBytes === 0 ? metadata.chunkSize : remainingBytes;
    }

    return metadata.chunkSize;
  }

  /**
   * Get expiry date for upload session
   */
  private getExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + this.UPLOAD_EXPIRY_HOURS);
    return expiryDate;
  }

  /**
   * Format bytes for logging
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Clean up expired uploads (should be run periodically)
   */
  cleanupExpiredUploads(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [uploadId, metadata] of this.chunkMetadataStore.entries()) {
      if (now > metadata.expiresAt) {
        this.cleanupUpload(uploadId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} expired uploads`);
    }

    return cleanedCount;
  }

  /**
   * Get statistics about active uploads
   */
  getStatistics(): {
    activeUploads: number;
    totalChunksStored: number;
    memoryUsageBytes: number;
  } {
    let totalChunks = 0;
    let memoryUsage = 0;

    for (const [uploadId, chunks] of this.chunkDataStore.entries()) {
      totalChunks += chunks.size;

      for (const chunk of chunks.values()) {
        memoryUsage += chunk.length;
      }
    }

    return {
      activeUploads: this.chunkMetadataStore.size,
      totalChunksStored: totalChunks,
      memoryUsageBytes: memoryUsage,
    };
  }

  /**
   * Validate chunk integrity
   */
  async validateChunk(
    uploadId: string,
    chunkIndex: number,
    expectedChecksum: string,
  ): Promise<boolean> {
    const chunks = this.chunkDataStore.get(uploadId);

    if (!chunks) {
      throw new BadRequestException('Invalid upload ID');
    }

    const chunk = chunks.get(chunkIndex);

    if (!chunk) {
      throw new BadRequestException(`Chunk ${chunkIndex} not found`);
    }

    const actualChecksum = this.calculateChecksum(chunk);

    return actualChecksum === expectedChecksum;
  }

  /**
   * Retry failed chunk upload
   */
  async retryChunk(uploadId: string, chunkIndex: number): Promise<void> {
    const chunks = this.chunkDataStore.get(uploadId);
    const metadata = this.chunkMetadataStore.get(uploadId);

    if (!chunks || !metadata) {
      throw new BadRequestException('Invalid upload ID');
    }

    // Remove failed chunk from uploaded list
    metadata.uploadedChunks = metadata.uploadedChunks.filter(i => i !== chunkIndex);

    // Remove chunk data
    chunks.delete(chunkIndex);

    this.logger.log(`Prepared retry for chunk ${chunkIndex} of upload ${uploadId}`);
  }

  /**
   * Get upload progress percentage
   */
  getUploadProgress(uploadId: string): number {
    const metadata = this.chunkMetadataStore.get(uploadId);

    if (!metadata) {
      throw new BadRequestException('Invalid upload ID');
    }

    const progress = (metadata.uploadedChunks.length / metadata.totalChunks) * 100;

    return Math.round(progress * 100) / 100;
  }

  /**
   * Estimate remaining time for upload
   */
  estimateRemainingTime(
    uploadId: string,
    averageChunkUploadTimeMs: number,
  ): number {
    const missingChunks = this.getMissingChunks(uploadId);
    return missingChunks.length * averageChunkUploadTimeMs;
  }
}
