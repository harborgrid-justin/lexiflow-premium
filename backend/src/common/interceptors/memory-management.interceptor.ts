import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Memory Management Interceptor
 * 
 * Monitors memory usage per request and triggers cleanup when needed.
 * Helps prevent memory leaks from long-running requests.
 */
@Injectable()
export class MemoryManagementInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MemoryManagementInterceptor.name);
  private readonly warningThreshold: number;
  private readonly enableLogging: boolean;

  constructor(private readonly configService: ConfigService) {
    this.warningThreshold = this.configService.get<number>(
      'memory.monitoring.warningThreshold',
      0.75
    );
    this.enableLogging = this.configService.get<boolean>(
      'memory.monitoring.logPerRequest',
      false
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const startMemory = process.memoryUsage();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        if (this.enableLogging) {
          this.logMemoryDelta(request, startMemory, startTime);
        }
      }),
      finalize(() => {
        this.checkAndCleanup(request, startMemory);
      })
    );
  }

  /**
   * Log memory delta for the request
   */
  private logMemoryDelta(
    request: Request,
    startMemory: NodeJS.MemoryUsage,
    startTime: number
  ): void {
    const endMemory = process.memoryUsage();
    const duration = Date.now() - startTime;
    const heapDelta = (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;

    if (Math.abs(heapDelta) > 10) {
      this.logger.log(
        `${request.method} ${request.url} | ` +
        `Duration: ${duration}ms | ` +
        `Heap Delta: ${heapDelta.toFixed(2)} MB`
      );
    }
  }

  /**
   * Check memory usage and cleanup if needed
   */
  private checkAndCleanup(request: Request, startMemory: NodeJS.MemoryUsage): void {
    const currentMemory = process.memoryUsage();
    const heapDelta = currentMemory.heapUsed - startMemory.heapUsed;

    if (heapDelta > 50 * 1024 * 1024) {
      this.logger.warn(
        `Large memory allocation detected: ${(heapDelta / 1024 / 1024).toFixed(2)} MB ` +
        `for ${request.method} ${request.url}`
      );
    }

    const heapUsedRatio = currentMemory.heapUsed / (process.memoryUsage().heapUsed + currentMemory.heapUsed);
    
    if (heapUsedRatio > this.warningThreshold && global.gc) {
      setImmediate(() => {
        if (global.gc) {
          global.gc();
        }
      });
    }
  }
}
