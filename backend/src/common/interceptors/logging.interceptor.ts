import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { StructuredLoggerService } from '../../monitoring/services/structured.logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Optional()
    @Inject(StructuredLoggerService)
    private readonly logger?: StructuredLoggerService,
  ) {
    // If structured logger is not available, this interceptor will skip logging
    // This allows the interceptor to work even if monitoring module is not imported
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.logger) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip;
    const correlationId = (request as any).correlationId;
    const userId = (request as any).user?.id;
    const now = Date.now();

    // Set context for this request
    this.logger.setContext({
      correlationId,
      userId,
      method,
      url,
      ip,
      userAgent,
    });

    // Log incoming request
    this.logger.log(`Incoming request: ${method} ${url}`, {
      method,
      url,
      ip,
      userAgent,
      correlationId,
      userId,
    });

    // Log request body if present (with PII redaction handled by structured logger)
    if (Object.keys(body || {}).length > 0) {
      this.logger.debug('Request body', {
        body,
        method,
        url,
      });
    }

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const responseTime = Date.now() - now;

          this.logger.log(`Request completed: ${method} ${url}`, {
            method,
            url,
            statusCode: response.statusCode,
            duration: responseTime,
            correlationId,
            userId,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - now;

          this.logger.error(
            `Request failed: ${method} ${url}`,
            error.stack,
            {
              method,
              url,
              duration: responseTime,
              errorMessage: error.message,
              errorName: error.name,
              statusCode: error.status || error.statusCode || 500,
              correlationId,
              userId,
            },
          );
        },
      }),
    );
  }
}
