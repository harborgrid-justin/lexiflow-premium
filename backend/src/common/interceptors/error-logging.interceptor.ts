import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request } from 'express';
import { BaseCustomException } from '../exceptions/custom-exceptions';

/**
 * Error Logging Interceptor
 * Catches and logs all errors before they reach exception filters
 * Provides detailed error context and correlation tracking
 */
@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, headers, body, params, query } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Generate or extract correlation ID
        const correlationId =
          error instanceof BaseCustomException
            ? error.correlationId
            : this.generateCorrelationId();

        // Build comprehensive error context
        const errorContext = {
          correlationId,
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`,
          request: {
            method,
            url,
            params,
            query,
            headers: this.sanitizeHeaders(headers),
            body: this.sanitizeBody(body),
            ip: request.ip,
            userAgent: headers['user-agent'],
          },
          error: {
            name: error.name,
            message: error.message,
            statusCode: error instanceof HttpException ? error.getStatus() : 500,
            ...(error instanceof BaseCustomException && {
              context: error.context,
            }),
          },
        };

        // Log error with appropriate severity
        this.logError(error, errorContext);

        // Re-throw error to be handled by exception filters
        return throwError(() => error);
      }),
    );
  }

  private logError(error: Error, context: any): void {
    const statusCode = context.error.statusCode;

    if (statusCode >= 500) {
      // Server errors - critical logging
      this.logger.error(
        `[${context.correlationId}] Server Error: ${error.message}`,
        JSON.stringify(context, null, 2),
      );

      // Log stack trace for server errors
      if (error.stack && process.env.NODE_ENV === 'development') {
        this.logger.error(error.stack);
      }
    } else if (statusCode >= 400) {
      // Client errors - warning level
      this.logger.warn(
        `[${context.correlationId}] Client Error: ${error.message}`,
        JSON.stringify(context, null, 2),
      );
    }

    // Check if error should trigger GitHub issue creation
    if (this.shouldCreateGitHubIssue(error, statusCode)) {
      this.logger.log(
        `[${context.correlationId}] Error eligible for GitHub issue creation`,
      );
      // Note: Actual GitHub issue creation would happen in a separate service
      // This could be implemented as an async event or queue job
    }
  }

  private shouldCreateGitHubIssue(error: Error, statusCode: number): boolean {
    // Only create issues for server errors (5xx)
    if (statusCode < 500) {
      return false;
    }

    // Add logic to prevent duplicate issues
    // Could check error fingerprint, recent similar errors, etc.
    return true;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '***';
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'currentPassword',
      'newPassword',
      'confirmPassword',
      'token',
      'apiKey',
      'secret',
      'ssn',
      'creditCard',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Error context interface for structured logging
 */
export interface ErrorContext {
  correlationId: string;
  timestamp: string;
  duration: string;
  request: {
    method: string;
    url: string;
    params: any;
    query: any;
    headers: any;
    body: any;
    ip: string;
    userAgent: string;
  };
  error: {
    name: string;
    message: string;
    statusCode: number;
    context?: Record<string, any>;
  };
}
