import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import * as zlib from 'zlib';
import * as MasterConfig from '@config/master.config';

/**
 * Compression Configuration
 */
export interface CompressionConfig {
  algorithm?: 'gzip' | 'brotli' | 'deflate' | 'auto';
  level?: number;
  threshold?: number;
  contentTypes?: string[];
  excludeContentTypes?: string[];
}

/**
 * Compression Statistics
 */
export interface CompressionStats {
  totalRequests: number;
  compressedRequests: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  compressionRatio: number;
  averageSavings: number;
}

/**
 * Compression Service
 *
 * Enterprise-grade response compression:
 * - Multi-algorithm support (Gzip, Brotli, Deflate)
 * - Automatic algorithm selection based on client support
 * - Selective compression by content type
 * - Smart size threshold to avoid compressing small responses
 * - Compression level tuning (CPU vs size tradeoff)
 * - Real-time compression statistics
 * - Pre-compressed content detection
 *
 * Performance Impact:
 * - Reduces bandwidth by 60-80% for text content
 * - Brotli provides 15-25% better compression than Gzip
 * - Minimal CPU overhead with optimized compression levels
 *
 * @example
 * compressionService.compress(data, { algorithm: 'brotli', level: 6 });
 */
/**
 * ╔=================================================================================================================╗
 * ║COMPRESSION                                                                                                      ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class CompressionService {
  private readonly logger = new Logger(CompressionService.name);
  private stats: CompressionStats = {
    totalRequests: 0,
    compressedRequests: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    compressionRatio: 0,
    averageSavings: 0,
  };

  // Compression settings
  private readonly DEFAULT_LEVEL = MasterConfig.COMPRESSION_LEVEL || 6;
  private readonly DEFAULT_THRESHOLD = MasterConfig.COMPRESSION_THRESHOLD || 1024; // 1KB

  // Content types that should be compressed
  private readonly COMPRESSIBLE_TYPES = [
    'text/html',
    'text/css',
    'text/plain',
    'text/xml',
    'text/javascript',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/rss+xml',
    'application/atom+xml',
    'application/x-javascript',
    'application/x-font-ttf',
    'application/x-font-opentype',
    'application/vnd.ms-fontobject',
    'font/ttf',
    'font/opentype',
    'font/otf',
    'font/eot',
    'image/svg+xml',
  ];

  // Content types that are already compressed
  private readonly PRECOMPRESSED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'application/zip',
    'application/gzip',
    'application/x-gzip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/pdf',
    'application/octet-stream',
  ];

  /**
   * Compress data using specified algorithm
   */
  async compress(
    data: Buffer | string,
    config: CompressionConfig = {},
  ): Promise<Buffer> {
    const algorithm = config.algorithm || 'gzip';
    const level = config.level || this.DEFAULT_LEVEL;
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    // Don't compress if below threshold
    if (buffer.length < (config.threshold || this.DEFAULT_THRESHOLD)) {
      return buffer;
    }

    try {
      const compressAlg = algorithm === 'auto' ? 'gzip' : algorithm;
      const compressed = await this.compressBuffer(buffer, compressAlg, level);

      // Update statistics
      this.updateStats(buffer.length, compressed.length);

      this.logger.debug(
        `Compressed ${buffer.length} bytes to ${compressed.length} bytes using ${compressAlg} ` +
        `(${((1 - compressed.length / buffer.length) * 100).toFixed(1)}% reduction)`
      );

      return compressed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Compression failed: ${errorMessage}`);
      return buffer;
    }
  }

  /**
   * Decompress data
   */
  async decompress(
    data: Buffer,
    algorithm: 'gzip' | 'brotli' | 'deflate' = 'gzip',
  ): Promise<Buffer> {
    try {
      switch (algorithm) {
        case 'gzip':
          return await new Promise<Buffer>((resolve, reject) => {
            zlib.gunzip(data, (err, result) => err ? reject(err) : resolve(result));
          });
        case 'brotli':
          return await new Promise<Buffer>((resolve, reject) => {
            zlib.brotliDecompress(data, (err, result) => err ? reject(err) : resolve(result));
          });
        case 'deflate':
          return await new Promise<Buffer>((resolve, reject) => {
            zlib.inflate(data, (err, result) => err ? reject(err) : resolve(result));
          });
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Decompression failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Check if content type should be compressed
   */
  shouldCompress(contentType: string, config: CompressionConfig = {}): boolean {
    if (!contentType) {
      return false;
    }

    const typeParts = contentType.toLowerCase().split(';');
    const normalizedType = (typeParts[0] || '').trim();

    // Check exclusions first
    if (config.excludeContentTypes) {
      if (config.excludeContentTypes.some(type => normalizedType.includes(type))) {
        return false;
      }
    }

    // Check if already compressed
    if (this.PRECOMPRESSED_TYPES.some(type => normalizedType.includes(type))) {
      return false;
    }

    // Check if in compressible list
    if (config.contentTypes) {
      return config.contentTypes.some(type => normalizedType.includes(type));
    }

    return this.COMPRESSIBLE_TYPES.some(type => normalizedType.includes(type));
  }

  /**
   * Determine best compression algorithm based on client support
   */
  getBestAlgorithm(req: Request): 'gzip' | 'brotli' | 'deflate' | null {
    const acceptEncoding = req.headers['accept-encoding']?.toLowerCase() || '';

    // Brotli provides best compression but requires client support
    if (acceptEncoding.includes('br')) {
      return 'brotli';
    }

    // Gzip is widely supported
    if (acceptEncoding.includes('gzip')) {
      return 'gzip';
    }

    // Deflate as fallback
    if (acceptEncoding.includes('deflate')) {
      return 'deflate';
    }

    return null;
  }

  /**
   * Apply compression to response
   */
  async compressResponse(
    req: Request,
    res: Response,
    data: unknown,
    config: CompressionConfig = {},
  ): Promise<void> {
    const contentType = res.getHeader('Content-Type') as string;

    // Check if compression should be applied
    if (!this.shouldCompress(contentType, config)) {
      res.send(data);
      return;
    }

    // Get best algorithm
    const algorithm = config.algorithm === 'auto'
      ? this.getBestAlgorithm(req)
      : config.algorithm || this.getBestAlgorithm(req);

    if (!algorithm) {
      res.send(data);
      return;
    }

    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));

      // Don't compress small responses
      if (buffer.length < (config.threshold || this.DEFAULT_THRESHOLD)) {
        res.send(data);
        return;
      }

      const compressed = await this.compressBuffer(
        buffer,
        algorithm,
        config.level || this.DEFAULT_LEVEL,
      );

      // Update stats
      this.updateStats(buffer.length, compressed.length);

      // Set compression headers
      res.setHeader('Content-Encoding', algorithm);
      res.setHeader('Content-Length', compressed.length);
      res.setHeader('Vary', 'Accept-Encoding');

      res.send(compressed);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Response compression failed: ${errorMessage}`);
      res.send(data);
    }
  }

  /**
   * Get compression statistics
   */
  getStats(): CompressionStats {
    return { ...this.stats };
  }

  /**
   * Reset compression statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      compressedRequests: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      compressionRatio: 0,
      averageSavings: 0,
    };
    this.logger.log('Compression statistics reset');
  }

  /**
   * Get optimal compression level for content type
   */
  getOptimalLevel(contentType: string): number {
    const type = contentType.toLowerCase();

    // JSON/XML - Use higher compression (more repetitive data)
    if (type.includes('json') || type.includes('xml')) {
      return 7;
    }

    // HTML/CSS/JS - Use medium compression
    if (type.includes('html') || type.includes('css') || type.includes('javascript')) {
      return 6;
    }

    // Plain text - Use medium compression
    if (type.includes('text')) {
      return 5;
    }

    // Default
    return this.DEFAULT_LEVEL;
  }

  // Private helper methods

  private async compressBuffer(
    buffer: Buffer,
    algorithm: 'gzip' | 'brotli' | 'deflate',
    level: number,
  ): Promise<Buffer> {
    switch (algorithm) {
      case 'gzip':
        return await this.promisify(zlib.gzip)(buffer, {
          level,
          memLevel: 8,
        });

      case 'brotli':
        return await new Promise<Buffer>((resolve, reject) => {
          zlib.brotliCompress(buffer, {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: level,
              [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
            },
          } as any, (err: Error | null, result: Buffer) => err ? reject(err) : resolve(result));
        });

      case 'deflate':
        return await this.promisify(zlib.deflate)(buffer, {
          level,
        });

      default:
        throw new Error(`Unsupported compression algorithm: ${algorithm}`);
    }
  }

  private promisify<T extends unknown[]>(
    fn: (...args: [...T, (error: Error | null, result: Buffer) => void]) => void,
  ) {
    return (...args: T): Promise<Buffer> => {
      return new Promise((resolve, reject) => {
        fn(...args, (error: Error | null, result: Buffer) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    };
  }

  private updateStats(originalSize: number, compressedSize: number): void {
    this.stats.totalRequests++;
    this.stats.compressedRequests++;
    this.stats.totalOriginalSize += originalSize;
    this.stats.totalCompressedSize += compressedSize;

    // Calculate ratios
    if (this.stats.totalOriginalSize > 0) {
      this.stats.compressionRatio =
        this.stats.totalCompressedSize / this.stats.totalOriginalSize;
      this.stats.averageSavings =
        ((this.stats.totalOriginalSize - this.stats.totalCompressedSize) /
          this.stats.totalOriginalSize) *
        100;
    }
  }
}
