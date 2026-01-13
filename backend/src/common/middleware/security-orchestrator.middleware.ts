import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface SecurityContext {
  ip: string;
  userAgent: string;
  origin: string | null;
  referer: string | null;
  method?: string;
  path?: string;
  protocol?: string;
  isSecure: boolean;
  timestamp: string;
}

interface ExtendedRequest extends Request {
  requestId?: string;
  startTime?: number;
  securityContext?: SecurityContext;
  user?: { id: string };
}

type ExtendedResponse = Response;

/**
 * Security Orchestrator Middleware
 *
 * Coordinates all security middleware and sets up the security context
 * for each request. This middleware should be applied globally and runs
 * before all other middleware.
 *
 * Security Layers Applied (in order):
 * 1. Request ID generation for audit logging
 * 2. Security headers initialization
 * 3. Request timing for anomaly detection
 * 4. Security context setup
 * 5. Audit trail initialization
 *
 * Works in conjunction with:
 * - RequestValidationMiddleware
 * - SanitizationMiddleware
 * - SecurityHeadersMiddleware
 * - Various guards (CSRF, Rate Limit, JWT)
 */
@Injectable()
export class SecurityOrchestratorMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityOrchestratorMiddleware.name);

  use(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): void {
    // 1. Generate unique request ID for tracking
    const requestId = this.generateRequestId();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    // 2. Record request start time for performance monitoring
    const startTime = Date.now();
    req.startTime = startTime;

    // 3. Extract and store security context
    this.setupSecurityContext(req);

    // 4. Log security-relevant request information
    this.logSecurityInfo(req, requestId);

    // 5. Setup response listeners for audit logging
    this.setupResponseListeners(req, res, startTime, requestId);

    // 6. Add security metadata to response
    this.addSecurityMetadata(res);

    next();
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Setup security context for the request
   */
  private setupSecurityContext(req: ExtendedRequest): void {
    const securityContext = {
      ip: this.getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      origin: (req.headers.origin as string) || null,
      referer: (req.headers.referer as string) || null,
      method: req.method,
      path: req.path,
      protocol: req.protocol,
      isSecure: req.secure || req.protocol === 'https',
      timestamp: new Date().toISOString(),
    };

    req.securityContext = securityContext;
  }

  /**
   * Log security-relevant information
   */
  private logSecurityInfo(req: ExtendedRequest, requestId: string): void {
    const context = req.securityContext;

    // Log potentially suspicious requests
    if (this.isSuspiciousRequest(req)) {
      this.logger.warn('Suspicious request detected', {
        requestId,
        ip: context?.ip || '',
        method: req.method,
        path: req.path,
        userAgent: context?.userAgent || '',
      });
    }

    // Log all authentication attempts
    if (this.isAuthenticationRequest(req)) {
      this.logger.log('Authentication request', {
        requestId,
        ip: context?.ip || '',
        path: req.path,
      });
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`[${requestId}] ${req.method} ${req.path}`, {
        ip: context?.ip || '',
        userAgent: context?.userAgent || '',
      });
    }
  }

  /**
   * Setup response listeners for audit logging
   */
  private setupResponseListeners(
    req: ExtendedRequest,
    res: ExtendedResponse,
    startTime: number,
    requestId: string,
  ): void {
    // Listen for response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const context = req.securityContext;

      // Log slow requests (potential DoS)
      if (duration > 5000) {
        this.logger.warn('Slow request detected', {
          requestId,
          duration,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
        });
      }

      // Log failed authentication attempts
      if (this.isAuthenticationRequest(req) && res.statusCode === 401) {
        this.logger.warn('Failed authentication attempt', {
          requestId,
          ip: context?.ip || '',
          path: req.path,
          userAgent: context?.userAgent || '',
        });
      }

      // Log access denied
      if (res.statusCode === 403) {
        this.logger.warn('Access denied', {
          requestId,
          ip: context?.ip || '',
          path: req.path,
          userId: req.user?.id,
        });
      }

      // Log server errors for investigation
      if (res.statusCode >= 500) {
        this.logger.error('Server error', {
          requestId,
          statusCode: res.statusCode,
          method: req.method,
          path: req.path,
          ip: context?.ip || '',
        });
      }
    });

    // Listen for response errors
    res.on('error', (error: Error) => {
      this.logger.error('Response error', {
        requestId,
        error: error.message,
        stack: error.stack,
        method: req.method,
        path: req.path,
      });
    });
  }

  /**
   * Add security metadata to response
   */
  private addSecurityMetadata(res: ExtendedResponse): void {
    // Add security policy identifier
    res.setHeader('X-Security-Policy', 'LexiFlow-Enterprise-v1');

    // Add processing timestamp
    res.setHeader('X-Processing-Time', Date.now().toString());
  }

  /**
   * Get client IP address
   */
  private getClientIp(req: ExtendedRequest): string {
    // Check various headers for IP (in order of trust)
    const cfConnectingIp = req.headers['cf-connecting-ip'] as string;
    const xRealIp = req.headers['x-real-ip'] as string;
    const xForwardedFor = req.headers['x-forwarded-for'] as string;

    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    if (xRealIp) {
      return xRealIp;
    }

    if (xForwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return xForwardedFor.split(',')[0]?.trim() || 'unknown';
    }

    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  /**
   * Check if request is suspicious
   */
  private isSuspiciousRequest(req: ExtendedRequest): boolean {
    const path = req.path.toLowerCase();
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    // Suspicious paths
    const suspiciousPaths = [
      '/admin',
      '/wp-admin',
      '/phpmyadmin',
      '/.env',
      '/.git',
      '/config',
      '/backup',
      '/vendor',
    ];

    if (suspiciousPaths.some((p) => path.includes(p))) {
      return true;
    }

    // Suspicious user agents (common scanners/bots)
    const suspiciousAgents = [
      'scanner',
      'nikto',
      'sqlmap',
      'nmap',
      'masscan',
      'metasploit',
    ];

    if (suspiciousAgents.some((a) => userAgent.includes(a))) {
      return true;
    }

    // Missing or suspicious user agent
    if (!userAgent || userAgent === '-') {
      return true;
    }

    return false;
  }

  /**
   * Check if request is an authentication request
   */
  private isAuthenticationRequest(req: ExtendedRequest): boolean {
    const authPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/logout',
      '/auth/refresh',
      '/api/auth/',
      '/api/v1/auth/',
    ];

    const path = req.path.toLowerCase();
    return authPaths.some((p) => path.includes(p));
  }
}
