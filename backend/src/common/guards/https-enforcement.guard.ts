import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUIRE_HTTPS_KEY } from '@common/decorators/require-https.decorator';

/**
 * HTTPS Enforcement Guard
 *
 * Enforces HTTPS protocol for sensitive endpoints.
 * Rejects HTTP requests with 403 Forbidden.
 *
 * Features:
 * - Protocol validation
 * - Header-based HTTPS detection (for reverse proxies)
 * - Development mode bypass option
 * - Detailed logging
 *
 * @example
 * @UseGuards(HttpsEnforcementGuard)
 * @RequireHttps()
 * @Post('payment')
 * async processPayment() {}
 */
@Injectable()
export class HttpsEnforcementGuard implements CanActivate {
  private readonly logger = new Logger(HttpsEnforcementGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireHttps = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_HTTPS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireHttps) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Check if HTTPS is being used
    if (!this.isHttps(request)) {
      // Allow HTTP in development mode (configurable)
      if (this.shouldAllowHttpInDevelopment()) {
        this.logger.warn(
          `HTTPS required but HTTP used (allowed in development): ${request.method} ${request.path}`,
        );
        return true;
      }

      this.logger.warn(
        `HTTPS required but HTTP used: ${request.method} ${request.path} from ${request.ip}`,
      );

      throw new ForbiddenException(
        'This endpoint requires a secure HTTPS connection',
      );
    }

    return true;
  }

  /**
   * Check if request is over HTTPS
   */
  private isHttps(request: Request): boolean {
    // Direct HTTPS check
    if (request.secure) {
      return true;
    }

    // Check protocol
    if (request.protocol === 'https') {
      return true;
    }

    // Check X-Forwarded-Proto header (for reverse proxies)
    const forwardedProto = request.headers['x-forwarded-proto'] as string;
    if (forwardedProto === 'https') {
      return true;
    }

    // Check Cloudflare header
    const cfVisitor = request.headers['cf-visitor'] as string;
    if (cfVisitor) {
      try {
        const visitor = JSON.parse(cfVisitor) as { scheme?: string };
        if (visitor.scheme === 'https') {
          return true;
        }
      } catch {
        // Invalid JSON, ignore
      }
    }

    return false;
  }

  /**
   * Check if HTTP should be allowed in development
   */
  private shouldAllowHttpInDevelopment(): boolean {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const allowHttpInDev = process.env.ALLOW_HTTP_IN_DEV === 'true';

    return isDevelopment && allowHttpInDev;
  }
}
