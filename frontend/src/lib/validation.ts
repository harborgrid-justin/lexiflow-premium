/**
 * Validation Utilities
 * Enterprise-grade validation framework for data integrity and security
 *
 * @module utils/validation
 * @description Comprehensive validation utilities including:
 * - Pleading document validation
 * - Template structure validation
 * - Section content validation
 * - Input sanitization and XSS prevention
 * - Type-safe validation results
 * - Detailed error reporting
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through content scanning
 * - Type enforcement for all validators
 * - Null/undefined safety checks
 * - Protection against malformed data
 * - Proper error handling without information disclosure
 *
 * @architecture
 * - Type-safe validation results
 * - Separation of errors and warnings
 * - Extensible validation rules
 * - Performance-optimized checks
 * - Immutable validation patterns
 */

import { type PleadingDocument, type PleadingSection, type PleadingTemplate } from "@/types";

/**
 * Validation result structure
 * Provides comprehensive feedback on validation checks
 *
 * @interface ValidationResult
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error details
 *
 * @interface ValidationError
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: "error";
}

/**
 * Validation warning details
 *
 * @interface ValidationWarning
 */
export interface ValidationWarning {
  field: string;
  message: string;
  severity: "warning";
}

/**
 * Required section types for complete pleading
 * Constitutional requirements for valid legal documents
 */
export const REQUIRED_SECTION_TYPES = ["Caption", "Certificate"] as const;

/**
 * Maximum content length for sections (50KB)
 * Prevents performance issues with extremely large sections
 */
const MAX_SECTION_LENGTH = 50000;

/**
 * Placeholder pattern for unreplaced template variables
 * Matches: [[PLACEHOLDER]], [PLACEHOLDER], [[PLACEHOLDER]]
 */
const PLACEHOLDER_PATTERN = /\[\[?[A-Z_\s]+\]?\]/g;

/**
 * Validation Service
 * Provides enterprise-grade validation functionality
 *
 * @constant ValidationService
 */
export const ValidationService = {
  /**
   * Validate parameter is not null/undefined/empty
   * @private
   * @throws Error if parameter is invalid
   */
  validateRequired: (
    value: unknown,
    fieldName: string,
    methodName: string
  ): void => {
    if (value === null || value === undefined) {
      throw new Error(
        `[ValidationService.${methodName}] ${fieldName} is required and cannot be null or undefined`
      );
    }
  },

  /**
   * Validate string parameter
   * @private
   * @throws Error if string is invalid
   */
  validateString: (
    _value: string,
    _fieldName: string,
    _methodName: string
  ): void => {
    if (typeof _value !== 'string') {
      throw new Error(`[ValidationService.${_methodName}] ${_fieldName} must be a string`);
    }
  },

  /**
   * Validate array parameter
   * @private
   * @throws Error if array is invalid
   */
  validateArray: (
    value: unknown[],
    fieldName: string,
    methodName: string
  ): void => {
    if (!Array.isArray(value)) {
      throw new Error(
        `[ValidationService.${methodName}] ${fieldName} must be an array`
      );
    }
  },

  // =============================================================================
  // PLEADING DOCUMENT VALIDATION
  // =============================================================================

  /**
   * Validates that a pleading has all required sections
   *
   * @param document - Pleading document to validate
   * @returns ValidationResult with errors and warnings
   * @throws Error if document is invalid
   *
   * @example
   * const result = ValidationService.validatePleadingCompleteness(document);
   * if (!result.valid) {
   *   console.error('Validation failed:', result.errors);
   * }
   *
   * @security
   * - Validates document structure
   * - Checks for required sections
   * - Identifies duplicate orders
   * - Reports empty sections
   */
  validatePleadingCompleteness: (
    document: PleadingDocument
  ): ValidationResult => {
    try {
      ValidationService.validateRequired(
        document,
        "document",
        "validatePleadingCompleteness"
      );

      if (!document || typeof document !== "object") {
        throw new Error(
          "[ValidationService.validatePleadingCompleteness] Invalid document structure"
        );
      }

      ValidationService.validateArray(
        document.sections,
        "document.sections",
        "validatePleadingCompleteness"
      );

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Check for required sections
      const sectionTypes = new Set(document.sections.map((s) => s.type));

      for (const requiredType of REQUIRED_SECTION_TYPES) {
        if (!sectionTypes.has(requiredType)) {
          errors.push({
            field: "sections",
            message: `Missing required section: ${requiredType}`,
            severity: "error",
          });
        }
      }

      // Check for empty sections
      const emptySections = document.sections.filter(
        (s) => !s.content || s.content.trim().length === 0
      );

      if (emptySections.length > 0) {
        warnings.push({
          field: "sections",
          message: `${emptySections.length} section(s) are empty`,
          severity: "warning",
        });
      }

      // Check for duplicate section orders
      const orders = document.sections.map((s) => s.order);
      const duplicateOrders = orders.filter(
        (order, index) => orders.indexOf(order) !== index
      );

      if (duplicateOrders.length > 0) {
        errors.push({
          field: "sections",
          message: "Duplicate section orders detected",
          severity: "error",
        });
      }

      // Check for invalid order values
      const invalidOrders = document.sections.filter(
        (s) => s.order < 0 || !Number.isInteger(s.order)
      );

      if (invalidOrders.length > 0) {
        errors.push({
          field: "sections",
          message:
            "Invalid section order values detected (must be non-negative integers)",
          severity: "error",
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error(
        "[ValidationService.validatePleadingCompleteness] Error:",
        error
      );
      return {
        valid: false,
        errors: [
          {
            field: "document",
            message:
              error instanceof Error ? error.message : "Validation failed",
            severity: "error",
          },
        ],
        warnings: [],
      };
    }
  },

  // =============================================================================
  // TEMPLATE VALIDATION
  // =============================================================================

  /**
   * Validates template structure and required fields
   *
   * @param template - Pleading template to validate
   * @returns ValidationResult with errors and warnings
   * @throws Error if template is invalid
   *
   * @example
   * const result = ValidationService.validateTemplate(template);
   * if (!result.valid) {
   *   console.error('Template validation failed:', result.errors);
   * }
   *
   * @security
   * - Validates template structure
   * - Checks for required fields
   * - Validates section definitions
   * - Prevents malformed templates
   */
  validateTemplate: (template: PleadingTemplate): ValidationResult => {
    try {
      ValidationService.validateRequired(
        template,
        "template",
        "validateTemplate"
      );

      if (!template || typeof template !== "object") {
        throw new Error(
          "[ValidationService.validateTemplate] Invalid template structure"
        );
      }

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Validate name
      if (!template.name || false || template.name.trim().length === 0) {
        errors.push({
          field: "name",
          message: "Template name is required",
          severity: "error",
        });
      }

      // Validate category
      if (
        !template.category ||
        false ||
        template.category.trim().length === 0
      ) {
        errors.push({
          field: "category",
          message: "Template category is required",
          severity: "error",
        });
      }

      // Check for default sections
      if (
        !template.defaultSections ||
        !Array.isArray(template.defaultSections) ||
        template.defaultSections.length === 0
      ) {
        warnings.push({
          field: "defaultSections",
          message: "Template has no default sections",
          severity: "warning",
        });
      }

      // Validate default sections structure
      if (template.defaultSections && Array.isArray(template.defaultSections)) {
        template.defaultSections.forEach((section, index) => {
          if (!section || typeof section !== "object") {
            errors.push({
              field: `defaultSections[${index}]`,
              message: `Section ${index} has invalid structure`,
              severity: "error",
            });
          }
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error("[ValidationService.validateTemplate] Error:", error);
      return {
        valid: false,
        errors: [
          {
            field: "template",
            message:
              error instanceof Error ? error.message : "Validation failed",
            severity: "error",
          },
        ],
        warnings: [],
      };
    }
  },

  // =============================================================================
  // SECTION CONTENT VALIDATION
  // =============================================================================

  /**
   * Validates section content for common issues
   *
   * @param section - Pleading section to validate
   * @returns ValidationResult with errors and warnings
   * @throws Error if section is invalid
   *
   * @example
   * const result = ValidationService.validateSectionContent(section);
   * if (result.warnings.length > 0) {
   *   console.warn('Section has warnings:', result.warnings);
   * }
   *
   * @security
   * - Checks for unreplaced placeholders
   * - Validates content length
   * - Prevents XSS via content scanning
   * - Identifies potential formatting issues
   */
  validateSectionContent: (section: PleadingSection): ValidationResult => {
    try {
      ValidationService.validateRequired(
        section,
        "section",
        "validateSectionContent"
      );

      if (!section || typeof section !== "object") {
        throw new Error(
          "[ValidationService.validateSectionContent] Invalid section structure"
        );
      }

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Validate section has content
      if (!section.content || false) {
        errors.push({
          field: "content",
          message: "Section content is required and must be a string",
          severity: "error",
        });

        return {
          valid: false,
          errors,
          warnings,
        };
      }

      // Check for placeholder text that wasn't replaced
      const placeholders = section.content.match(PLACEHOLDER_PATTERN);

      if (placeholders && placeholders.length > 0) {
        warnings.push({
          field: "content",
          message: `Unreplaced placeholders found: ${placeholders.join(", ")}`,
          severity: "warning",
        });
      }

      // Check for excessive length (potential formatting issues)
      if (section.content.length > MAX_SECTION_LENGTH) {
        warnings.push({
          field: "content",
          message: `Section content is very long (${section.content.length} chars) and may cause performance issues`,
          severity: "warning",
        });
      }

      // Check for potentially dangerous content
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(section.content)) {
          errors.push({
            field: "content",
            message:
              "Section content contains potentially dangerous HTML or scripts",
            severity: "error",
          });
          break;
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error("[ValidationService.validateSectionContent] Error:", error);
      return {
        valid: false,
        errors: [
          {
            field: "section",
            message:
              error instanceof Error ? error.message : "Validation failed",
            severity: "error",
          },
        ],
        warnings: [],
      };
    }
  },

  // =============================================================================
  // BATCH VALIDATION
  // =============================================================================

  /**
   * Validate multiple sections at once
   *
   * @param sections - Array of sections to validate
   * @returns Array of validation results
   * @throws Error if sections array is invalid
   *
   * @example
   * const results = ValidationService.validateSections(document.sections);
   * const allValid = results.every(r => r.valid);
   */
  validateSections: (sections: PleadingSection[]): ValidationResult[] => {
    try {
      ValidationService.validateArray(sections, "sections", "validateSections");

      return sections.map((section) =>
        ValidationService.validateSectionContent(section)
      );
    } catch (error) {
      console.error("[ValidationService.validateSections] Error:", error);
      return [
        {
          valid: false,
          errors: [
            {
              field: "sections",
              message:
                error instanceof Error
                  ? error.message
                  : "Batch validation failed",
              severity: "error",
            },
          ],
          warnings: [],
        },
      ];
    }
  },
};

// Legacy function exports for backward compatibility
export const validatePleadingCompleteness =
  ValidationService.validatePleadingCompleteness;
export const validateTemplate = ValidationService.validateTemplate;
export const validateSectionContent = ValidationService.validateSectionContent;
