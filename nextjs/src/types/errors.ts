// types/errors.ts - Centralized error type definitions

/**
 * Base validation error interface
 * Use this for domain-specific validation errors
 */
export interface BaseValidationError {
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Extended validation error with code and location
 * Used for detailed validation scenarios (e.g., Bluebook citations)
 */
export interface DetailedValidationError extends BaseValidationError {
  code: string;
  location?: {
    start: number;
    end: number;
    text: string;
  };
  suggestion?: string;
}

/**
 * Form validation error (simple field-message pair)
 * Used in form validation utilities
 */
export interface FormValidationError {
  field: string;
  message: string;
  severity: 'error';
}

/**
 * Validation failure for repository operations
 * Used in data persistence layer
 */
export interface ValidationFailure {
  field: string;
  constraint: string;
  message: string;
  value?: unknown;
}

/**
 * Graph validation error
 * Used in graph/network validation
 */
export interface GraphValidationError {
  type: 'node' | 'edge' | 'structure';
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * API validation error response
 * Received from backend validation failures
 */
export interface APIValidationError {
  field: string;
  code: string;
  message: string;
  constraints?: Record<string, string>;
}

// Type aliases for backward compatibility
export type ValidationError = BaseValidationError;
