/**
 * Validation Types
 * Types for template and document validation
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface VariableValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  processedValues: Record<string, unknown>;
}

export interface ClauseConflict {
  clauseId1: string;
  clauseId2: string;
  reason: string;
  severity: "error" | "warning";
}

export interface ClauseValidationResult {
  isValid: boolean;
  conflicts: ClauseConflict[];
}
