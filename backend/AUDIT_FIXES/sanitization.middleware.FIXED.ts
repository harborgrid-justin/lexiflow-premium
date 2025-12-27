import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Request Sanitization Middleware
 * Sanitizes all incoming request data to prevent XSS and injection attacks
 * Implements OWASP security best practices
 *
 * IMPORTANT: This middleware uses a balanced approach:
 * - Removes dangerous scripts and patterns
 * - Does NOT HTML-encode data (that's the frontend's job for display)
 * - Validates and sanitizes without breaking legitimate data
 */
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SanitizationMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    try {
      // Sanitize body
      if (req.body && typeof req.body === 'object') {
        req.body = this.sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        const sanitized = this.sanitizeObject(req.query);
        for (const key in req.query) {
          delete req.query[key];
        }
        Object.assign(req.query, sanitized);
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        const sanitized = this.sanitizeObject(req.params);
        for (const key in req.params) {
          delete req.params[key];
        }
        Object.assign(req.params, sanitized);
      }

      next();
    } catch (error) {
      this.logger.error('Sanitization middleware error:', error);
      next();
    }
  }

  private sanitizeObject<T = unknown>(obj: T): T {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeValue(item)) as T;
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = this.sanitizeValue((obj as Record<string, unknown>)[key]);
        }
      }
      return sanitized as T;
    }

    return this.sanitizeValue(obj) as T;
  }

  private sanitizeValue<T = unknown>(value: T): T {
    if (typeof value === 'string') {
      return this.sanitizeString(value) as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item)) as T;
    }

    if (value !== null && typeof value === 'object') {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeString(str: string): string {
    if (!str || typeof str !== 'string') return str;

    // Remove null bytes
    str = str.replace(/\0/g, '');

    // Remove dangerous script tags and event handlers
    // Use case-insensitive regex with global flag
    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    str = str.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    str = str.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    str = str.replace(/<embed\b[^<]*>/gi, '');
    str = str.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');
    str = str.replace(/<meta\b[^<]*>/gi, '');
    str = str.replace(/<link\b[^<]*>/gi, '');

    // Remove javascript: and data: URI schemes
    str = str.replace(/javascript:/gi, '');
    str = str.replace(/data:text\/html/gi, '');
    str = str.replace(/vbscript:/gi, '');

    // Remove event handlers (onclick, onerror, etc.)
    str = str.replace(/\bon\w+\s*=/gi, '');

    // Remove dangerous CSS expressions
    str = str.replace(/expression\s*\(/gi, '');
    str = str.replace(/-moz-binding\s*:/gi, '');

    // Remove eval and other dangerous functions
    str = str.replace(/eval\s*\(/gi, '');

    // IMPORTANT: Do NOT HTML encode here - that breaks legitimate data
    // HTML encoding should be done at rendering time on the frontend
    // The database should store the original (sanitized) data

    // Trim excessive whitespace
    str = str.trim();

    // Limit string length to prevent DoS
    const MAX_STRING_LENGTH = 10000;
    if (str.length > MAX_STRING_LENGTH) {
      this.logger.warn(`String truncated from ${str.length} to ${MAX_STRING_LENGTH} characters`);
      str = str.substring(0, MAX_STRING_LENGTH);
    }

    return str;
  }

  /**
   * Check if a string contains potentially dangerous SQL patterns
   * Note: This is a defense-in-depth measure. Primary SQL injection
   * prevention should be through parameterized queries/ORMs
   */
  private containsDangerousSqlPatterns(str: string): boolean {
    const dangerousPatterns = [
      // SQL injection patterns
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bDROP\b.*\bTABLE\b)/i,
      /(\bDROP\b.*\bDATABASE\b)/i,
      /(\bTRUNCATE\b.*\bTABLE\b)/i,
      /(\bDELETE\b.*\bFROM\b.*\bWHERE\b.*\b1\s*=\s*1\b)/i,
      // Command injection
      /(\|\||&&|;|\||&|`|\$\(|\$\{)/,
      // Path traversal
      /\.\.[\/\\]/,
    ];

    return dangerousPatterns.some((pattern) => pattern.test(str));
  }
}
