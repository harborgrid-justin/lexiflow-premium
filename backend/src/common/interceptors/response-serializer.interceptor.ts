import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

/**
 * Metadata key for excluding fields from response
 */
export const EXCLUDE_FIELDS_KEY = 'excludeFields';

/**
 * Decorator to exclude fields from response
 */
export const ExcludeFields = (...fields: string[]) =>
  Reflect.metadata(EXCLUDE_FIELDS_KEY, fields);

/**
 * Response Serializer Interceptor
 * Automatically removes sensitive fields and null values from responses
 * Ensures consistent response formatting
 */
@Injectable()
export class ResponseSerializerInterceptor implements NestInterceptor {
  // Fields that should always be excluded from responses
  private readonly globalExcludedFields = [
    'password',
    'passwordHash',
    'salt',
    'accessToken',
    'refreshToken',
    'secret',
    'apiSecret',
    'privateKey',
    'secretKey',
    'encryptionKey',
    '__v', // MongoDB version key
  ];

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Get fields to exclude from metadata
    const excludeFields = this.reflector.get<string[]>(
      EXCLUDE_FIELDS_KEY,
      context.getHandler(),
    ) || [];

    const allExcludedFields = [...this.globalExcludedFields, ...excludeFields];

    return next.handle().pipe(
      map((data: unknown) => {
        if (data === null || data === undefined) {
          return data;
        }

        return this.serialize(data, allExcludedFields);
      }),
    );
  }

  /**
   * Serialize response data
   */
  private serialize(data: unknown, excludedFields: string[]): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.serialize(item, excludedFields));
    }

    // Handle objects
    if (typeof data === 'object' && data !== null) {
      const serialized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        // Skip excluded fields
        if (excludedFields.includes(key)) {
          continue;
        }

        // Skip null/undefined values (optional - can be configured)
        if (this.shouldRemoveNullValues() && (value === null || value === undefined)) {
          continue;
        }

        // Recursively serialize nested objects
        if (typeof value === 'object' && value !== null) {
          serialized[key] = this.serialize(value, excludedFields);
        } else {
          serialized[key] = value;
        }
      }

      return serialized;
    }

    // Return primitive values as-is
    return data;
  }

  /**
   * Check if null values should be removed
   * Can be configured via environment variable
   */
  private shouldRemoveNullValues(): boolean {
    return process.env.REMOVE_NULL_VALUES === 'true';
  }
}

/**
 * Data Masking Interceptor
 * Masks sensitive data in responses (e.g., partial credit card numbers, emails)
 */
@Injectable()
export class DataMaskingInterceptor implements NestInterceptor {
  // Fields that should be masked
  private readonly maskedFields: Record<string, (value: string) => string> = {
    email: this.maskEmail.bind(this),
    phone: this.maskPhone.bind(this),
    creditCard: this.maskCreditCard.bind(this),
    ssn: this.maskSSN.bind(this),
  };

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (data === null || data === undefined) {
          return data;
        }

        return this.maskData(data);
      }),
    );
  }

  /**
   * Recursively mask sensitive data
   */
  private maskData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const masked: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();

        // Check if this field should be masked
        const maskFunction = Object.keys(this.maskedFields).find((field) =>
          lowerKey.includes(field),
        );

        if (maskFunction && typeof value === 'string') {
          const maskFn = this.maskedFields[maskFunction];
          masked[key] = maskFn ? maskFn(value) : value;
        } else if (typeof value === 'object' && value !== null) {
          masked[key] = this.maskData(value);
        } else {
          masked[key] = value;
        }
      }

      return masked;
    }

    return data;
  }

  /**
   * Mask email address
   * Example: john.doe@example.com -> j***@example.com
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;

    const maskedLocal = local.charAt(0) + '***';
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mask phone number
   * Example: +1234567890 -> +1234***890
   */
  private maskPhone(phone: string): string {
    if (phone.length < 4) return phone;

    const last3 = phone.slice(-3);
    const first4 = phone.slice(0, 4);

    return `${first4}***${last3}`;
  }

  /**
   * Mask credit card number
   * Example: 1234567890123456 -> ************3456
   */
  private maskCreditCard(cardNumber: string): string {
    if (cardNumber.length < 4) return cardNumber;

    const last4 = cardNumber.slice(-4);
    return `${'*'.repeat(cardNumber.length - 4)}${last4}`;
  }

  /**
   * Mask SSN
   * Example: 123-45-6789 -> ***-**-6789
   */
  private maskSSN(ssn: string): string {
    if (ssn.length < 4) return ssn;

    const last4 = ssn.slice(-4);
    return `***-**-${last4}`;
  }
}
