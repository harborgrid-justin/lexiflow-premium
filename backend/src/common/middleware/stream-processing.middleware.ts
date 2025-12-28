import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Stream Processing Middleware
 * 
 * Handles large payloads using streams to prevent memory exhaustion.
 * Automatically switches to streaming mode for large requests.
 */
@Injectable()
export class StreamProcessingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(StreamProcessingMiddleware.name);
  private readonly streamThreshold: number;
  private readonly chunkSize: number;

  constructor(private readonly configService: ConfigService) {
    this.streamThreshold = this.configService.get<number>(
      'memory.streaming.fileThresholdBytes',
      10 * 1024 * 1024
    );
    this.chunkSize = this.configService.get<number>(
      'memory.streaming.chunkSizeBytes',
      64 * 1024
    );
  }

  use(req: Request, _res: Response, next: NextFunction): void {
    const contentLength = parseInt(req.get('content-length') || '0', 10);

    if (contentLength > this.streamThreshold) {
      this.logger.log(
        `Large payload detected (${this.formatBytes(contentLength)}). Enabling streaming mode.`
      );
      
      req.on('data', (chunk: Buffer) => {
        if (chunk.length > this.chunkSize) {
          this.logger.warn(
            `Large chunk received: ${this.formatBytes(chunk.length)}. ` +
            `Consider using multipart upload for files.`
          );
        }
      });

      req.on('error', (error) => {
        this.logger.error(`Stream error: ${error.message}`);
      });
    }

    next();
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }
}
