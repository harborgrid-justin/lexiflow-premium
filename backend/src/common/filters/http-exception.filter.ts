import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseCustomException } from '../exceptions/custom-exceptions';

/**
 * HTTP Exception Filter
 * Handles all HTTP exceptions and formats them consistently
 */
@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

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
