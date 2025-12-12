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
 * All Exceptions Filter
 * Catches all unhandled exceptions including non-HTTP exceptions
 * This is the last line of defense for error handling
 */
@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';

    const correlationId =
      exception instanceof BaseCustomException
        ? exception.correlationId
        : this.generateCorrelationId();

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      message,
      error:
        exception instanceof Error
          ? {
              name: exception.name,
              message: exception.message,
              ...(exception instanceof BaseCustomException && {
                context: exception.context,
              }),
              stack:
                process.env.NODE_ENV === 'development'
                  ? exception.stack
                  : undefined,
            }
          : { message: 'Unknown error occurred' },
    };

    // Log with appropriate level and detail
    this.logException(exception, request, status, correlationId);

    response.status(status).json(errorResponse);
  }

  private logException(
    exception: unknown,
    request: Request,
    status: number,
    correlationId: string,
  ): void {
    const logData = {
      correlationId,
      statusCode: status,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      ...(exception instanceof Error && {
        errorName: exception.name,
        errorMessage: exception.message,
      }),
      ...(exception instanceof BaseCustomException && {
        context: exception.context,
      }),
    };

    if (status >= 500) {
      this.logger.error(
        `Unhandled Server Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        JSON.stringify(logData),
      );

      // Log stack trace separately for server errors
      if (exception instanceof Error && exception.stack) {
        this.logger.error(exception.stack);
      }
    } else {
      this.logger.warn(
        `Unhandled Client Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        JSON.stringify(logData),
      );
    }
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
