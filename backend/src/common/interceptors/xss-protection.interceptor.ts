import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * XSS Protection Interceptor
 *
 * Sanitizes response data to prevent XSS attacks by:
 * - Detecting and logging potentially dangerous content
 * - Sanitizing string fields in response objects
 * - Setting security-related response headers
 *
 * Note: This is defense-in-depth. Primary XSS prevention should happen at:
 * 1. Input validation (DTOs with class-validator)
 * 2. Output encoding in templates
 * 3. Content Security Policy headers
 *
 * This interceptor provides an additional safety layer.
 */
@Injectable()
export class XssProtectionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(XssProtectionInterceptor.name);

  // XSS patterns to detect
  private readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<{ setHeader: (key: string, value: string) => void; getHeader: (key: string) => string | string[] | undefined }>();

    // Set XSS protection header
    response.setHeader("X-XSS-Protection", "1; mode=block");

    return next.handle().pipe(
      map((data) => {
        // Only sanitize for non-binary responses
        const contentType = response.getHeader("content-type");
        if (
          typeof contentType === "string" &&
          this.shouldSanitize(contentType)
        ) {
          return this.sanitizeData(data);
        }
        return data;
      })
    );
  }

  /**
   * Check if content type should be sanitized
   */
  private shouldSanitize(contentType: string): boolean {
    const sanitizableTypes = [
      "application/json",
      "text/html",
      "text/plain",
      "application/xml",
      "text/xml",
    ];

    return sanitizableTypes.some((type) =>
      contentType.toLowerCase().includes(type)
    );
  }

  /**
   * Recursively sanitize data structure
   */
  private sanitizeData<T>(data: T): T {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === "string") {
      return this.sanitizeString(data) as unknown as T;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item)) as unknown as T;
    }

    if (typeof data === "object" && data !== null) {
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        // Skip prototype pollution
        if (
          key === "__proto__" ||
          key === "constructor" ||
          key === "prototype"
        ) {
          continue;
        }

        sanitized[key] = this.sanitizeData(value);
      }

      return sanitized as T;
    }

    return data;
  }

  /**
   * Sanitize string for XSS
   */
  private sanitizeString(str: string): string {
    if (!str || typeof str !== "string") {
      return str;
    }

    // Check for XSS patterns
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(str)) {
        this.logger.warn(
          `Potential XSS detected in response: ${str.substring(0, 100)}...`
        );
      }
    }

    // HTML entity encoding for critical characters
    let sanitized = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");

    // Remove NULL bytes
    sanitized = sanitized.replace(/\0/g, "");

    return sanitized;
  }
}

/**
 * Selective XSS Protection Interceptor
 *
 * Only sanitizes specific fields marked as user-generated content.
 * Use this when you need to preserve HTML in some fields (like rich text editors)
 * but want to sanitize others.
 */
@Injectable()
export class SelectiveXssProtectionInterceptor implements NestInterceptor {
  // Fields that should always be sanitized
  private readonly SANITIZE_FIELDS = [
    "username",
    "displayName",
    "bio",
    "comment",
    "message",
    "description",
    "title",
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();
    response.setHeader("X-XSS-Protection", "1; mode=block");

    return next.handle().pipe(map((data) => this.selectivelySanitize(data)));
  }

  /**
   * Selectively sanitize specific fields
   */
  private selectivelySanitize<T>(data: T): T {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.selectivelySanitize(item)) as unknown as T;
    }

    if (typeof data === "object" && data !== null) {
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        // Skip prototype pollution
        if (
          key === "__proto__" ||
          key === "constructor" ||
          key === "prototype"
        ) {
          continue;
        }

        // Sanitize if field is in the list
        if (this.SANITIZE_FIELDS.includes(key) && typeof value === "string") {
          sanitized[key] = this.sanitizeHtml(value);
        } else if (typeof value === "object") {
          sanitized[key] = this.selectivelySanitize(value);
        } else {
          sanitized[key] = value;
        }
      }

      return sanitized as T;
    }

    return data;
  }

  /**
   * Sanitize HTML while preserving safe tags
   */
  private sanitizeHtml(html: string): string {
    if (!html || typeof html !== "string") {
      return html;
    }

    // Remove dangerous tags and attributes
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed\b[^>]*>/gi, "");

    // Remove NULL bytes
    sanitized = sanitized.replace(/\0/g, "");

    return sanitized;
  }
}
