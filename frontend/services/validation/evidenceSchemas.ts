/**
 * @module services/validation/evidenceSchemas
 * @description Runtime validation for evidence vault operations
 * Provides XSS prevention, input sanitization, and type-safe validation
 * Uses native TypeScript validation (no external dependencies)
 */

import { AdmissibilityStatusEnum, CustodyActionType } from '../../types/enums';
import type { EvidenceItem, ChainOfCustodyEvent } from '../../types';

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

// Evidence filter type for validation
export interface EvidenceFilters {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

// Helper validators
const isValidDate = (date: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(date);
const isValidUUID = (uuid: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
const isValidHash = (hash: string): boolean => /^[a-fA-F0-9]{64}$/.test(hash);

const evidenceTypes = ['Physical', 'Digital', 'Document', 'Testimony', 'Forensic'] as const;
const admissibilityStatuses = Object.values(AdmissibilityStatusEnum);
const custodyActions = Object.values(CustodyActionType);

/**
 * Evidence Item Validator
 * Validates all evidence intake and update operations
 */
const validateEvidenceItem = (data: any): ValidationResult<Partial<EvidenceItem>> => {
  const errors: Array<{ path: string; message: string }> = [];
  
  if (!data.id || typeof data.id !== 'string') {
    errors.push({ path: 'id', message: 'Evidence ID is required' });
  }
  
  if (!data.trackingUuid || !isValidUUID(data.trackingUuid)) {
    errors.push({ path: 'trackingUuid', message: 'Invalid UUID format' });
  }
  
  if (!data.caseId || typeof data.caseId !== 'string') {
    errors.push({ path: 'caseId', message: 'Case ID is required' });
  }
  
  const title = data.title ? sanitizeString(data.title) : '';
  if (!title) {
    errors.push({ path: 'title', message: 'Title is required' });
  } else if (title.length > 500) {
    errors.push({ path: 'title', message: 'Title too long' });
  }
  
  if (!evidenceTypes.includes(data.type)) {
    errors.push({ path: 'type', message: 'Invalid evidence type' });
  }
  
  const description = data.description ? sanitizeString(data.description) : '';
  if (description.length > 5000) {
    errors.push({ path: 'description', message: 'Description too long' });
  }
  
  if (!data.collectionDate || !isValidDate(data.collectionDate)) {
    errors.push({ path: 'collectionDate', message: 'Invalid date format (YYYY-MM-DD)' });
  }
  
  const collectedBy = data.collectedBy ? sanitizeString(data.collectedBy) : '';
  if (!collectedBy) {
    errors.push({ path: 'collectedBy', message: 'Collector name is required' });
  } else if (collectedBy.length > 200) {
    errors.push({ path: 'collectedBy', message: 'Collector name too long' });
  }
  
  const custodian = data.custodian ? sanitizeString(data.custodian) : '';
  if (!custodian) {
    errors.push({ path: 'custodian', message: 'Custodian is required' });
  } else if (custodian.length > 200) {
    errors.push({ path: 'custodian', message: 'Custodian name too long' });
  }
  
  const location = data.location ? sanitizeString(data.location) : '';
  if (location.length > 500) {
    errors.push({ path: 'location', message: 'Location too long' });
  }
  
  if (!admissibilityStatuses.includes(data.admissibility)) {
    errors.push({ path: 'admissibility', message: 'Invalid admissibility status' });
  }
  
  if (data.tags && (!Array.isArray(data.tags) || data.tags.length > 20)) {
    errors.push({ path: 'tags', message: 'Too many tags (max 20)' });
  }
  
  if (data.blockchainHash && !isValidHash(data.blockchainHash)) {
    errors.push({ path: 'blockchainHash', message: 'Invalid hash format' });
  }
  
  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }
  
  return { 
    success: true, 
    data: {
      ...data,
      title,
      description,
      collectedBy,
      custodian,
      location
    }
  };
};

/**
 * Chain of Custody Event Validator
 * Validates custody log entries
 */
const validateCustodyEvent = (data: any): ValidationResult<ChainOfCustodyEvent> => {
  const errors: Array<{ path: string; message: string }> = [];
  
  if (!data.id || typeof data.id !== 'string') {
    errors.push({ path: 'id', message: 'Event ID is required' });
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/;
  if (!data.date || !dateRegex.test(data.date)) {
    errors.push({ path: 'date', message: 'Invalid date format' });
  }
  
  if (!custodyActions.includes(data.action)) {
    errors.push({ path: 'action', message: 'Invalid custody action' });
  }
  
  const actor = data.actor ? sanitizeString(data.actor) : '';
  if (!actor) {
    errors.push({ path: 'actor', message: 'Actor name is required' });
  } else if (actor.length > 200) {
    errors.push({ path: 'actor', message: 'Actor name too long' });
  }
  
  const notes = data.notes ? sanitizeString(data.notes) : undefined;
  if (notes && notes.length > 2000) {
    errors.push({ path: 'notes', message: 'Notes too long' });
  }
  
  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }
  
  return { 
    success: true, 
    data: {
      ...data,
      actor,
      notes
    }
  };
};

/**
 * Evidence Filter Validator
 * Validates filter parameters to prevent injection attacks
 */
const validateEvidenceFilters = (data: unknown): ValidationResult<EvidenceFilters> => {
  const errors: Array<{ path: string; message: string }> = [];
  const filters: EvidenceFilters = {};
  
  if (data && typeof data === 'object') {
    const input = data as Record<string, unknown>;
    
    if (input.search && typeof input.search === 'string') {
      const search = sanitizeString(input.search);
      if (search.length > 200) {
        errors.push({ path: 'search', message: 'Search query too long' });
      } else {
        filters.search = search;
      }
    }
    
    if (input.dateFrom && typeof input.dateFrom === 'string') {
      if (!isValidDate(input.dateFrom) && input.dateFrom !== '') {
        errors.push({ path: 'dateFrom', message: 'Invalid date format' });
      } else {
        filters.dateFrom = input.dateFrom;
      }
    }
    
    if (input.dateTo && typeof input.dateTo === 'string') {
      if (!isValidDate(input.dateTo) && input.dateTo !== '') {
        errors.push({ path: 'dateTo', message: 'Invalid date format' });
      } else {
        filters.dateTo = input.dateTo;
      }
    }
  }
  
  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }
  
  return { success: true, data: filters };
};

/**
 * Safe validation helpers - returns { success: true, data } or { success: false, error }
 */
export const validateEvidenceItemSafe = (data: unknown): ValidationResult<Partial<EvidenceItem>> => {
  return validateEvidenceItem(data);
};

export const validateCustodyEventSafe = (data: unknown): ValidationResult<ChainOfCustodyEvent> => {
  return validateCustodyEvent(data);
};

export const validateEvidenceFiltersSafe = (data: unknown): ValidationResult<EvidenceFilters> => {
  return validateEvidenceFilters(data);
};

// Re-export enums for convenience
export { CustodyActionType, AdmissibilityStatusEnum };
