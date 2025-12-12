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
 * All Exceptions Filter
 * Catches all unhandled exceptions including non-HTTP exceptions
 * This is the last line of defense for error handling
 */
@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    @Optional() @Inject(ErrorTrackingService)
    private readonly errorTrackingService?: ErrorTrackingService,
  ) {}

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

    // Track error for potential GitHub issue creation
    this.trackException(exception, request, status, correlationId);

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

  private trackException(
    exception: unknown,
    request: Request,
    status: number,
    correlationId: string,
  ): void {
    if (!this.errorTrackingService) {
      return;
    }

    // Only track errors (not warnings)
    if (status < 400) {
      return;
    }

    const error =
      exception instanceof Error
        ? exception
        : new Error(
            exception instanceof HttpException
              ? exception.message
              : 'Unknown error',
          );

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
