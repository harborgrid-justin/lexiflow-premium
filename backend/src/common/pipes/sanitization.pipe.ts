import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

/**
 * Input sanitization pipe to prevent XSS and injection attacks
 * Strips dangerous HTML tags and scripts from user input
 */
@Injectable()
export class SanitizationPipe implements PipeTransform {
  private readonly dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
  ];

  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeString(str: string): string {
    let sanitized = str;

    // Remove dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.transform(item, {} as ArgumentMetadata));
    }

    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = this.transform(obj[key], {} as ArgumentMetadata);
      }
    }

    return sanitized;
  }
}

/**
 * Strict sanitization pipe that rejects requests with dangerous content
 */
@Injectable()
export class StrictSanitizationPipe implements PipeTransform {
  private readonly dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
  ];

  transform(value: any, metadata: ArgumentMetadata) {
    if (this.containsDangerousContent(value)) {
      throw new BadRequestException(
        'Request contains potentially dangerous content',
      );
    }
    return value;
  }

  private containsDangerousContent(value: any): boolean {
    if (typeof value === 'string') {
      return this.dangerousPatterns.some((pattern) => pattern.test(value));
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.some((item) => this.containsDangerousContent(item));
      }

      return Object.values(value).some((val) =>
        this.containsDangerousContent(val),
      );
    }

    return false;
  }
}
