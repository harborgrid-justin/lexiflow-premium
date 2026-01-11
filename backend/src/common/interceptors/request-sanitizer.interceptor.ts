import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

/**
 * Request Sanitizer Interceptor
 * Sanitizes incoming request data to prevent injection attacks
 * Removes potentially dangerous characters and patterns
 */
@Injectable()
export class RequestSanitizerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestSanitizerInterceptor.name);

  // Patterns that might indicate injection attacks
  private readonly suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers (onclick, onload, etc.)
    /<iframe[^>]*>/gi, // Iframes
    /<!--.*?-->/g, // HTML comments
    /\$\{.*?\}/g, // Template literals
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    // Sanitize request body
    if (request.body && typeof request.body === "object") {
      request.body = this.sanitizeObject(request.body);
    }

    // Sanitize query parameters
    if (request.query && typeof request.query === "object") {
      request.query = this.sanitizeObject(request.query);
    }

    // Sanitize route parameters
    if (request.params && typeof request.params === "object") {
      request.params = this.sanitizeObject(request.params);
    }

    return next.handle();
  }

  /**
   * Recursively sanitize an object
   */
  private sanitizeObject<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item)) as unknown as T;
    }

    if (typeof obj === "object") {
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(obj)) {
        // Sanitize the key
        const sanitizedKey = this.sanitizeString(key);

        // Recursively sanitize the value
        if (typeof value === "string") {
          sanitized[sanitizedKey] = this.sanitizeString(value);
        } else if (typeof value === "object") {
          sanitized[sanitizedKey] = this.sanitizeObject(value);
        } else {
          sanitized[sanitizedKey] = value;
        }
      }

      return sanitized as T;
    }

    if (typeof obj === "string") {
      return this.sanitizeString(obj) as unknown as T;
    }

    return obj;
  }

  /**
   * Sanitize a string value
   */
  private sanitizeString(value: string): string {
    if (!value || typeof value !== "string") {
      return value;
    }

    let sanitized = value;
    let foundSuspicious = false;

    // Check for and remove suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        foundSuspicious = true;
        sanitized = sanitized.replace(pattern, "");
      }
    }

    // Log if suspicious content was found and removed
    if (foundSuspicious && this.isDevelopment()) {
      this.logger.warn(
        `Suspicious content detected and sanitized: ${value.substring(0, 100)}...`
      );
    }

    // Additional sanitization: encode HTML entities in user input
    // This is a basic implementation - consider using a library like DOMPurify for production
    sanitized = this.encodeHtmlEntities(sanitized);

    return sanitized;
  }

  /**
   * Encode HTML entities
   */
  private encodeHtmlEntities(str: string): string {
    const htmlEntities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };

    return str.replace(/[<>"'/]/g, (match) => htmlEntities[match] || match);
  }

  /**
   * Check if running in development mode
   */
  private isDevelopment(): boolean {
    return process.env.NODE_ENV !== "production";
  }
}
