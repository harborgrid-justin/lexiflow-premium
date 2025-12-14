/**
 * @module services/validation/discoverySchemas
 * @description Runtime validation for discovery center operations
 * Provides XSS prevention, input sanitization, and type-safe validation
 * Uses native TypeScript validation (no external dependencies)
 * Ensures FRCP compliance for discovery requests, privilege logs, and legal holds
 */

import { DiscoveryRequestStatusEnum, ESICollectionStatusEnum, LegalHoldStatusEnum, PrivilegeBasisEnum } from '../../types/enums';
import type { DiscoveryRequest, PrivilegeLogEntry, LegalHold } from '../../types';

// XSS Prevention: Sanitize HTML/script tags
const sanitizeString = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

// Validation result type
type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: { errors: Array<{ path: string; message: string }> } };

// Helper validators
const isValidDate = (date: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(date);
const isValidDateTime = (date: string): boolean => /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/.test(date);
const isValidBatesPrefix = (prefix: string): boolean => /^[A-Z0-9_-]{1,10}$/.test(prefix);

const discoveryRequestStatuses = Object.values(DiscoveryRequestStatusEnum);
const esiCollectionStatuses = Object.values(ESICollectionStatusEnum);
const legalHoldStatuses = Object.values(LegalHoldStatusEnum);
const privilegeBasisTypes = Object.values(PrivilegeBasisEnum);

const discoveryTypes = ['Production', 'Interrogatory', 'Admission', 'Deposition'] as const;

/**
 * Discovery Request Validator
 * Validates discovery request data with FRCP compliance checks
 */
const validateDiscoveryRequest = (data: any): ValidationResult<Partial<DiscoveryRequest>> => {
  const errors: Array<{ path: string; message: string }> = [];
  
  if (!data.id || typeof data.id !== 'string') {
    errors.push({ path: 'id', message: 'Request ID is required' });
  }
  
  const title = data.title ? sanitizeString(data.title) : '';
  if (!title) {
    errors.push({ path: 'title', message: 'Title is required' });
  } else if (title.length > 500) {
    errors.push({ path: 'title', message: 'Title too long (max 500 characters)' });
  }
  
  if (!discoveryTypes.includes(data.type)) {
    errors.push({ path: 'type', message: 'Invalid discovery type' });
  }
  
  if (data.serviceDate && !isValidDate(data.serviceDate)) {
    errors.push({ path: 'serviceDate', message: 'Invalid service date format (YYYY-MM-DD)' });
  }
  
  if (!data.dueDate || !isValidDate(data.dueDate)) {
    errors.push({ path: 'dueDate', message: 'Invalid due date format (YYYY-MM-DD)' });
  }
  
  if (!discoveryRequestStatuses.includes(data.status)) {
    errors.push({ path: 'status', message: 'Invalid status' });
  }
  
  const description = data.description ? sanitizeString(data.description) : '';
  if (description.length > 5000) {
    errors.push({ path: 'description', message: 'Description too long (max 5000 characters)' });
  }
  
  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }
  
  return { 
    success: true, 
    data: {
      ...data,
      title,
      description
    }
  };
};

/**
 * Privilege Log Entry Validator
 * Validates FRCP 26(b)(5) privilege log entries
 */
const validatePrivilegeLogEntry = (data: any): ValidationResult<Partial<PrivilegeLogEntry>> => {
  const errors: Array<{ path: string; message: string }> = [];
  
  if (!data.id || typeof data.id !== 'string') {
    errors.push({ path: 'id', message: 'Entry ID is required' });
  }
  
  if (!data.date || !isValidDate(data.date)) {
    errors.push({ path: 'date', message: 'Invalid date format (YYYY-MM-DD)' });
  }
  
  if (!privilegeBasisTypes.includes(data.basis)) {
    errors.push({ path: 'basis', message: 'Invalid privilege basis' });
  }
  
  const author = data.author ? sanitizeString(data.author) : '';
  if (!author) {
    errors.push({ path: 'author', message: 'Author is required' });
  } else if (author.length > 200) {
    errors.push({ path: 'author', message: 'Author name too long' });
  }
  
  const recipient = data.recipient ? sanitizeString(data.recipient) : '';
  if (!recipient) {
    errors.push({ path: 'recipient', message: 'Recipient is required' });
  } else if (recipient.length > 200) {
    errors.push({ path: 'recipient', message: 'Recipient name too long' });
  }
  
  const desc = data.desc ? sanitizeString(data.desc) : '';
  if (!desc) {
    errors.push({ path: 'desc', message: 'Description is required per FRCP 26(b)(5)' });
  } else if (desc.length < 20) {
    errors.push({ path: 'desc', message: 'Description must be sufficient to enable assessment of privilege claim (min 20 characters)' });
  } else if (desc.length > 1000) {
    errors.push({ path: 'desc', message: 'Description too long (max 1000 characters)' });
  }
  
  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }
  
  return { 
    success: true, 
    data: {
      ...data,
      author,
      recipient,
      desc
    }
  };
};

/**
 * Legal Hold Validator
 * Validates legal hold data with preservation requirements
 */
const validateLegalHold = (data: any): ValidationResult<Partial<LegalHold>> => {
  const errors: Array<{ path: string; message: string }> = [];
  
  if (!data.id || typeof data.id !== 'string') {
    errors.push({ path: 'id', message: 'Hold ID is required' });
  }
  
  const custodian = data.custodian ? sanitizeString(data.custodian) : '';
  if (!custodian) {
    errors.push({ path: 'custodian', message: 'Custodian is required' });
  } else if (custodian.length > 200) {
    errors.push({ path: 'custodian', message: 'Custodian name too long' });
  }
  
  const dept = data.dept ? sanitizeString(data.dept) : '';
  if (dept.length > 200) {
    errors.push({ path: 'dept', message: 'Department name too long' });
  }
  
  if (!data.issued || !isValidDate(data.issued)) {
    errors.push({ path: 'issued', message: 'Invalid issue date format (YYYY-MM-DD)' });
  }
  
  if (!legalHoldStatuses.includes(data.status)) {
    errors.push({ path: 'status', message: 'Invalid status' });
  }
  
  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }
  
  return { 
    success: true, 
    data: {
      ...data,
      custodian,
      dept
    }
  };
};

/**
 * Production Config Validator
 * Validates production settings including Bates numbering
 */
const validateProductionConfig = (data: any): ValidationResult<any> => {
  const errors: Array<{ path: string; message: string }> = [];
  
  const batesPrefix = data.batesPrefix ? data.batesPrefix.trim() : '';
  if (!batesPrefix) {
    errors.push({ path: 'batesPrefix', message: 'Bates prefix is required' });
  } else if (!isValidBatesPrefix(batesPrefix)) {
    errors.push({ path: 'batesPrefix', message: 'Invalid Bates prefix format (A-Z, 0-9, _, - only, max 10 chars)' });
  }
  
  const startNumber = parseInt(data.startNumber);
  if (isNaN(startNumber) || startNumber < 1) {
    errors.push({ path: 'startNumber', message: 'Start number must be a positive integer' });
  } else if (startNumber > 999999999) {
    errors.push({ path: 'startNumber', message: 'Start number too large (max 999999999)' });
  }
  
  const validFormats = ['PDF', 'Native', 'TIFF'];
  if (!validFormats.includes(data.format)) {
    errors.push({ path: 'format', message: 'Invalid format (must be PDF, Native, or TIFF)' });
  }
  
  if (typeof data.includeLoadFile !== 'boolean') {
    errors.push({ path: 'includeLoadFile', message: 'includeLoadFile must be boolean' });
  }
  
  if (typeof data.ocr !== 'boolean') {
    errors.push({ path: 'ocr', message: 'ocr must be boolean' });
  }
  
  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }
  
  return { success: true, data };
};

/**
 * ESI Source Validator
 * Validates ESI source configuration
 */
const validateESISource = (data: any): ValidationResult<any> => {
  const errors: Array<{ path: string; message: string }> = [];
  
  const name = data.name ? sanitizeString(data.name) : '';
  if (!name) {
    errors.push({ path: 'name', message: 'Source name is required' });
  } else if (name.length > 200) {
    errors.push({ path: 'name', message: 'Source name too long' });
  }
  
  const validTypes = ['Email', 'Slack', 'Device', 'SharePoint', 'OneDrive', 'Database'];
  if (!validTypes.includes(data.type)) {
    errors.push({ path: 'type', message: 'Invalid source type' });
  }
  
  if (!esiCollectionStatuses.includes(data.status)) {
    errors.push({ path: 'status', message: 'Invalid status' });
  }
  
  const custodian = data.custodian ? sanitizeString(data.custodian) : '';
  if (custodian.length > 200) {
    errors.push({ path: 'custodian', message: 'Custodian name too long' });
  }
  
  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }
  
  return { 
    success: true, 
    data: {
      ...data,
      name,
      custodian
    }
  };
};

/**
 * Discovery Filter Validator
 * Validates filter parameters to prevent injection attacks
 */
const validateDiscoveryFilters = (data: any): ValidationResult<any> => {
  const errors: Array<{ path: string; message: string }> = [];
  
  if (data.search && typeof data.search === 'string') {
    const search = sanitizeString(data.search);
    if (search.length > 200) {
      errors.push({ path: 'search', message: 'Search query too long' });
    }
  }
  
  if (data.dateFrom && !isValidDate(data.dateFrom) && data.dateFrom !== '') {
    errors.push({ path: 'dateFrom', message: 'Invalid date format' });
  }
  
  if (data.dateTo && !isValidDate(data.dateTo) && data.dateTo !== '') {
    errors.push({ path: 'dateTo', message: 'Invalid date format' });
  }
  
  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }
  
  return { success: true, data };
};

/**
 * Safe validation helpers - returns { success: true, data } or { success: false, error }
 */
export const validateDiscoveryRequestSafe = (data: unknown): ValidationResult<Partial<DiscoveryRequest>> => {
  return validateDiscoveryRequest(data);
};

export const validatePrivilegeLogEntrySafe = (data: unknown): ValidationResult<Partial<PrivilegeLogEntry>> => {
  return validatePrivilegeLogEntry(data);
};

export const validateLegalHoldSafe = (data: unknown): ValidationResult<Partial<LegalHold>> => {
  return validateLegalHold(data);
};

export const validateProductionConfigSafe = (data: unknown): ValidationResult<any> => {
  return validateProductionConfig(data);
};

export const validateESISourceSafe = (data: unknown): ValidationResult<any> => {
  return validateESISource(data);
};

export const validateDiscoveryFiltersSafe = (data: unknown): ValidationResult<any> => {
  return validateDiscoveryFilters(data);
};

// Re-export enums for convenience
export { DiscoveryRequestStatusEnum, ESICollectionStatusEnum, LegalHoldStatusEnum, PrivilegeBasisEnum };
