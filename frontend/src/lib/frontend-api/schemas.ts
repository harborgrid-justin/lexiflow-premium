/**
 * Validation Schemas
 * Input validation for frontend API operations
 *
 * @module lib/frontend-api/schemas
 * @description Type-safe validation per spec IV:
 * - Validate inputs before transmission
 * - Prevent invalid data from reaching backend
 * - Provide user-friendly error messages
 * - Schema-based, declarative validation
 *
 * RULES:
 * - All frontend API methods validate inputs
 * - Validation happens at API boundary, not in components
 * - Return ValidationError with field-level details
 * - No exceptions - return Result<T>
 */

import { ValidationError } from "./errors";
import { type Result, failure, success } from "./types";

/**
 * Schema validator function
 */
export type Validator<T> = (value: unknown) => Result<T>;

/**
 * Schema definition for an object
 */
export type Schema<T> = {
  [K in keyof T]: FieldValidator<T[K]>;
};

/**
 * Field validator configuration
 */
export interface FieldValidator<T = unknown> {
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: unknown) => boolean;
  message?: string;
}

/**
 * Validate value against schema
 */
export function validate<T>(value: unknown, schema: Schema<T>): Result<T> {
  const errors: Array<{ field: string; message: string }> = [];
  const result: Partial<T> = {};

  const data = value as Record<string, unknown>;

  for (const [fieldName, fieldSchema] of Object.entries(schema) as Array<
    [string, FieldValidator]
  >) {
    const fieldValue = data[fieldName];

    // Check required
    if (
      fieldSchema.required &&
      (fieldValue === undefined || fieldValue === null)
    ) {
      errors.push({
        field: fieldName,
        message: fieldSchema.message || `${fieldName} is required`,
      });
      continue;
    }

    // Skip validation if not required and empty
    if (
      !fieldSchema.required &&
      (fieldValue === undefined || fieldValue === null)
    ) {
      continue;
    }

    // Type validation
    const typeResult = validateType(fieldValue, fieldSchema.type);
    if (!typeResult.valid) {
      errors.push({
        field: fieldName,
        message:
          fieldSchema.message || `${fieldName} must be a ${fieldSchema.type}`,
      });
      continue;
    }

    // String validations
    if (fieldSchema.type === "string" && typeof fieldValue === "string") {
      if (fieldSchema.min && fieldValue.length < fieldSchema.min) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${fieldSchema.min} characters`,
        });
        continue;
      }

      if (fieldSchema.max && fieldValue.length > fieldSchema.max) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at most ${fieldSchema.max} characters`,
        });
        continue;
      }

      if (fieldSchema.pattern && !fieldSchema.pattern.test(fieldValue)) {
        errors.push({
          field: fieldName,
          message: fieldSchema.message || `${fieldName} format is invalid`,
        });
        continue;
      }
    }

    // Number validations
    if (fieldSchema.type === "number" && typeof fieldValue === "number") {
      if (fieldSchema.min !== undefined && fieldValue < fieldSchema.min) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${fieldSchema.min}`,
        });
        continue;
      }

      if (fieldSchema.max !== undefined && fieldValue > fieldSchema.max) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at most ${fieldSchema.max}`,
        });
        continue;
      }
    }

    // Custom validator
    if (fieldSchema.validator && !fieldSchema.validator(fieldValue)) {
      errors.push({
        field: fieldName,
        message: fieldSchema.message || `${fieldName} validation failed`,
      });
      continue;
    }

    result[fieldName as keyof T] = fieldValue as T[keyof T];
  }

  if (errors.length > 0) {
    return failure(new ValidationError("Validation failed", errors));
  }

  return success(result as T);
}

/**
 * Validate type
 */
function validateType(value: unknown, type: string): { valid: boolean } {
  switch (type) {
    case "string":
      return { valid: typeof value === "string" };
    case "number":
      return { valid: typeof value === "number" && !isNaN(value) };
    case "boolean":
      return { valid: typeof value === "boolean" };
    case "date":
      return {
        valid: value instanceof Date || !isNaN(Date.parse(String(value))),
      };
    case "array":
      return { valid: Array.isArray(value) };
    case "object":
      return {
        valid:
          typeof value === "object" && value !== null && !Array.isArray(value),
      };
    default:
      return { valid: false };
  }
}

/**
 * Common validators
 */
export const validators = {
  /**
   * Email validator
   */
  email: (value: unknown): boolean => {
    if (typeof value !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  /**
   * UUID validator
   */
  uuid: (value: unknown): boolean => {
    if (typeof value !== "string") return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    );
  },

  /**
   * URL validator
   */
  url: (value: unknown): boolean => {
    if (typeof value !== "string") return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Phone validator (simple)
   */
  phone: (value: unknown): boolean => {
    if (typeof value !== "string") return false;
    return /^\+?[\d\s\-()]+$/.test(value);
  },

  /**
   * Date validator
   */
  date: (value: unknown): boolean => {
    if (value instanceof Date) return !isNaN(value.getTime());
    if (typeof value === "string") return !isNaN(Date.parse(value));
    return false;
  },
};

/**
 * Common schemas for reuse
 */
export const schemas = {
  /**
   * Pagination parameters
   */
  pagination: {
    page: { type: "number" as const, min: 1 },
    limit: { type: "number" as const, min: 1, max: 100 },
  },

  /**
   * ID parameter
   */
  id: {
    id: {
      type: "string" as const,
      required: true,
      validator: validators.uuid,
      message: "Invalid ID format",
    },
  },
};
