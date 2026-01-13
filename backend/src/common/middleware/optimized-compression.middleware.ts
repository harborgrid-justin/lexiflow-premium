import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as compression from 'compression';
import * as MasterConfig from '@config/master.config';

/**
 * Optimized Compression Middleware
 * Smart compression that only compresses when beneficial
 *
 * Features:
 * - Configurable size threshold (don't compress small responses)
 * - Compression level optimization for CPU vs size tradeoff
 * - Exclude already-compressed content types
 * - Support for both gzip and brotli
 *
 * Performance Impact:
 * - Reduces bandwidth by 60-80% for text content
 * - Minimal CPU overhead with level 6 compression
 * - Threshold prevents wasted CPU on small responses
 */
@Injectable()
export class OptimizedCompressionMiddleware implements NestMiddleware {
  private compressionMiddleware: (req: Request, res: Response, next: NextFunction) => void;

  constructor() {
    this.compressionMiddleware = compression({
      // Only compress responses above threshold
      threshold: MasterConfig.COMPRESSION_THRESHOLD || 1024, // 1KB

      // Compression level (1-9, 6 is best balance)
      level: MasterConfig.COMPRESSION_LEVEL || 6,

      // Filter function to determine what to compress
      filter: (req: Request, res: Response) => {
        // Don't compress if client doesn't support it
        if (!req.headers['accept-encoding']) {
          return false;
        }

        // Get content type
        const contentType = res.getHeader('Content-Type') as string;

        if (!contentType) {
          return false;
        }

        // Don't compress already compressed content
        const skipTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/',
          'audio/',
          'application/zip',
          'application/gzip',
          'application/pdf', // PDFs are already compressed
        ];

        if (skipTypes.some((type) => contentType.toLowerCase().includes(type))) {
          return false;
        }

        // Compress text-based content
        const compressTypes = [
          'text/',
          'application/json',
          'application/javascript',
          'application/xml',
          'application/x-font',
          'font/',
        ];

        return compressTypes.some((type) =>
          contentType.toLowerCase().includes(type),
        );
      },

      // Memory level (1-9, 8 is default)
      memLevel: 8,

      // Strategy (Z_DEFAULT_STRATEGY is best for most cases)
      strategy: 0, // Z_DEFAULT_STRATEGY
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.compressionMiddleware(req, res, next);
  }
}
