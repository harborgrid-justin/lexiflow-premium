/**
 * @module components/enterprise/forms/validation
 * @category Enterprise - Forms
 * @description Comprehensive validation utilities and common validators
 *
 * FEATURES:
 * - Common validation functions (required, email, URL, etc.)
 * - Async validators for API checks (uniqueness, existence)
 * - Custom validator builders
 * - Error message formatting
 * - Validator combinators (and, or, when)
 * - Type-safe validation results
 *
 * @example Basic Usage
 * ```typescript
 * import { required, email, minLength, and } from './validation';
 *
 * const validators = and(
 *   required('Email is required'),
 *   email('Invalid email format'),
 *   minLength(5, 'Email must be at least 5 characters')
 * );
 *
 * const result = await validators('user@example.com');
 * if (!result.valid) {
 *   console.error(result.message);
 * }
 * ```
 *
 * @example Async Validation
 * ```typescript
 * import { uniqueAsync } from './validation';
 *
 * const checkUsername = uniqueAsync(
 *   async (username) => {
 *     const response = await fetch(`/api/check-username/${username}`);
 *     return response.ok;
 *   },
 *   'Username already exists'
 * );
 * ```
 */

import type { ValidationResult, Validator, SyncValidator, AsyncValidator } from '@/types/forms';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Create a successful validation result
 */
export function success(): ValidationResult {
  return { valid: true };
}

/**
 * Create a failed validation result
 */
export function error(message: string, severity: 'error' | 'warning' | 'info' = 'error'): ValidationResult {
  return { valid: false, message, severity };
}

/**
 * Create a warning validation result
 */
export function warning(message: string): ValidationResult {
  return { valid: true, message, severity: 'warning' };
}

/**
 * Create an info validation result
 */
export function info(message: string): ValidationResult {
  return { valid: true, message, severity: 'info' };
}

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

/**
 * Required field validator
 */
export const required = (message: string = 'This field is required'): SyncValidator => {
  return (value: unknown): ValidationResult => {
    if (value === null || value === undefined) {
      return error(message);
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      return error(message);
    }
    if (Array.isArray(value) && value.length === 0) {
      return error(message);
    }
    return success();
  };
};

/**
 * Minimum length validator
 */
export const minLength = (min: number, message?: string): SyncValidator<string> => {
  return (value: string): ValidationResult => {
    if (!value) return success(); // Let required handle empty values
    if (value.length < min) {
      return error(message || `Must be at least ${min} characters`);
    }
    return success();
  };
};

/**
 * Maximum length validator
 */
export const maxLength = (max: number, message?: string): SyncValidator<string> => {
  return (value: string): ValidationResult => {
    if (!value) return success();
    if (value.length > max) {
      return error(message || `Must be at most ${max} characters`);
    }
    return success();
  };
};

/**
 * Exact length validator
 */
export const exactLength = (length: number, message?: string): SyncValidator<string> => {
  return (value: string): ValidationResult => {
    if (!value) return success();
    if (value.length !== length) {
      return error(message || `Must be exactly ${length} characters`);
    }
    return success();
  };
};

/**
 * Email validator
 */
export const email = (message: string = 'Invalid email address'): SyncValidator<string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (value: string): ValidationResult => {
    if (!value) return success();
    if (!emailRegex.test(value)) {
      return error(message);
    }
    return success();
  };
};

/**
 * URL validator
 */
export const url = (message: string = 'Invalid URL'): SyncValidator<string> => {
  return (value: string): ValidationResult => {
    if (!value) return success();
    try {
      new URL(value);
      return success();
    } catch {
      return error(message);
    }
  };
};

/**
 * Pattern validator
 */
export const pattern = (regex: RegExp, message: string): SyncValidator<string> => {
  return (value: string): ValidationResult => {
    if (!value) return success();
    if (!regex.test(value)) {
      return error(message);
    }
    return success();
  };
};

/**
 * Minimum value validator
 */
export const min = (minValue: number, message?: string): SyncValidator<number> => {
  return (value: number): ValidationResult => {
    if (value === null || value === undefined) return success();
    if (value < minValue) {
      return error(message || `Must be at least ${minValue}`);
    }
    return success();
  };
};

/**
 * Maximum value validator
 */
export const max = (maxValue: number, message?: string): SyncValidator<number> => {
  return (value: number): ValidationResult => {
    if (value === null || value === undefined) return success();
    if (value > maxValue) {
      return error(message || `Must be at most ${maxValue}`);
    }
    return success();
  };
};

/**
 * Range validator
 */
export const range = (minValue: number, maxValue: number, message?: string): SyncValidator<number> => {
  return (value: number): ValidationResult => {
    if (value === null || value === undefined) return success();
    if (value < minValue || value > maxValue) {
      return error(message || `Must be between ${minValue} and ${maxValue}`);
    }
    return success();
  };
};

/**
 * Date after validator
 */
export const dateAfter = (compareDate: Date | string, message?: string): SyncValidator<string | Date> => {
  return (value: string | Date): ValidationResult => {
    if (!value) return success();
    const date = new Date(value);
    const compare = new Date(compareDate);
    if (date <= compare) {
      return error(message || `Must be after ${compare.toLocaleDateString()}`);
    }
    return success();
  };
};

/**
 * Date before validator
 */
export const dateBefore = (compareDate: Date | string, message?: string): SyncValidator<string | Date> => {
  return (value: string | Date): ValidationResult => {
    if (!value) return success();
    const date = new Date(value);
    const compare = new Date(compareDate);
    if (date >= compare) {
      return error(message || `Must be before ${compare.toLocaleDateString()}`);
    }
    return success();
  };
};

/**
 * Phone number validator (US format)
 */
export const phoneUS = (message: string = 'Invalid phone number'): SyncValidator<string> => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return (value: string): ValidationResult => {
    if (!value) return success();
    if (!phoneRegex.test(value)) {
      return error(message);
    }
    return success();
  };
};

/**
 * Credit card validator (Luhn algorithm)
 */
export const creditCard = (message: string = 'Invalid credit card number'): SyncValidator<string> => {
  return (value: string): ValidationResult => {
    if (!value) return success();

    const sanitized = value.replace(/\s/g, '');
    if (!/^\d+$/.test(sanitized)) {
      return error(message);
    }

    let sum = 0;
    let isEven = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    if (sum % 10 !== 0) {
      return error(message);
    }

    return success();
  };
};

/**
 * Match field validator (for password confirmation, etc.)
 */
export const matchField = (fieldName: string, message?: string): Validator<unknown> => {
  return (value: unknown, formData?: Record<string, unknown>): ValidationResult => {
    if (!value || !formData) return success();
    if (value !== formData[fieldName]) {
      return error(message || `Must match ${fieldName}`);
    }
    return success();
  };
};

/**
 * One of validator (enum)
 */
export const oneOf = <T>(values: T[], message?: string): SyncValidator<T> => {
  return (value: T): ValidationResult => {
    if (value === null || value === undefined) return success();
    if (!values.includes(value)) {
      return error(message || `Must be one of: ${values.join(', ')}`);
    }
    return success();
  };
};

/**
 * Array minimum length validator
 */
export const arrayMinLength = (min: number, message?: string): SyncValidator<unknown[]> => {
  return (value: unknown[]): ValidationResult => {
    if (!value) return success();
    if (!Array.isArray(value) || value.length < min) {
      return error(message || `Must have at least ${min} items`);
    }
    return success();
  };
};

/**
 * Array maximum length validator
 */
export const arrayMaxLength = (max: number, message?: string): SyncValidator<unknown[]> => {
  return (value: unknown[]): ValidationResult => {
    if (!value) return success();
    if (!Array.isArray(value) || value.length > max) {
      return error(message || `Must have at most ${max} items`);
    }
    return success();
  };
};

// ============================================================================
// ASYNC VALIDATORS
// ============================================================================

/**
 * Async unique validator (checks via API)
 */
export const uniqueAsync = (
  checkFn: (value: string) => Promise<boolean>,
  message: string = 'This value is already taken'
): AsyncValidator<string> => {
  return async (value: string): Promise<ValidationResult> => {
    if (!value) return success();

    try {
      const isUnique = await checkFn(value);
      if (!isUnique) {
        return error(message);
      }
      return success();
    } catch (err) {
      return error('Unable to verify uniqueness');
    }
  };
};

/**
 * Async email exists validator
 */
export const emailExistsAsync = (
  checkFn: (email: string) => Promise<boolean>,
  message: string = 'Email address not found'
): AsyncValidator<string> => {
  return async (value: string): Promise<ValidationResult> => {
    if (!value) return success();

    // First validate email format
    const emailResult = email()(value);
    if (!emailResult.valid) return emailResult;

    try {
      const exists = await checkFn(value);
      if (!exists) {
        return error(message);
      }
      return success();
    } catch (err) {
      return error('Unable to verify email');
    }
  };
};

// ============================================================================
// VALIDATOR COMBINATORS
// ============================================================================

/**
 * Combine multiple validators with AND logic
 */
export const and = (...validators: Validator[]): Validator => {
  return async (value: unknown, formData?: Record<string, unknown>): Promise<ValidationResult> => {
    for (const validator of validators) {
      const result = await validator(value, formData);
      if (!result.valid) {
        return result;
      }
    }
    return success();
  };
};

/**
 * Combine multiple validators with OR logic
 */
export const or = (...validators: Validator[]): Validator => {
  return async (value: unknown, formData?: Record<string, unknown>): Promise<ValidationResult> => {
    const results = await Promise.all(
      validators.map(v => v(value, formData))
    );

    const hasValid = results.some(r => r.valid);
    if (hasValid) {
      return success();
    }

    // Return first error
    const firstError = results.find(r => !r.valid);
    return firstError || error('Validation failed');
  };
};

/**
 * Conditional validator
 */
export const when = (
  condition: (value: unknown, formData?: Record<string, unknown>) => boolean,
  validator: Validator
): Validator => {
  return async (value: unknown, formData?: Record<string, unknown>): Promise<ValidationResult> => {
    if (condition(value, formData)) {
      return validator(value, formData);
    }
    return success();
  };
};

// ============================================================================
// CUSTOM VALIDATOR BUILDER
// ============================================================================

/**
 * Create a custom validator
 */
export const custom = <T = unknown>(
  validatorFn: (value: T, formData?: Record<string, unknown>) => boolean | Promise<boolean>,
  message: string
): Validator<T> => {
  return async (value: T, formData?: Record<string, unknown>): Promise<ValidationResult> => {
    try {
      const isValid = await validatorFn(value, formData);
      if (!isValid) {
        return error(message);
      }
      return success();
    } catch (err) {
      return error(message);
    }
  };
};
