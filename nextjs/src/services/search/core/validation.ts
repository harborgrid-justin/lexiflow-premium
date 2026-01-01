/**
 * Search Validation
 * @module services/search/core/validation
 */

import { ValidationError } from '@/services/core/errors';

/** Validate search query */
export function validateQuery(query: string, methodName: string): void {
  if (query.trim().length === 0) {
    throw new ValidationError(`[SearchService.${methodName}] Query cannot be empty`);
  }
}

/** Validate search term for history */
export function validateHistoryTerm(term: string): boolean {
  return term.trim().length > 0;
}
