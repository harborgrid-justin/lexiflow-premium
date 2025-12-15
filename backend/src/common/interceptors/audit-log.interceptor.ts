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
import { AuditLogService } from '../services/audit-log.service';

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
      tap(async (response) => {
        const duration = Date.now() - startTime;

        try {
          await this.auditLogService.log({
            userId: user?.id || 'anonymous',
            action: auditOptions.action,
            resource: auditOptions.resource,
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
          this.logger.error(`Failed to log audit: ${error.message}`);
        }
      }),
      catchError(async (error) => {
        const duration = Date.now() - startTime;

        try {
          await this.auditLogService.log({
            userId: user?.id || 'anonymous',
            action: auditOptions.action,
            resource: auditOptions.resource,
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
