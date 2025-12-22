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

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (_response) => {
        const duration = Date.now() - startTime;

        try {
          await this.auditLogService.log({
            userId: user?.id || 'anonymous',
            action: auditOptions.action as AuditAction,
            resource: auditOptions.resource,
            resourceId: request.params?.id || request.params?.[Object.keys(request.params || {})[0]] || 'unknown',
            description:
              auditOptions.description || `${auditOptions.action} performed`,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
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
          const _stack = error instanceof Error ? error._stack : undefined;
          this.logger.error(`Failed to log audit: ${message}`);
        }
      }),
      catchError(async (error) => {
        const duration = Date.now() - startTime;

        try {
          await this.auditLogService.log({
            userId: user?.id || 'anonymous',
            action: auditOptions.action as AuditAction,
            resource: auditOptions.resource,
            resourceId: request.params?.id || request.params?.[Object.keys(request.params || {})[0]] || 'unknown',
            description: `Failed: ${auditOptions.action}`,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
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
          this.logger.error(`Failed to log audit: ${logError.message}`);
        }

        throw error;
      }),
    );
  }
}
