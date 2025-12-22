import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip;
    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    if (Object.keys(body || {}).length > 0) {
      // Don't log sensitive data like passwords
      const sanitizedBody = { ...body };
      if (sanitizedBody.password) sanitizedBody.password = '***';
      if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '***';
      if (sanitizedBody.newPassword) sanitizedBody.newPassword = '***';

      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Response: ${method} ${url} - ${responseTime}ms - Success`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Response: ${method} ${url} - ${responseTime}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
