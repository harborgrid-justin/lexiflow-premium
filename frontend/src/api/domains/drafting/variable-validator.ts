/**
 * Variable Validator
 * Validates variable values against template definitions
 */

import type { DraftingTemplate, TemplateVariable } from "./types";
import type { VariableValidationResult } from "./validation-types";

/**
 * Validate variable values against template variable definitions
 */
export function validateVariables(
  template: DraftingTemplate,
  values: Record<string, unknown>
): VariableValidationResult {
  const errors: Record<string, string[]> = {};
  const processedValues: Record<string, unknown> = {};

  for (const variable of template.variables) {
    const value = values[variable.name];
    const fieldErrors: string[] = [];

    // Required validation
    if (
      variable.required &&
      (value === undefined || value === null || value === "")
    ) {
      fieldErrors.push(`${variable.label} is required`);
      errors[variable.name] = fieldErrors;
      continue;
    }

    // Skip further validation if not required and empty
    if (
      !variable.required &&
      (value === undefined || value === null || value === "")
    ) {
      processedValues[variable.name] = variable.defaultValue || "";
      continue;
    }

    // Type-specific validation and coercion
    switch (variable.type) {
      case "text":
        validateText(variable, value, fieldErrors, processedValues);
        break;

      case "date":
        validateDate(variable, value, fieldErrors, processedValues);
        break;

      case "number":
        validateNumber(variable, value, fieldErrors, processedValues);
        break;

      case "select":
        validateSelect(variable, value, fieldErrors, processedValues);
        break;

      case "multi-select":
        validateMultiSelect(variable, value, fieldErrors, processedValues);
        break;

      case "boolean":
        validateBoolean(variable, value, fieldErrors, processedValues);
        break;

      case "case-data":
      case "party":
      case "attorney":
        // Auto-populated from case data
        processedValues[variable.name] = value;
        break;

      default:
        processedValues[variable.name] = value;
    }

    if (fieldErrors.length > 0) {
      errors[variable.name] = fieldErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    processedValues,
  };
}

function validateText(
  variable: TemplateVariable,
  value: unknown,
  fieldErrors: string[],
  processedValues: Record<string, unknown>
): void {
  if (typeof value !== "string") {
    fieldErrors.push(`${variable.label} must be text`);
  } else {
    const strValue = value.trim();
    if (
      variable.validation?.minLength &&
      strValue.length < variable.validation.minLength
    ) {
      fieldErrors.push(
        `${variable.label} must be at least ${variable.validation.minLength} characters`
      );
    }
    if (
      variable.validation?.maxLength &&
      strValue.length > variable.validation.maxLength
    ) {
      fieldErrors.push(
        `${variable.label} must be at most ${variable.validation.maxLength} characters`
      );
    }
    if (variable.validation?.pattern) {
      const regex = new RegExp(variable.validation.pattern);
      if (!regex.test(strValue)) {
        fieldErrors.push(`${variable.label} format is invalid`);
      }
    }
    processedValues[variable.name] = strValue;
  }
}

function validateDate(
  variable: TemplateVariable,
  value: unknown,
  fieldErrors: string[],
  processedValues: Record<string, unknown>
): void {
  const dateValue = typeof value === "string" ? new Date(value) : value;
  if (!(dateValue instanceof Date) || isNaN(dateValue.getTime())) {
    fieldErrors.push(`${variable.label} must be a valid date`);
  } else {
    processedValues[variable.name] = dateValue.toISOString();
  }
}

function validateNumber(
  variable: TemplateVariable,
  value: unknown,
  fieldErrors: string[],
  processedValues: Record<string, unknown>
): void {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (typeof numValue !== "number" || isNaN(numValue)) {
    fieldErrors.push(`${variable.label} must be a number`);
  } else {
    if (
      variable.validation?.min !== undefined &&
      numValue < variable.validation.min
    ) {
      fieldErrors.push(
        `${variable.label} must be at least ${variable.validation.min}`
      );
    }
    if (
      variable.validation?.max !== undefined &&
      numValue > variable.validation.max
    ) {
      fieldErrors.push(
        `${variable.label} must be at most ${variable.validation.max}`
      );
    }
    processedValues[variable.name] = numValue;
  }
}

function validateSelect(
  variable: TemplateVariable,
  value: unknown,
  fieldErrors: string[],
  processedValues: Record<string, unknown>
): void {
  if (typeof value !== "string" || !variable.options?.includes(value)) {
    fieldErrors.push(
      `${variable.label} must be one of: ${variable.options?.join(", ")}`
    );
  } else {
    processedValues[variable.name] = value;
  }
}

function validateMultiSelect(
  variable: TemplateVariable,
  value: unknown,
  fieldErrors: string[],
  processedValues: Record<string, unknown>
): void {
  if (!Array.isArray(value)) {
    fieldErrors.push(`${variable.label} must be an array`);
  } else {
    const invalidOptions = value.filter(
      (v) => !variable.options?.includes(v as string)
    );
    if (invalidOptions.length > 0) {
      fieldErrors.push(
        `${variable.label} contains invalid options: ${invalidOptions.join(", ")}`
      );
    } else {
      processedValues[variable.name] = value;
    }
  }
}

function validateBoolean(
  variable: TemplateVariable,
  value: unknown,
  fieldErrors: string[],
  processedValues: Record<string, unknown>
): void {
  if (typeof value !== "boolean") {
    fieldErrors.push(`${variable.label} must be true or false`);
  } else {
    processedValues[variable.name] = value;
  }
}
