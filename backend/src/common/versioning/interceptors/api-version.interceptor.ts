import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiVersioningModule } from '../api-versioning.module';

/**
 * API Version Interceptor
 *
 * Adds version information to response headers
 * Handles deprecation warnings
 * Tracks API version usage for analytics
 */
@Injectable()
export class ApiVersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Extract version from URL (e.g., /api/v1/resource -> 1)
    const urlParts = request.url.split('/');
    const versionIndex = urlParts.findIndex((part: string) => part.startsWith('v'));
    const version = versionIndex !== -1 ? urlParts[versionIndex].substring(1) : '1';

    // Add version headers
    response.setHeader('X-API-Version', version);
    response.setHeader('X-API-Supported-Versions', ApiVersioningModule.getSupportedVersions().join(', '));

    // Add deprecation warning if version is deprecated
    if (ApiVersioningModule.isVersionDeprecated(version)) {
      const deprecationMessage = `API version ${version} is deprecated. Please migrate to the latest version.`;
      response.setHeader('Warning', `299 - "${deprecationMessage}"`);
      response.setHeader('X-API-Deprecation-Date', this.getDeprecationDate(version));
      response.setHeader('X-API-Sunset-Date', this.getSunsetDate(version));
    }

    // Add rate limit info headers (placeholder for actual rate limiting)
    response.setHeader('X-RateLimit-Limit', '1000');
    response.setHeader('X-RateLimit-Remaining', '999');
    response.setHeader('X-RateLimit-Reset', new Date(Date.now() + 3600000).toISOString());

    return next.handle().pipe(
      map((data) => {
        // Add version info to response body for list endpoints
        if (data && typeof data === 'object' && 'data' in data) {
          return {
            ...data,
            _meta: {
              version,
              timestamp: new Date().toISOString(),
              requestId: request.id || this.generateRequestId(),
            },
          };
        }
        return data;
      }),
    );
  }

  private getDeprecationDate(version: string): string {
    // In a real implementation, this would come from a configuration
    const deprecationDates: Record<string, string> = {};
    return deprecationDates[version] || 'N/A';
  }

  private getSunsetDate(version: string): string {
    // In a real implementation, this would come from a configuration
    const sunsetDates: Record<string, string> = {};
    return sunsetDates[version] || 'N/A';
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
