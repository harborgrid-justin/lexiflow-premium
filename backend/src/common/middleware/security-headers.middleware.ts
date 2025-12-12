import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Security Headers Middleware
 * Implements OWASP security headers best practices
 * OWASP A05:2021 - Security Misconfiguration
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityHeadersMiddleware.name);
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Remove server identification headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Strict-Transport-Security (HSTS)
    // Forces HTTPS for 1 year, including subdomains
    if (!this.isDevelopment) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }

    // Content-Security-Policy (CSP)
    // Prevents XSS, clickjacking, and other code injection attacks
    const cspDirectives = this.getCSPDirectives();
    res.setHeader('Content-Security-Policy', cspDirectives);

    // X-Frame-Options
    // Prevents clickjacking attacks
    res.setHeader('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    // Prevents MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection
    // Enable browser's XSS filter (legacy, but good defense in depth)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy
    // Controls how much referrer information is sent
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy (formerly Feature-Policy)
    // Controls which browser features can be used
    const permissionsPolicy = this.getPermissionsPolicy();
    res.setHeader('Permissions-Policy', permissionsPolicy);

    // Cross-Origin-Embedder-Policy
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    // Cross-Origin-Opener-Policy
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    // Cross-Origin-Resource-Policy
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    // Cache-Control for sensitive data
    if (this.isSensitiveRoute(req.path)) {
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private',
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // X-DNS-Prefetch-Control
    // Controls DNS prefetching
    res.setHeader('X-DNS-Prefetch-Control', 'off');

    // X-Download-Options
    // Prevents IE from executing downloads in site's context
    res.setHeader('X-Download-Options', 'noopen');

    // X-Permitted-Cross-Domain-Policies
    // Restricts Adobe Flash and PDF cross-domain policies
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    next();
  }

  /**
   * Generate Content Security Policy directives
   * Adjust based on your application's needs
   */
  private getCSPDirectives(): string {
    const directives: Record<string, string[]> = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        // Add trusted CDNs here
        // "'unsafe-inline'" for development only
        ...(this.isDevelopment ? ["'unsafe-inline'"] : []),
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Often needed for CSS-in-JS
        'https://fonts.googleapis.com',
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:',
      ],
      'font-src': [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
      ],
      'connect-src': [
        "'self'",
        // Add your API domains here
        ...(this.isDevelopment
          ? ['http://localhost:*', 'ws://localhost:*']
          : []),
      ],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    };

    // Convert to CSP string
    return Object.entries(directives)
      .map(([key, values]) => {
        if (values.length === 0) {
          return key;
        }
        return `${key} ${values.join(' ')}`;
      })
      .join('; ');
  }

  /**
   * Generate Permissions Policy
   */
  private getPermissionsPolicy(): string {
    const policies: Record<string, string> = {
      accelerometer: '()',
      autoplay: '()',
      camera: '()',
      'cross-origin-isolated': '()',
      'display-capture': '()',
      'document-domain': '()',
      'encrypted-media': '()',
      fullscreen: '(self)',
      geolocation: '()',
      gyroscope: '()',
      magnetometer: '()',
      microphone: '()',
      midi: '()',
      payment: '()',
      'picture-in-picture': '()',
      'publickey-credentials-get': '(self)',
      'screen-wake-lock': '()',
      'sync-xhr': '()',
      usb: '()',
      'web-share': '()',
      'xr-spatial-tracking': '()',
    };

    return Object.entries(policies)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
  }

  /**
   * Check if route contains sensitive data
   */
  private isSensitiveRoute(path: string): boolean {
    const sensitivePatterns = [
      '/api/auth',
      '/api/users',
      '/api/admin',
      '/api/billing',
      '/api/documents',
      '/api/cases',
      '/api/clients',
    ];

    return sensitivePatterns.some((pattern) => path.startsWith(pattern));
  }
}

/**
 * CORS Security Middleware
 * Implements secure CORS configuration
 */
@Injectable()
export class CorsSecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsSecurityMiddleware.name);
  private readonly allowedOrigins: string[];

  constructor(private configService: ConfigService) {
    const originsConfig =
      this.configService.get<string>('ALLOWED_ORIGINS') || '';
    this.allowedOrigins = originsConfig
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    if (this.allowedOrigins.length === 0) {
      this.logger.warn(
        'No allowed origins configured. CORS will allow all origins in development.',
      );
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    const isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';

    // In development, allow all origins
    if (isDevelopment) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else if (origin && this.isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Allowed methods
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );

    // Allowed headers
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-Api-Key, X-Device-Id, X-Request-ID',
    );

    // Allow credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Max age for preflight cache
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Expose headers
    res.setHeader(
      'Access-Control-Expose-Headers',
      'X-Request-ID, X-Response-Time, X-RateLimit-Limit, X-RateLimit-Remaining',
    );

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  }

  /**
   * Check if origin is allowed
   */
  private isAllowedOrigin(origin: string): boolean {
    // Exact match
    if (this.allowedOrigins.includes(origin)) {
      return true;
    }

    // Wildcard subdomain match (e.g., *.example.com)
    return this.allowedOrigins.some((allowed) => {
      if (allowed.startsWith('*.')) {
        const domain = allowed.substring(2);
        return origin.endsWith(domain) || origin === `https://${domain}`;
      }
      return false;
    });
  }
}

/**
 * Rate Limiting Headers Middleware
 */
@Injectable()
export class RateLimitHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // These values would come from your rate limiting implementation
    const limit = 1000; // requests per window
    const remaining = 950; // remaining requests
    const reset = Date.now() + 3600000; // reset time in ms

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', reset.toString());

    next();
  }
}

/**
 * Request ID Middleware
 * Adds unique request ID for tracking
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check if request already has an ID
    let requestId = req.headers['x-request-id'] as string;

    // Generate new ID if not present
    if (!requestId) {
      requestId = this.generateRequestId();
    }

    // Store in request for later use
    (req as any).requestId = requestId;

    // Add to response headers
    res.setHeader('X-Request-ID', requestId);

    next();
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Response Time Middleware
 * Tracks and logs response times
 */
@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ResponseTimeMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Log response when it's finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      res.setHeader('X-Response-Time', `${duration}ms`);

      // Log slow requests
      if (duration > 1000) {
        this.logger.warn(
          `Slow request: ${req.method} ${req.path} took ${duration}ms`,
        );
      }
    });

    next();
  }
}
