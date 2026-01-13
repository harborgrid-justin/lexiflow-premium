import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response } from 'express';

/**
 * Correlation ID Interceptor
 * Adds correlation ID to all requests for distributed tracing
 * Follows OpenTelemetry and W3C Trace Context standards
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { correlationId: string }>();
    const response = context.switchToHttp().getResponse<Response>();

    // Extract or generate correlation ID
    const headerCorrelationId = request.headers['x-correlation-id'];
    const headerRequestId = request.headers['x-request-id'];

    const correlationId =
      (Array.isArray(headerCorrelationId) ? headerCorrelationId[0] : headerCorrelationId) ||
      (Array.isArray(headerRequestId) ? headerRequestId[0] : headerRequestId) ||
      uuidv4();

    // Attach to request for downstream use
    request.correlationId = correlationId;

    // Set response header for client tracking
    response.setHeader('X-Correlation-ID', correlationId);

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        response.setHeader('X-Response-Time', `${duration}ms`);
      }),
    );
  }
}
