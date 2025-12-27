import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Enterprise Request Sanitization Middleware
 *
 * IMPORTANT: This middleware sanitizes query parameters and URL params ONLY.
 * Request body is NOT HTML-encoded to prevent JSON data corruption.
 *
 * Security approach:
 * - Query/URL params: Remove dangerous patterns (XSS, SQL injection)
 * - Request body: Rely on class-validator DTOs and parameterized queries
 * - Prototype pollution: Prevent __proto__ and constructor injection
 *
 * @see OWASP Input Validation Cheat Sheet
 */
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SanitizationMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    // Sanitize query parameters (XSS prevention)
    if (req.query && typeof req.query === 'object') {
      const sanitized = this.sanitizeObject(req.query);
      for (const key in req.query) {
        delete req.query[key];
      }
      Object.assign(req.query, sanitized);
    }

    // Sanitize URL parameters (XSS prevention)
    if (req.params && typeof req.params === 'object') {
      const sanitized = this.sanitizeObject(req.params);
      for (const key in req.params) {
        delete req.params[key];
      }
      Object.assign(req.params, sanitized);
    }

    // IMPORTANT: Do NOT sanitize request body here
    // HTML encoding corrupts legitimate JSON data (e.g., & becomes &amp;)
    // Body validation is handled by:
    // 1. class-validator DTOs for input validation
    // 2. Parameterized queries for SQL injection prevention
    // 3. Output encoding at render time for XSS prevention

    // Prevent prototype pollution in body (security critical)
    if (req.body && typeof req.body === 'object') {
      this.preventPrototypePollution(req.body);
    }

    next();
  }

  /**
   * Sanitize object recursively for query/URL params
   */
  private sanitizeObject<T = unknown>(obj: T): T {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeValue(item)) as T;
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // Prevent prototype pollution
          const sanitizedKey = this.sanitizeKey(key);
          sanitized[sanitizedKey] = this.sanitizeValue((obj as Record<string, unknown>)[key]);
        }
      }
      return sanitized as T;
    }

    return this.sanitizeValue(obj) as T;
  }

  /**
   * Sanitize object keys to prevent prototype pollution
   */
  private sanitizeKey(key: string): string {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      this.logger.warn(`Blocked prototype pollution attempt with key: ${key}`);
      return `blocked_${key}`;
    }
    return key;
  }

  /**
   * Sanitize individual values
   */
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

  /**
   * Sanitize string values for query/URL params
   * Removes dangerous patterns without HTML encoding
   */
  private sanitizeString(str: string): string {
    if (!str) return str;

    // Remove null bytes (always dangerous)
    str = str.replace(/\0/g, '');

    // Remove script tags and javascript: protocol
    str = str.replace(/<script[^>]*>.*?<\/script>/gi, '');
    str = str.replace(/javascript:/gi, '');

    // Remove event handlers
    str = str.replace(/on\w+\s*=/gi, '');

    // Remove dangerous SQL patterns (defense in depth)
    str = str.replace(/;\s*(DROP|DELETE|TRUNCATE|ALTER|EXEC|EXECUTE)\s+/gi, '');
    str = str.replace(/UNION\s+SELECT/gi, '');

    return str.trim();
  }

  /**
   * Prevent prototype pollution in request body
   * This is critical for security
   */
  private preventPrototypePollution(obj: Record<string, unknown>, depth = 0): void {
    if (depth > 10) return; // Prevent infinite recursion

    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

    for (const key of Object.keys(obj)) {
      if (dangerousKeys.includes(key)) {
        this.logger.warn(`Removed prototype pollution key from body: ${key}`);
        delete obj[key];
        continue;
      }

      const value = obj[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.preventPrototypePollution(value as Record<string, unknown>, depth + 1);
      }
    }
  }
}
