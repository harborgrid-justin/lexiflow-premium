/**
 * useFilterAndSearch.ts
 * 
 * Reusable hook for filtering and searching collections
 * Eliminates repeated filter/search logic across components
 */

import { useMemo, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================
export interface FilterConfig<T> {
  /** Category/type field to filter by */
  categoryField?: keyof T;
  /** Search fields to match against */
  searchFields: (keyof T)[];
  /** Array fields that should be searched within (e.g., tags) */
  arrayFields?: (keyof T)[];
}

export interface UseFilterAndSearchOptions<T> {
  /** The collection to filter */
  items: T[];
  /** Filter configuration */
  config: FilterConfig<T>;
  /** Initial category value */
  initialCategory?: string;
  /** Initial search query */
  initialSearch?: string;
}

export interface UseFilterAndSearchReturn<T> {
  /** Filtered items */
  filteredItems: T[];
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Current category */
  category: string;
  /** Set category */
  setCategory: (category: string) => void;
  /** Available categories */
  categories: string[];
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useFilterAndSearch - Unified filtering and search logic
 * 
 * @example
 * ```tsx
 * const { filteredItems, searchQuery, setSearchQuery, category, setCategory } = useFilterAndSearch({
 *   items: templates,
 *   config: {
 *     categoryField: 'category',
 *     searchFields: ['title', 'description'],
 *     arrayFields: ['tags']
 *   }
 * });
 * ```
 */
export const useFilterAndSearch = <T extends Record<string, any>>({
  items,
  config,
  initialCategory = 'All',
  initialSearch = ''
}: UseFilterAndSearchOptions<T>): UseFilterAndSearchReturn<T> => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  // Extract unique categories from items
  const categories = useMemo(() => {
    if (!config.categoryField) return ['All'];
    
    const uniqueCategories = new Set(
      items.map(item => String(item[config.categoryField!]))
    );
    
    return ['All', ...Array.from(uniqueCategories).sort()];
  }, [items, config.categoryField]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    
    return items.filter(item => {
      // Category filter
      if (category !== 'All' && config.categoryField) {
        if (String(item[config.categoryField]) !== category) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        
        // Search in regular fields
        const matchesFields = config.searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(lowerQuery);
        });

        // Search in array fields (like tags)
        const matchesArrayFields = config.arrayFields?.some(field => {
          const value = item[field];
          return Array.isArray(value) && value.some(v => 
            String(v).toLowerCase().includes(lowerQuery)
          );
        });

        return matchesFields || matchesArrayFields;
      }

      return true;
    });
  }, [items, searchQuery, category, config]);

  return {
    filteredItems,
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
    categories
  };
};
