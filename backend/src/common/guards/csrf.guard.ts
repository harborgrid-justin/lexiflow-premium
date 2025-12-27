import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

export const SKIP_CSRF_KEY = 'skipCsrf';

/**
 * Enterprise CSRF Protection Guard
 *
 * Implements double-submit cookie pattern for CSRF protection.
 * Validates CSRF tokens for all state-changing HTTP methods (POST, PUT, PATCH, DELETE).
 *
 * Features:
 * - Double-submit cookie pattern (token in cookie and header)
 * - Timing-safe comparison to prevent timing attacks
 * - Automatic token generation and cookie management
 * - Skip decorator for specific routes (webhooks, public APIs)
 *
 * @see OWASP CSRF Prevention Cheat Sheet
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);
  private readonly TOKEN_HEADER = 'x-csrf-token';
  private readonly TOKEN_COOKIE = 'csrf-token';
  private readonly TOKEN_LENGTH = 32;

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if CSRF validation should be skipped for this route
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method.toUpperCase();

    // Only validate CSRF for state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // For GET/HEAD/OPTIONS, ensure a CSRF token is set in cookie
      this.ensureTokenCookie(request, response);
      return true;
    }

    // Get CSRF token from header
    const headerToken = request.headers[this.TOKEN_HEADER] as string;

    // Get CSRF token from cookie
    const cookieToken = request.cookies?.[this.TOKEN_COOKIE];

    // Both tokens must be present
    if (!headerToken) {
      this.logger.warn(`CSRF token missing from header for ${method} ${request.path}`);
      throw new ForbiddenException('CSRF token missing from request header');
    }

    if (!cookieToken) {
      this.logger.warn(`CSRF cookie missing for ${method} ${request.path}`);
      throw new ForbiddenException('CSRF token cookie missing');
    }

    // Validate token format
    if (!this.isValidTokenFormat(headerToken) || !this.isValidTokenFormat(cookieToken)) {
      this.logger.warn(`Invalid CSRF token format for ${method} ${request.path}`);
      throw new ForbiddenException('Invalid CSRF token format');
    }

    // Timing-safe comparison to prevent timing attacks
    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(headerToken, 'utf8'),
        Buffer.from(cookieToken, 'utf8'),
      );

      if (!isValid) {
        this.logger.warn(`CSRF token mismatch for ${method} ${request.path}`);
        throw new ForbiddenException('Invalid CSRF token');
      }
    } catch (error) {
      // Buffer length mismatch or other crypto error
      this.logger.warn(`CSRF token validation failed for ${method} ${request.path}`);
      throw new ForbiddenException('Invalid CSRF token');
    }

    // Rotate token after successful validation (optional, enhances security)
    this.rotateToken(response);

    return true;
  }

  /**
   * Ensure a CSRF token cookie is set for the response
   */
  private ensureTokenCookie(request: Request, response: Response): void {
    const existingToken = request.cookies?.[this.TOKEN_COOKIE];

    if (!existingToken || !this.isValidTokenFormat(existingToken)) {
      this.setTokenCookie(response);
    }
  }

  /**
   * Generate and set a new CSRF token cookie
   */
  private setTokenCookie(response: Response): string {
    const token = this.generateToken();

    response.cookie(this.TOKEN_COOKIE, token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    return token;
  }

  /**
   * Rotate the CSRF token after successful validation
   */
  private rotateToken(response: Response): void {
    this.setTokenCookie(response);
  }

  /**
   * Generate a cryptographically secure random token
   */
  private generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('base64url');
  }

  /**
   * Validate token format (base64url, correct length)
   */
  private isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Base64url encoding of 32 bytes = ~43 characters
    if (token.length < 40 || token.length > 50) {
      return false;
    }

    // Only allow base64url characters
    return /^[A-Za-z0-9_-]+$/.test(token);
  }
}
