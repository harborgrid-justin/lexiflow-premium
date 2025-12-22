import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import {
  AUDIT_LOG_KEY,
  AuditLogOptions,
} from '../decorators/audit-log.decorator';
import { AuditLogService, AuditAction } from '../services/audit-log.service';

interface RequestUser {
  id: string;
  email?: string;
  role?: string;
}

interface AuditRequest {
  user?: RequestUser;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  method: string;
  url: string;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  id?: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditOptions = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuditRequest>();
    const user = request.user;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (_response: unknown) => {
        const duration = Date.now() - startTime;

        try {
          await this.auditLogService.log({
            userId: user?.id || 'anonymous',
            action: auditOptions.action as AuditAction,
            resource: auditOptions.resource,
            resourceId: this.extractResourceId(request),
            description:
              auditOptions.description || `${auditOptions.action} performed`,
            ipAddress: request.ip || 'unknown',
            userAgent: this.extractUserAgent(request.headers),
            method: request.method,
            url: request.url,
            status: 'success',
            duration,
            metadata: {
              requestId: request.id,
              params: request.params,
              query: request.query,
            },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          
          this.logger.error(`Failed to log audit: ${message}`);
        }
      }),
      catchError(async (error: Error) => {
        const duration = Date.now() - startTime;

        try {
          await this.auditLogService.log({
            userId: user?.id || 'anonymous',
            action: auditOptions.action as AuditAction,
            resource: auditOptions.resource,
            resourceId: this.extractResourceId(request),
            description: `Failed: ${auditOptions.action}`,
            ipAddress: request.ip || 'unknown',
            userAgent: this.extractUserAgent(request.headers),
            method: request.method,
            url: request.url,
            status: 'failure',
            duration,
            metadata: {
              requestId: request.id,
              error: error.message,
            },
          });
        } catch (logError) {
          const logErrorMessage = logError instanceof Error ? logError.message : 'Unknown error';
          this.logger.error(`Failed to log audit: ${logErrorMessage}`);
        }

        throw error;
      }),
    );
  }

  /**
   * Extract resource ID from request params
   */
  private extractResourceId(request: AuditRequest): string {
    if (request.params?.id) {
      return request.params.id;
    }
    
    if (request.params && Object.keys(request.params).length > 0) {
      const firstKey = Object.keys(request.params)[0];
      if (firstKey) {
        const firstValue = request.params[firstKey];
        if (firstValue) {
          return firstValue;
        }
      }
    }
    
    return 'unknown';
  }

  /**
   * Extract user agent from headers
   */
  private extractUserAgent(headers: Record<string, string | string[] | undefined>): string {
    const userAgent = headers['user-agent'];
    if (typeof userAgent === 'string') {
      return userAgent;
    }
    if (Array.isArray(userAgent) && userAgent.length > 0 && userAgent[0]) {
      return userAgent[0];
    }
    return 'unknown';
  }
}
