import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

interface EnhancedRequest extends Request {
  correlationId?: string;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<EnhancedRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, headers, ip } = request;
    const userAgent = headers['user-agent'] || 'N/A';
    const correlationId = request.correlationId || 'N/A';
    const userId = request.user?.id || 'anonymous';
    const startTime = Date.now();

    // Structured log context
    const logContext = {
      correlationId,
      method,
      url,
      ip,
      userAgent,
      userId,
    };

    // Log incoming request with correlation ID
    this.logger.log(
      `→ ${method} ${url}`,
      JSON.stringify({
        ...logContext,
        type: 'request',
        timestamp: new Date().toISOString(),
      })
    );

    // Log sanitized body for debugging (exclude sensitive fields)
    if (Object.keys(body || {}).length > 0 && this.shouldLogBody(url)) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(
        `Request Body: ${JSON.stringify(sanitizedBody)}`,
        JSON.stringify(logContext)
      );
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.log(
            `← ${method} ${url} ${statusCode} ${responseTime}ms`,
            JSON.stringify({
              ...logContext,
              type: 'response',
              statusCode,
              responseTime,
              timestamp: new Date().toISOString(),
            })
          );

          // Log slow requests
          if (responseTime > 3000) {
            this.logger.warn(
              `🐌 SLOW REQUEST: ${method} ${url} took ${responseTime}ms`,
              JSON.stringify({
                ...logContext,
                responseTime,
                threshold: 3000,
                type: 'slow-request',
              })
            );
          }

          // Log response data in development only
          if (process.env.NODE_ENV === 'development' && this.shouldLogResponseData(url)) {
            this.logger.debug(
              `Response Data: ${JSON.stringify(data).substring(0, 500)}`,
              JSON.stringify(logContext)
            );
          }
        },
        error: (error: Error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode || 500;

          this.logger.error(
            `✖ ${method} ${url} ${statusCode} ${responseTime}ms - ${error.message}`,
            JSON.stringify({
              ...logContext,
              type: 'error-response',
              statusCode,
              responseTime,
              error: error.message,
              errorName: error.name,
              timestamp: new Date().toISOString(),
            })
          );

          // Log stack trace in non-production
          if (process.env.NODE_ENV !== 'production') {
            this.logger.debug(
              `Error Stack: ${error.stack}`,
              JSON.stringify(logContext)
            );
          }
        },
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  /**
   * Sanitize request body to remove sensitive data
   */
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
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'ssn',
      'creditCard',
      'cvv',
    ];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Determine if request body should be logged
   */
  private shouldLogBody(url: string): boolean {
    // Don't log body for auth endpoints (contains passwords)
    const excludedPatterns = [
      '/auth/login',
      '/auth/register',
      '/auth/reset-password',
      '/auth/change-password',
    ];

    return !excludedPatterns.some((pattern) => url.includes(pattern));
  }

  /**
   * Determine if response data should be logged
   */
  private shouldLogResponseData(url: string): boolean {
    // Don't log response for sensitive endpoints
    const excludedPatterns = [
      '/auth/',
      '/users/me',
    ];

    return !excludedPatterns.some((pattern) => url.includes(pattern));
  }
}
