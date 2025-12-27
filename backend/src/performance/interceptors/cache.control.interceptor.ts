import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import * as MasterConfig from '@config/master.config';

/**
 * Cache Control Configuration
 */
export interface CacheControlConfig {
  maxAge?: number;
  sMaxAge?: number;
  public?: boolean;
  private?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  proxyRevalidate?: boolean;
  immutable?: boolean;
  staleWhileRevalidate?: number;
  staleIfError?: number;
}

/**
 * Cache Control Interceptor
 *
 * Provides enterprise-grade HTTP caching:
 * - Automatic Cache-Control header management
 * - ETag generation for conditional requests
 * - Last-Modified header support
 * - 304 Not Modified responses
 * - Vary header management
 * - Cache busting strategies
 * - CDN-friendly caching directives
 *
 * Supports:
 * - Public/Private caching
 * - Max-Age and S-Max-Age directives
 * - Stale-while-revalidate pattern
 * - Conditional GET (If-None-Match, If-Modified-Since)
 *
 * @example
 * @UseInterceptors(CacheControlInterceptor)
 * @Get('users')
 * async getUsers() { ... }
 */
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheControlInterceptor.name);
  private readonly defaultMaxAge = MasterConfig.CACHE_CONTROL_MAX_AGE || 3600;
  private readonly enableEtag = MasterConfig.ENABLE_ETAG !== false;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Skip caching for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        this.applyCacheHeaders(request, response, data);
      }),
    );
  }

  /**
   * Apply cache headers to response
   */
  private applyCacheHeaders(
    request: Request,
    response: Response,
    data: any,
  ): void {
    // Don't cache if already set or if error response
    if (response.getHeader('Cache-Control') || response.statusCode >= 400) {
      return;
    }

    // Get cache configuration from route metadata (if available)
    const config = this.getCacheConfig(request);

    // Set Cache-Control header
    const cacheControl = this.buildCacheControl(config);
    response.setHeader('Cache-Control', cacheControl);

    // Set Vary header for content negotiation
    this.setVaryHeader(response);

    // Generate and set ETag
    if (this.enableEtag && data) {
      const etag = this.generateETag(data);
      response.setHeader('ETag', etag);

      // Check for conditional request
      if (this.checkConditionalRequest(request, etag)) {
        response.status(304);
        return;
      }
    }

    // Set Last-Modified header
    const lastModified = this.getLastModified(data);
    if (lastModified) {
      response.setHeader('Last-Modified', lastModified.toUTCString());

      // Check If-Modified-Since
      if (this.checkIfModifiedSince(request, lastModified)) {
        response.status(304);
        return;
      }
    }

    this.logger.debug(
      `Cache headers set for ${request.method} ${request.path}: ${cacheControl}`,
    );
  }

  /**
   * Build Cache-Control header value
   */
  private buildCacheControl(config: CacheControlConfig): string {
    const directives: string[] = [];

    // Visibility
    if (config.public) {
      directives.push('public');
    } else if (config.private) {
      directives.push('private');
    } else {
      // Default to public for GET requests
      directives.push('public');
    }

    // No cache directives
    if (config.noCache) {
      directives.push('no-cache');
    }

    if (config.noStore) {
      directives.push('no-store');
      return directives.join(', ');
    }

    // Max-Age
    const maxAge = config.maxAge ?? this.defaultMaxAge;
    if (maxAge > 0) {
      directives.push(`max-age=${maxAge}`);
    }

    // S-Max-Age (CDN/Proxy cache)
    if (config.sMaxAge !== undefined) {
      directives.push(`s-maxage=${config.sMaxAge}`);
    }

    // Revalidation
    if (config.mustRevalidate) {
      directives.push('must-revalidate');
    }

    if (config.proxyRevalidate) {
      directives.push('proxy-revalidate');
    }

    // Immutable (never changes)
    if (config.immutable) {
      directives.push('immutable');
    }

    // Stale responses
    if (config.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
    }

    if (config.staleIfError !== undefined) {
      directives.push(`stale-if-error=${config.staleIfError}`);
    }

    return directives.join(', ');
  }

  /**
   * Generate ETag from response data
   */
  private generateETag(data: any): string {
    const hash = crypto.createHash('md5');
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    hash.update(content);
    return `"${hash.digest('hex')}"`;
  }

  /**
   * Check conditional request (If-None-Match)
   */
  private checkConditionalRequest(request: Request, etag: string): boolean {
    const ifNoneMatch = request.headers['if-none-match'];
    if (!ifNoneMatch) {
      return false;
    }

    // Handle multiple ETags
    const etags = ifNoneMatch.split(',').map(tag => tag.trim());
    return etags.includes(etag) || etags.includes('*');
  }

  /**
   * Check If-Modified-Since header
   */
  private checkIfModifiedSince(
    request: Request,
    lastModified: Date,
  ): boolean {
    const ifModifiedSince = request.headers['if-modified-since'];
    if (!ifModifiedSince) {
      return false;
    }

    try {
      const ifModifiedSinceDate = new Date(ifModifiedSince);
      return lastModified.getTime() <= ifModifiedSinceDate.getTime();
    } catch (error) {
      return false;
    }
  }

  /**
   * Set Vary header for proper cache key generation
   */
  private setVaryHeader(response: Response): void {
    const existingVary = response.getHeader('Vary') as string;
    const varyHeaders = new Set<string>(
      existingVary ? existingVary.split(',').map(h => h.trim()) : [],
    );

    // Add standard headers that affect response
    varyHeaders.add('Accept-Encoding');
    varyHeaders.add('Authorization');

    response.setHeader('Vary', Array.from(varyHeaders).join(', '));
  }

  /**
   * Get cache configuration (can be extended with decorators)
   */
  private getCacheConfig(request: Request): CacheControlConfig {
    // Default configuration
    const config: CacheControlConfig = {
      maxAge: this.defaultMaxAge,
      public: true,
    };

    // Static assets - long cache with immutable
    if (this.isStaticAsset(request.path)) {
      return {
        public: true,
        maxAge: 31536000, // 1 year
        immutable: true,
      };
    }

    // API responses - short cache with revalidation
    if (request.path.startsWith('/api/')) {
      return {
        public: false,
        private: true,
        maxAge: 300, // 5 minutes
        mustRevalidate: true,
        staleWhileRevalidate: 60,
      };
    }

    return config;
  }

  /**
   * Check if path is for static asset
   */
  private isStaticAsset(path: string): boolean {
    const staticExtensions = [
      '.js',
      '.css',
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.svg',
      '.webp',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot',
    ];

    return staticExtensions.some(ext => path.endsWith(ext));
  }

  /**
   * Extract Last-Modified date from data
   */
  private getLastModified(data: any): Date | null {
    if (!data) {
      return null;
    }

    // Check common date fields
    const dateFields = ['updatedAt', 'modifiedAt', 'lastModified', 'updated'];

    for (const field of dateFields) {
      if (data[field]) {
        const date = new Date(data[field]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    // Check nested objects
    if (typeof data === 'object' && !Array.isArray(data)) {
      for (const key in data) {
        if (typeof data[key] === 'object') {
          const nested = this.getLastModified(data[key]);
          if (nested) {
            return nested;
          }
        }
      }
    }

    return null;
  }
}
