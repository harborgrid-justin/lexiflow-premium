import { StructuredLoggerService } from "@monitoring/services/structured.logger.service";
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Optional,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

interface ExtendedRequest extends Request {
  correlationId?: string;
  user?: { id: string };
}

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Optional()
    @Inject(StructuredLoggerService)
    private readonly logger?: StructuredLoggerService
  ) {
    // If structured logger is not available, this interceptor will skip logging
    // This allows the interceptor to work even if monitoring module is not imported
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<ExtendedRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const body = request.body as Record<string, unknown>;
    const headers = request.headers as Record<string, unknown>;
    // Safe logging of body
    try {
      console.log(`[LoggingInterceptor] ${method} ${url}`, JSON.stringify(body));
    } catch {
      console.log(`[LoggingInterceptor] ${method} ${url}`, '[Circular or Non-serializable Body]');
    }

    if (!this.logger) {
      return next.handle();
    }
    const userAgent = headers["user-agent"] || "";
    const ip = request.ip;
    const correlationId = request.correlationId;
    const userId = request.user?.id;
    const now = Date.now();

    // Set context for this request
    this.logger.setContext({
      correlationId: correlationId || '',
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
    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      this.logger.debug("Request body", {
        body,
        method,
        url,
      });
    }

    return next.handle().pipe(
      tap({
        next: (_data: unknown) => {
          const responseTime = Date.now() - now;

          if (this.logger) {
            this.logger.log(`Request completed: ${method} ${url}`, {
              method,
              url,
              statusCode: response.statusCode,
              duration: responseTime,
              correlationId,
              userId,
            });
          }
        },
        error: (error: HttpError) => {
          const responseTime = Date.now() - now;

          if (this.logger) {
            this.logger.error(`Request failed: ${method} ${url}`, error.stack, {
              method,
              url,
              duration: responseTime,
              errorMessage: error.message,
              errorName: error.name,
              statusCode: error.status || error.statusCode || 500,
              correlationId,
              userId,
            });
          }
        },
      })
    );
  }
}