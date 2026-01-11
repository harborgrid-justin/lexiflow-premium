import { Injectable, NestMiddleware, Logger, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Enterprise Request Validation Middleware
 *
 * Validates incoming requests for common security issues:
 * - Maximum request size
 * - Content-Type validation
 * - Suspicious headers
 * - Path traversal attempts
 * - Malformed JSON
 * - NULL byte injection
 *
 * This middleware acts as a first line of defense before
 * requests reach controllers and DTOs.
 *
 * @see OWASP Input Validation Cheat Sheet
 */
@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestValidationMiddleware.name);

  // Maximum request sizes (in bytes)
  private readonly MAX_JSON_SIZE = 10 * 1024 * 1024; // 10 MB
  private readonly MAX_URL_LENGTH = 2048; // 2 KB
  private readonly MAX_HEADER_SIZE = 8192; // 8 KB

  // Allowed content types
  private readonly ALLOWED_CONTENT_TYPES = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
    'application/octet-stream',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  // Suspicious header patterns
  private readonly SUSPICIOUS_HEADERS = [
    'x-forwarded-host',
    'x-original-url',
    'x-rewrite-url',
  ];

  use(req: Request, _res: Response, next: NextFunction): void {
    try {
      // 1. Validate URL length
      this.validateUrlLength(req);

      // 2. Validate headers
      this.validateHeaders(req);

      // 3. Validate content type
      this.validateContentType(req);

      // 4. Check for path traversal
      this.checkPathTraversal(req);

      // 5. Validate request size
      this.validateRequestSize(req);

      // 6. Check for NULL bytes in URL
      this.checkNullBytes(req);

      // 7. Validate method
      this.validateHttpMethod(req);

      next();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Request validation error:', error);
      throw new BadRequestException('Invalid request format');
    }
  }

  /**
   * Validate URL length to prevent DOS attacks
   */
  private validateUrlLength(req: Request): void {
    const url = req.originalUrl || req.url;

    if (url.length > this.MAX_URL_LENGTH) {
      this.logger.warn(`URL too long: ${url.length} bytes (max: ${this.MAX_URL_LENGTH})`);
      throw new BadRequestException('URL too long');
    }
  }

  /**
   * Validate request headers for suspicious patterns
   */
  private validateHeaders(req: Request): void {
    // Check total header size
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > this.MAX_HEADER_SIZE) {
      this.logger.warn(`Headers too large: ${headerSize} bytes (max: ${this.MAX_HEADER_SIZE})`);
      throw new BadRequestException('Request headers too large');
    }

    // Check for suspicious headers
    for (const suspiciousHeader of this.SUSPICIOUS_HEADERS) {
      if (req.headers[suspiciousHeader]) {
        this.logger.warn(`Suspicious header detected: ${suspiciousHeader}`);
        // Log but don't block - some legitimate proxies use these
      }
    }

    // Validate Host header (prevent Host header injection)
    const host = req.headers.host;
    if (host) {
      if (this.containsSuspiciousPatterns(host)) {
        this.logger.warn(`Suspicious Host header: ${host}`);
        throw new BadRequestException('Invalid Host header');
      }
    }

    // Check for NULL bytes in headers
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string' && value.includes('\0')) {
        this.logger.warn(`NULL byte in header ${key}`);
        throw new BadRequestException('Invalid header format');
      }
    }
  }

  /**
   * Validate Content-Type header
   */
  private validateContentType(req: Request): void {
    // Only validate for methods that typically have a body
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return;
    }

    const contentType = req.headers['content-type'];
    if (!contentType) {
      // Allow requests without content type if no body
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > 0) {
        this.logger.warn('Request has body but no Content-Type header');
        throw new BadRequestException('Content-Type header required');
      }
      return;
    }

    // Extract base content type (before semicolon)
    const baseContentType = (contentType.split(';')[0] || '').trim().toLowerCase();

    // Check if content type is allowed
    const isAllowed = this.ALLOWED_CONTENT_TYPES.some((allowed) =>
      baseContentType.startsWith(allowed.toLowerCase()),
    );

    if (!isAllowed) {
      this.logger.warn(`Unsupported Content-Type: ${contentType}`);
      throw new BadRequestException(`Unsupported Content-Type: ${baseContentType}`);
    }
  }

  /**
   * Check for path traversal attempts
   */
  private checkPathTraversal(req: Request): void {
    const url = req.originalUrl || req.url;
    const path = req.path;

    // Check for common path traversal patterns
    const pathTraversalPatterns = [
      /..//g,      // ../
      /..\/g,      // ..\
      /%2e%2e%2f/gi,  // URL encoded ../
      /%2e%2e%5c/gi,  // URL encoded ..\
      /../g,        // ..
    ];

    for (const pattern of pathTraversalPatterns) {
      if (pattern.test(url) || pattern.test(path)) {
        this.logger.warn(`Path traversal attempt detected: ${url}`);
        throw new BadRequestException('Invalid path');
      }
    }

    // Check for absolute paths (Unix and Windows)
    if (path.startsWith('/etc/') ||
        path.startsWith('/var/') ||
        path.startsWith('/root/') ||
        /^[a-zA-Z]:\/i.test(path)) {
      this.logger.warn(`Absolute path attempt detected: ${path}`);
      throw new BadRequestException('Invalid path');
    }
  }

  /**
   * Validate request size
   */
  private validateRequestSize(req: Request): void {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > this.MAX_JSON_SIZE) {
      this.logger.warn(
        `Request too large: ${contentLength} bytes (max: ${this.MAX_JSON_SIZE})`,
      );
      throw new BadRequestException('Request payload too large');
    }
  }

  /**
   * Check for NULL bytes in URL (can bypass filters)
   */
  private checkNullBytes(req: Request): void {
    const url = req.originalUrl || req.url;

    if (url.includes('\0') || url.includes('%00')) {
      this.logger.warn(`NULL byte detected in URL: ${url}`);
      throw new BadRequestException('Invalid URL format');
    }
  }

  /**
   * Validate HTTP method
   */
  private validateHttpMethod(req: Request): void {
    const allowedMethods = [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
      'HEAD',
    ];

    if (!allowedMethods.includes(req.method.toUpperCase())) {
      this.logger.warn(`Invalid HTTP method: ${req.method}`);
      throw new BadRequestException('Invalid HTTP method');
    }
  }

  /**
   * Check for suspicious patterns in strings
   */
  private containsSuspiciousPatterns(value: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<embed/i,
      /<object/i,
      /\0/,  // NULL byte
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(value));
  }
}
