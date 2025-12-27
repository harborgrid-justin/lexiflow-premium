import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityHeadersService } from '../services/security.headers.service';

/**
 * Security Headers Middleware
 * Automatically applies comprehensive security headers to all responses
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityHeadersMiddleware.name);

  constructor(private readonly securityHeadersService: SecurityHeadersService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Generate a unique nonce for this request
    const nonce = this.securityHeadersService.generateNonce();

    // Store nonce in request for use in templates
    (req as any).cspNonce = nonce;

    // Determine which headers to apply based on route
    const path = req.path;

    if (this.isApiRoute(path)) {
      // Apply strict API security headers
      this.securityHeadersService.applyApiSecurityHeaders(res);
    } else if (this.isGraphQLRoute(path)) {
      // Apply GraphQL-specific headers
      this.securityHeadersService.applyGraphQLSecurityHeaders(res);
    } else if (this.isWebSocketRoute(path)) {
      // Apply WebSocket headers
      this.securityHeadersService.applyWebSocketSecurityHeaders(res);
    } else {
      // Apply standard security headers with CSP nonce
      this.securityHeadersService.applySecurityHeaders(res, { nonce });
    }

    // Remove insecure headers
    this.securityHeadersService.removeInsecureHeaders(res);

    next();
  }

  /**
   * Check if route is an API endpoint
   */
  private isApiRoute(path: string): boolean {
    return path.startsWith('/api/') && !path.includes('/graphql');
  }

  /**
   * Check if route is GraphQL endpoint
   */
  private isGraphQLRoute(path: string): boolean {
    return path.includes('/graphql');
  }

  /**
   * Check if route is WebSocket endpoint
   */
  private isWebSocketRoute(path: string): boolean {
    return path.includes('/socket.io') || path.includes('/ws');
  }
}
