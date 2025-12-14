import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Enterprise Exception Filter
 * Provides structured error responses with correlation IDs, error codes,
 * and detailed logging for monitoring and debugging
 */
@Catch()
export class EnterpriseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(EnterpriseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getHttpStatus(exception);
    const errorResponse = this.buildErrorResponse(exception, request, status);

    // Log error with context
    this.logError(exception, request, errorResponse);

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof QueryFailedError) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
    status: number,
  ): ErrorResponse {
    const correlationId = (request as any).correlationId || 'N/A';
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Base response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp,
      path,
      correlationId,
      error: this.getErrorName(exception),
      message: this.getErrorMessage(exception),
      errorCode: this.getErrorCode(exception, status),
    };

    // Add validation errors if present
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'message' in response) {
        const msg = (response as any).message;
        if (Array.isArray(msg)) {
          errorResponse.validationErrors = msg;
        }
      }
    }

    // Add DB error details (sanitized)
    if (exception instanceof QueryFailedError) {
      errorResponse.details = {
        constraint: (exception as any).constraint,
        table: (exception as any).table,
      };
    }

    // Add stack trace in development
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    return errorResponse;
  }

  private getErrorName(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.constructor.name;
    }

    if (exception instanceof QueryFailedError) {
      return 'DatabaseError';
    }

    if (exception instanceof Error) {
      return exception.name;
    }

    return 'UnknownError';
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (typeof response === 'object' && 'message' in response) {
        const msg = (response as any).message;
        return Array.isArray(msg) ? msg.join(', ') : msg;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'An unexpected error occurred';
  }

  private getErrorCode(exception: unknown, status: number): string {
    // Generate semantic error codes
    if (exception instanceof HttpException) {
      const name = exception.constructor.name;
      return `ERR_${name.replace('Exception', '').toUpperCase()}`;
    }

    if (exception instanceof QueryFailedError) {
      return 'ERR_DATABASE';
    }

    return `ERR_HTTP_${status}`;
  }

  private logError(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse,
  ): void {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'N/A';

    const logContext = {
      correlationId: errorResponse.correlationId,
      method,
      url,
      ip,
      userAgent,
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.errorCode,
      error: errorResponse.error,
      message: errorResponse.message,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `Server Error: ${errorResponse.message}`,
        JSON.stringify(logContext),
      );
    } else {
      this.logger.warn(
        `Client Error: ${errorResponse.message}`,
        JSON.stringify(logContext),
      );
    }

    // Log full exception in development
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      this.logger.debug(exception.stack);
    }
  }
}

/**
 * Structured error response
 */
export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  correlationId: string;
  error: string;
  message: string;
  errorCode: string;
  validationErrors?: string[];
  details?: Record<string, any>;
  stack?: string;
}
