import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request } from 'express';

/**
 * Response Transform Interceptor
 * Standardizes all API responses with consistent structure
 * Includes metadata, timestamps, and correlation IDs
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { correlationId?: string }>();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const responseTime = Date.now() - startTime;
        
        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            correlationId: request.correlationId || 'N/A',
            responseTime: `${responseTime}ms`,
            path: request.url,
            method: request.method,
          },
        };
      }),
    );
  }
}

/**
 * Standardized API Response
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    correlationId: string;
    responseTime: string;
    path: string;
    method: string;
  };
}
