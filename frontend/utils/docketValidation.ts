/**
 * @module utils/docketValidation
 * @category Validation
 * @description Runtime validation for docket entries and structured data with type guards
 */

import { DocketEntry, DocketEntryStructuredData, DocketEntryType } from '../types';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface DocketValidationResult {
  isValid: boolean;
  errors: DocketValidationError[];
  warnings: DocketValidationWarning[];
}

export interface DocketValidationError {
  field: string;
  message: string;
  code: string;
}

export interface DocketValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if structured data is valid
 */
export function isValidStructuredData(data: unknown): data is DocketEntryStructuredData {
  if (!data || typeof data !== 'object') return false;
  
  // Required fields
  if (typeof data.actionType !== 'string' || !data.actionType.trim()) return false;
  if (typeof data.actionVerb !== 'string' || !data.actionVerb.trim()) return false;
  
  // Optional fields - must be strings if present
  if (data.documentTitle !== undefined && typeof data.documentTitle !== 'string') return false;
  if (data.filer !== undefined && typeof data.filer !== 'string') return false;
  if (data.additionalText !== undefined && typeof data.additionalText !== 'string') return false;
  
  return true;
}

/**
 * Type guard for valid docket entry type
 */
export function isValidDocketEntryType(type: string): type is DocketEntryType {
  const validTypes: DocketEntryType[] = ['Filing', 'Order', 'Notice', 'Minute Entry', 'Exhibit', 'Hearing', 'Motion'];
  return validTypes.includes(type as DocketEntryType);
}

/**
 * Type guard for complete docket entry
 */
export function isCompleteDocketEntry(entry: Partial<DocketEntry>): entry is DocketEntry {
  return !!(
    entry.id &&
    typeof entry.sequenceNumber === 'number' &&
    entry.caseId &&
    entry.date &&
    entry.type &&
    isValidDocketEntryType(entry.type) &&
    entry.title
  );
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate structured data with detailed error reporting
 */
export function validateStructuredData(data: unknown): DocketValidationResult {
  const errors: DocketValidationError[] = [];
  const warnings: DocketValidationWarning[] = [];
  
  if (!data) {
    return { isValid: true, errors, warnings }; // Structured data is optional
  }
  
  if (typeof data !== 'object') {
    errors.push({
      field: 'structuredData',
      message: 'Structured data must be an object',
      code: 'INVALID_TYPE'
    });
    return { isValid: false, errors, warnings };
  }
  
  // Validate actionType
  if (!data.actionType || typeof data.actionType !== 'string') {
    errors.push({
      field: 'structuredData.actionType',
      message: 'Action type is required and must be a string',
      code: 'MISSING_REQUIRED_FIELD'
    });
  } else if (!data.actionType.trim()) {
    errors.push({
      field: 'structuredData.actionType',
      message: 'Action type cannot be empty',
      code: 'EMPTY_FIELD'
    });
  }
  
  // Validate actionVerb
  if (!data.actionVerb || typeof data.actionVerb !== 'string') {
    errors.push({
      field: 'structuredData.actionVerb',
      message: 'Action verb is required and must be a string',
      code: 'MISSING_REQUIRED_FIELD'
    });
  } else if (!data.actionVerb.trim()) {
    errors.push({
      field: 'structuredData.actionVerb',
      message: 'Action verb cannot be empty',
      code: 'EMPTY_FIELD'
    });
  }
  
  // Validate optional fields
  if (data.documentTitle !== undefined && typeof data.documentTitle !== 'string') {
    errors.push({
      field: 'structuredData.documentTitle',
      message: 'Document title must be a string',
      code: 'INVALID_TYPE'
    });
  }
  
  if (data.filer !== undefined && typeof data.filer !== 'string') {
    errors.push({
      field: 'structuredData.filer',
      message: 'Filer must be a string',
      code: 'INVALID_TYPE'
    });
  }
  
  if (data.additionalText !== undefined && typeof data.additionalText !== 'string') {
    errors.push({
      field: 'structuredData.additionalText',
      message: 'Additional text must be a string',
      code: 'INVALID_TYPE'
    });
  }
  
  // Warnings for missing optional but recommended fields
  if (!data.filer) {
    warnings.push({
      field: 'structuredData.filer',
      message: 'Filer information is missing',
      suggestion: 'Adding filer information improves docket clarity'
    });
  }
  
  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate complete docket entry
 */
export function validateDocketEntry(entry: Partial<DocketEntry>): DocketValidationResult {
  const errors: DocketValidationError[] = [];
  const warnings: DocketValidationWarning[] = [];
  
  // Validate required fields
  if (!entry.id) {
    errors.push({
      field: 'id',
      message: 'Docket entry ID is required',
      code: 'MISSING_REQUIRED_FIELD'
    });
  }
  
  if (typeof entry.sequenceNumber !== 'number') {
    errors.push({
      field: 'sequenceNumber',
      message: 'Sequence number must be a number',
      code: 'INVALID_TYPE'
    });
  } else if (entry.sequenceNumber < 0) {
    errors.push({
      field: 'sequenceNumber',
      message: 'Sequence number cannot be negative',
      code: 'INVALID_VALUE'
    });
  }
  
  if (!entry.caseId) {
    errors.push({
      field: 'caseId',
      message: 'Case ID is required',
      code: 'MISSING_REQUIRED_FIELD'
    });
  }
  
  if (!entry.date) {
    errors.push({
      field: 'date',
      message: 'Date is required',
      code: 'MISSING_REQUIRED_FIELD'
    });
  } else {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(entry.date)) {
      errors.push({
        field: 'date',
        message: 'Date must be in YYYY-MM-DD format',
        code: 'INVALID_FORMAT'
      });
    } else {
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) {
        errors.push({
          field: 'date',
          message: 'Date is not a valid date',
          code: 'INVALID_VALUE'
        });
      }
    }
  }
  
  if (!entry.type) {
    errors.push({
      field: 'type',
      message: 'Entry type is required',
      code: 'MISSING_REQUIRED_FIELD'
    });
  } else if (!isValidDocketEntryType(entry.type)) {
    errors.push({
      field: 'type',
      message: `Invalid entry type: ${entry.type}. Must be one of: Filing, Order, Notice, Minute Entry, Exhibit, Hearing, Motion`,
      code: 'INVALID_VALUE'
    });
  }
  
  if (!entry.title) {
    errors.push({
      field: 'title',
      message: 'Title is required',
      code: 'MISSING_REQUIRED_FIELD'
    });
  } else if (typeof entry.title !== 'string' || !entry.title.trim()) {
    errors.push({
      field: 'title',
      message: 'Title must be a non-empty string',
      code: 'INVALID_VALUE'
    });
  }
  
  // Validate structured data if present
  if (entry.structuredData) {
    const structuredResult = validateStructuredData(entry.structuredData);
    errors.push(...structuredResult.errors);
    warnings.push(...structuredResult.warnings);
  }
  
  // Warnings
  if (!entry.description) {
    warnings.push({
      field: 'description',
      message: 'Description is missing',
      suggestion: 'Adding a description improves docket entry clarity'
    });
  }
  
  if (!entry.filedBy) {
    warnings.push({
      field: 'filedBy',
      message: 'Filing party is missing',
      suggestion: 'Specifying who filed the entry aids in tracking'
    });
  }
  
  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Sanitize docket entry data (security: prevent XSS)
 */
export function sanitizeDocketEntry(entry: Partial<DocketEntry>): Partial<DocketEntry> {
  const sanitized = { ...entry };
  
  // Sanitize string fields to prevent XSS
  const sanitizeString = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')  // Must be first to avoid double-encoding
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  if (sanitized.title) sanitized.title = sanitizeString(sanitized.title);
  if (sanitized.description) sanitized.description = sanitizeString(sanitized.description);
  if (sanitized.filedBy) sanitized.filedBy = sanitizeString(sanitized.filedBy);
  
  if (sanitized.structuredData) {
    const data = sanitized.structuredData;
    if (data.actionType) data.actionType = sanitizeString(data.actionType);
    if (data.actionVerb) data.actionVerb = sanitizeString(data.actionVerb);
    if (data.documentTitle) data.documentTitle = sanitizeString(data.documentTitle);
    if (data.filer) data.filer = sanitizeString(data.filer);
    if (data.additionalText) data.additionalText = sanitizeString(data.additionalText);
  }
  
  return sanitized;
}

/**
 * Validate batch of docket entries
 */
export function validateDocketBatch(entries: Partial<DocketEntry>[]): {
  validEntries: DocketEntry[];
  invalidEntries: Array<{ entry: Partial<DocketEntry>; result: DocketValidationResult }>;
  totalErrors: number;
  totalWarnings: number;
} {
  const validEntries: DocketEntry[] = [];
  const invalidEntries: Array<{ entry: Partial<DocketEntry>; result: DocketValidationResult }> = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const entry of entries) {
    const result = validateDocketEntry(entry);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    
    if (result.isValid && isCompleteDocketEntry(entry)) {
      validEntries.push(entry);
    } else {
      invalidEntries.push({ entry, result });
    }
  }
  
  return { validEntries, invalidEntries, totalErrors, totalWarnings };
}
