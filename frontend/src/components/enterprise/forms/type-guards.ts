/**
 * @module components/enterprise/forms/type-guards
 * @category Enterprise - Forms
 * @description Type guards for form field schemas
 *
 * This module provides comprehensive type guards for discriminating
 * between different field schema types, enabling type-safe field rendering
 * and validation without using 'any' types.
 */

import type {
  FieldSchema,
  TextFieldSchema,
  NumberFieldSchema,
  DateFieldSchema,
  TextAreaFieldSchema,
  SelectFieldSchema,
  CheckboxFieldSchema,
  FileFieldSchema,
  CustomFieldSchema,
} from '@/types/forms';

// ============================================================================
// FIELD TYPE GUARDS
// ============================================================================

/**
 * Type guard for text input fields
 * @param field - Field schema to check
 * @returns True if field is a text input field
 */
export function isTextField(field: FieldSchema): field is TextFieldSchema {
  return ['text', 'email', 'password', 'tel', 'url', 'search'].includes(field.type);
}

/**
 * Type guard for number input fields
 * @param field - Field schema to check
 * @returns True if field is a number input field
 */
export function isNumberField(field: FieldSchema): field is NumberFieldSchema {
  return ['number', 'range'].includes(field.type);
}

/**
 * Type guard for date/time input fields
 * @param field - Field schema to check
 * @returns True if field is a date/time input field
 */
export function isDateField(field: FieldSchema): field is DateFieldSchema {
  return ['date', 'datetime-local', 'time', 'month', 'week'].includes(field.type);
}

/**
 * Type guard for textarea fields
 * @param field - Field schema to check
 * @returns True if field is a textarea field
 */
export function isTextAreaField(field: FieldSchema): field is TextAreaFieldSchema {
  return field.type === 'textarea';
}

/**
 * Type guard for select/dropdown fields
 * @param field - Field schema to check
 * @returns True if field is a select, multiselect, or radio field
 */
export function isSelectField(field: FieldSchema): field is SelectFieldSchema {
  return ['select', 'multiselect', 'radio'].includes(field.type);
}

/**
 * Type guard for checkbox/toggle fields
 * @param field - Field schema to check
 * @returns True if field is a checkbox or toggle field
 */
export function isCheckboxField(field: FieldSchema): field is CheckboxFieldSchema {
  return ['checkbox', 'toggle'].includes(field.type);
}

/**
 * Type guard for file upload fields
 * @param field - Field schema to check
 * @returns True if field is a file upload field
 */
export function isFileField(field: FieldSchema): field is FileFieldSchema {
  return field.type === 'file';
}

/**
 * Type guard for custom component fields
 * @param field - Field schema to check
 * @returns True if field is a custom component field
 */
export function isCustomField(field: FieldSchema): field is CustomFieldSchema {
  return field.type === 'custom';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get field type category
 * @param field - Field schema
 * @returns String describing the field category
 */
export function getFieldCategory(field: FieldSchema): string {
  if (isTextField(field)) return 'text';
  if (isNumberField(field)) return 'number';
  if (isDateField(field)) return 'date';
  if (isTextAreaField(field)) return 'textarea';
  if (isSelectField(field)) return 'select';
  if (isCheckboxField(field)) return 'checkbox';
  if (isFileField(field)) return 'file';
  if (isCustomField(field)) return 'custom';
  return 'unknown';
}

/**
 * Check if field supports character count
 * @param field - Field schema
 * @returns True if field can show character count
 */
export function supportsCharacterCount(field: FieldSchema): boolean {
  return (isTextField(field) && field.showCharCount === true) ||
         (isTextAreaField(field) && field.maxLength !== undefined);
}

/**
 * Check if field has options (select, multiselect, radio)
 * @param field - Field schema
 * @returns True if field has options
 */
export function hasOptions(field: FieldSchema): field is SelectFieldSchema {
  return isSelectField(field);
}

/**
 * Check if field supports min/max values
 * @param field - Field schema
 * @returns True if field supports min/max constraints
 */
export function supportsMinMax(field: FieldSchema): field is NumberFieldSchema | DateFieldSchema {
  return isNumberField(field) || isDateField(field);
}
