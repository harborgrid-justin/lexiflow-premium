/**
 * filterHelpers.ts
 * 
 * Utility functions for filtering jurisdiction data.
 * 
 * @module components/jurisdiction/utils/filterHelpers
 */

import { LegalRule } from '@/types';

/**
 * Filters states by search term matching name or region
 */
export const filterStates = <T extends { name: string; region: string }>(
  states: T[],
  searchTerm: string
): T[] => {
  const term = searchTerm.toLowerCase();
  return states.filter(s => 
    s.name.toLowerCase().includes(term) || 
    s.region.toLowerCase().includes(term)
  );
};

/**
 * Filters legal rules by code, name, or type
 */
export const filterRules = (
  rules: LegalRule[],
  searchTerm: string
): LegalRule[] => {
  const term = searchTerm.toLowerCase();
  return rules.filter(r => 
    r.code.toLowerCase().includes(term) ||
    r.name.toLowerCase().includes(term) || 
    r.type.toLowerCase().includes(term)
  );
};

/**
 * Generic filter function that searches across multiple string fields
 */
export const filterByMultipleFields = <T extends Record<string, unknown>>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] => {
  const term = searchTerm.toLowerCase();
  return items.filter(item => 
    fields.some(field => {
      const value = item[field];
      return typeof value === 'string' && value.toLowerCase().includes(term);
    })
  );
};
