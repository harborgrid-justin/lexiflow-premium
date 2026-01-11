/**
 * Template Validator
 * Validates template structure and configuration
 */

import type {
  CreateTemplateDto,
  TemplateVariable,
  UpdateTemplateDto,
} from "./types";
import type {
  TemplateValidationResult,
  ValidationError,
} from "./validation-types";

/**
 * Validate template before creation or update
 */
export function validateTemplate(
  dto: CreateTemplateDto | UpdateTemplateDto
): TemplateValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Required field validation
  if ("name" in dto && (!dto.name || dto.name.trim().length === 0)) {
    errors.push({
      field: "name",
      message: "Template name is required",
      code: "REQUIRED_FIELD",
    });
  }

  if ("name" in dto && dto.name && dto.name.length < 3) {
    errors.push({
      field: "name",
      message: "Template name must be at least 3 characters",
      code: "MIN_LENGTH",
    });
  }

  if ("name" in dto && dto.name && dto.name.length > 200) {
    errors.push({
      field: "name",
      message: "Template name must be at most 200 characters",
      code: "MAX_LENGTH",
    });
  }

  if ("content" in dto && (!dto.content || dto.content.trim().length === 0)) {
    errors.push({
      field: "content",
      message: "Template content is required",
      code: "REQUIRED_FIELD",
    });
  }

  if ("category" in dto && !dto.category) {
    errors.push({
      field: "category",
      message: "Template category is required",
      code: "REQUIRED_FIELD",
    });
  }

  // Validate variables
  if ("variables" in dto && dto.variables) {
    validateVariables(dto, errors, warnings);
  }

  // Validate clause references
  if ("clauseReferences" in dto && dto.clauseReferences) {
    validateClauseReferences(dto, errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateVariables(
  dto: CreateTemplateDto | UpdateTemplateDto,
  errors: ValidationError[],
  warnings: string[]
): void {
  if (!dto.variables) return;

  // Check for unique variable names
  const variableNames = dto.variables.map((v) => v.name);
  const duplicates = variableNames.filter(
    (name, index) => variableNames.indexOf(name) !== index
  );
  if (duplicates.length > 0) {
    errors.push({
      field: "variables",
      message: `Duplicate variable names: ${duplicates.join(", ")}`,
      code: "DUPLICATE_VARIABLE",
    });
  }

  // Validate each variable
  dto.variables.forEach((v, index) => {
    if (!v.name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v.name)) {
      errors.push({
        field: `variables[${index}].name`,
        message:
          "Variable name must start with letter/underscore and contain only alphanumeric characters",
        code: "INVALID_VARIABLE_NAME",
      });
    }

    if (!v.label || v.label.trim().length === 0) {
      errors.push({
        field: `variables[${index}].label`,
        message: "Variable label is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (v.type === "select" || v.type === "multi-select") {
      if (!v.options || v.options.length === 0) {
        errors.push({
          field: `variables[${index}].options`,
          message: "Select variables must have at least one option",
          code: "MISSING_OPTIONS",
        });
      }
    }

    if (v.validation) {
      validateVariableValidation(v, index, errors);
    }
  });

  // Check if variables are referenced in content
  if ("content" in dto && dto.content) {
    checkVariableUsage(dto, warnings);
  }
}

function validateVariableValidation(
  v: TemplateVariable,
  index: number,
  errors: ValidationError[]
): void {
  if (!v.validation) return;

  if (v.validation.pattern) {
    try {
      new RegExp(v.validation.pattern);
    } catch {
      errors.push({
        field: `variables[${index}].validation.pattern`,
        message: "Invalid regex pattern",
        code: "INVALID_REGEX",
      });
    }
  }

  if (v.validation.minLength !== undefined && v.validation.minLength < 0) {
    errors.push({
      field: `variables[${index}].validation.minLength`,
      message: "Min length cannot be negative",
      code: "INVALID_VALUE",
    });
  }

  if (
    v.validation.maxLength !== undefined &&
    v.validation.minLength !== undefined &&
    v.validation.maxLength < v.validation.minLength
  ) {
    errors.push({
      field: `variables[${index}].validation`,
      message: "Max length must be greater than min length",
      code: "INVALID_RANGE",
    });
  }

  if (
    v.validation.min !== undefined &&
    v.validation.max !== undefined &&
    v.validation.max < v.validation.min
  ) {
    errors.push({
      field: `variables[${index}].validation`,
      message: "Max value must be greater than min value",
      code: "INVALID_RANGE",
    });
  }
}

function checkVariableUsage(
  dto: CreateTemplateDto | UpdateTemplateDto,
  warnings: string[]
): void {
  if (!dto.content || !dto.variables) return;

  const referencedVars = new Set<string>();
  const matches = dto.content.matchAll(/\{\{(\w+)\}\}/g);
  for (const match of matches) {
    if (match[1]) {
      referencedVars.add(match[1]);
    }
  }

  dto.variables.forEach((v) => {
    if (
      !referencedVars.has(v.name) &&
      !v.name.startsWith("case.") &&
      !v.name.startsWith("party.")
    ) {
      warnings.push(
        `Variable "${v.name}" is defined but not used in template content`
      );
    }
  });

  referencedVars.forEach((varName) => {
    const isDefined =
      dto.variables?.some((v) => v.name === varName) ||
      varName.startsWith("case.") ||
      varName.startsWith("party.");
    if (!isDefined) {
      warnings.push(`Variable "${varName}" is used in content but not defined`);
    }
  });
}

function validateClauseReferences(
  dto: CreateTemplateDto | UpdateTemplateDto,
  errors: ValidationError[]
): void {
  if (!dto.clauseReferences) return;

  const positions = dto.clauseReferences.map((c) => c.position);
  const duplicatePositions = positions.filter(
    (pos, index) => positions.indexOf(pos) !== index
  );
  if (duplicatePositions.length > 0) {
    errors.push({
      field: "clauseReferences",
      message: `Duplicate clause positions: ${duplicatePositions.join(", ")}`,
      code: "DUPLICATE_POSITION",
    });
  }

  dto.clauseReferences.forEach((ref, index) => {
    if (!ref.clauseId) {
      errors.push({
        field: `clauseReferences[${index}].clauseId`,
        message: "Clause ID is required",
        code: "REQUIRED_FIELD",
      });
    }
    if (ref.position === undefined || ref.position < 0) {
      errors.push({
        field: `clauseReferences[${index}].position`,
        message: "Clause position must be a non-negative number",
        code: "INVALID_VALUE",
      });
    }
  });
}
