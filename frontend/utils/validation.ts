/**
 * @module utils/validation
 * @description Validation utilities for pleading sections and templates
 */

import { PleadingSection, PleadingTemplate, PleadingDocument } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

/**
 * Required section types for complete pleading
 */
export const REQUIRED_SECTION_TYPES = [
  'Caption',
  'Certificate'
] as const;

/**
 * Validates that a pleading has all required sections
 */
export function validatePleadingCompleteness(
  document: PleadingDocument
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for required sections
  const sectionTypes = new Set(document.sections.map(s => s.type));

  for (const requiredType of REQUIRED_SECTION_TYPES) {
    if (!sectionTypes.has(requiredType)) {
      errors.push({
        field: 'sections',
        message: `Missing required section: ${requiredType}`,
        severity: 'error'
      });
    }
  }

  // Check for empty sections
  const emptySections = document.sections.filter(
    s => !s.content || s.content.trim().length === 0
  );

  if (emptySections.length > 0) {
    warnings.push({
      field: 'sections',
      message: `${emptySections.length} section(s) are empty`,
      severity: 'warning'
    });
  }

  // Check for duplicate section orders
  const orders = document.sections.map(s => s.order);
  const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);

  if (duplicateOrders.length > 0) {
    errors.push({
      field: 'sections',
      message: 'Duplicate section orders detected',
      severity: 'error'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates template structure
 */
export function validateTemplate(template: PleadingTemplate): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!template.name || template.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Template name is required',
      severity: 'error'
    });
  }

  if (!template.category || template.category.trim().length === 0) {
    errors.push({
      field: 'category',
      message: 'Template category is required',
      severity: 'error'
    });
  }

  if (!template.defaultSections || template.defaultSections.length === 0) {
    warnings.push({
      field: 'defaultSections',
      message: 'Template has no default sections',
      severity: 'warning'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates section content for common issues
 */
export function validateSectionContent(section: PleadingSection): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for placeholder text that wasn't replaced
  const placeholderPattern = /\[\[?[A-Z_\s]+\]?\]/g;
  const placeholders = section.content?.match(placeholderPattern);

  if (placeholders && placeholders.length > 0) {
    warnings.push({
      field: 'content',
      message: `Unreplaced placeholders found: ${placeholders.join(', ')}`,
      severity: 'warning'
    });
  }

  // Check for excessive length (potential formatting issues)
  if (section.content && section.content.length > 50000) {
    warnings.push({
      field: 'content',
      message: 'Section content is very long and may cause performance issues',
      severity: 'warning'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
