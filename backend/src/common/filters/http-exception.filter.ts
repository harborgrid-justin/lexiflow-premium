import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
  Inject,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseCustomException } from '../exceptions/custom-exceptions';
import { ErrorTrackingService, ErrorSeverity } from '../exceptions/error-tracking.service';

/**
 * HTTP Exception Filter
 * Handles all HTTP exceptions and formats them consistently
 */
@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(
    @Optional() @Inject(ErrorTrackingService)
    private readonly errorTrackingService?: ErrorTrackingService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract correlation ID from custom exception or generate new one
    const correlationId =
      exception instanceof BaseCustomException
        ? exception.correlationId
        : this.generateCorrelationId();

    // Build error response
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      error: this.extractErrorDetails(exceptionResponse, exception),
      // Only include stack trace in development
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception.stack,
      }),
    };

    // Log the error
    this.logError(errorResponse, exception, request);

    // Track error for potential GitHub issue creation
    this.trackError(exception, request, status, correlationId);

    // Send response
    response.status(status).json(errorResponse);
  }

  private extractErrorDetails(
    exceptionResponse: string | object,
    exception: HttpException,
  ): any {
    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
      };
    }

    if (exception instanceof BaseCustomException) {
      return {
        message: exception.message,
        context: exception.context,
      };
    }

    return exceptionResponse;
  }

  private logError(
    errorResponse: any,
    exception: HttpException,
    request: Request,
  ): void {
    const { statusCode, correlationId } = errorResponse;
    const { method, url, ip, headers } = request;

    const logData = {
      correlationId,
      statusCode,
      method,
      url,
      ip,
      userAgent: headers['user-agent'],
      message: exception.message,
      ...(exception instanceof BaseCustomException && {
        context: exception.context,
      }),
    };

    if (statusCode >= 500) {
      this.logger.error(
        `Server Error: ${exception.message}`,
        JSON.stringify(logData),
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `Client Error: ${exception.message}`,
        JSON.stringify(logData),
      );
    }
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackError(
    exception: HttpException,
    request: Request,
    status: number,
    correlationId: string,
  ): void {
    if (!this.errorTrackingService) {
      return;
    }

    // Only track errors (4xx and 5xx)
    if (status < 400) {
      return;
    }

    const error = exception instanceof Error ? exception : new Error(exception.message);
    const severity = ErrorTrackingService.categorizeSeverity(status, error);

    // Track asynchronously to not block response
    this.errorTrackingService
      .trackError({
        correlationId,
        error,
        context:
          exception instanceof BaseCustomException
            ? exception.context
            : undefined,
        userId: (request as any).user?.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        url: request.url,
        method: request.method,
        statusCode: status,
        severity,
      })
      .catch((trackingError) => {
        this.logger.error(
          'Failed to track error',
          trackingError instanceof Error ? trackingError.stack : String(trackingError),
        );
      });
  }
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  correlationId: string;
  error: {
    message: string;
    context?: Record<string, any>;
  };
  stack?: string;
}
