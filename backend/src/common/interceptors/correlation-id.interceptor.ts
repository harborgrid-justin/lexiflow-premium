import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

/**
 * Correlation ID Interceptor
 * Adds correlation ID to all requests for distributed tracing
 * Follows OpenTelemetry and W3C Trace Context standards
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Extract or generate correlation ID
    const correlationId =
      request.headers['x-correlation-id'] ||
      request.headers['x-request-id'] ||
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
