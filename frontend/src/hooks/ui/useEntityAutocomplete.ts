/**
 * @module hooks/useEntityAutocomplete
 * @category Hooks - Autocomplete
 * 
 * Generic type-safe autocomplete for entity selection with quick-add.
 * Provides debounced search, LRU cache, and optimistic updates.
 * 
 * @example
 * ```typescript
 * const parties = useEntityAutocomplete({
 *   fetchFn: (search) => api.parties.search({ query: search }),
 *   createFn: (data) => api.parties.create(data),
 *   getLabel: (party) => party.name,
 *   getValue: (party) => party.id,
 *   queryKey: ['parties']
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { queryClient } from '@/services/infrastructure/queryClient';

/**
 * Configuration for entity autocomplete
 */
export interface EntityAutocompleteConfig<TEntity, TCreateData = Partial<TEntity>> {
  /** Function to fetch entities based on search query */
  fetchFn: (search: string) => Promise<TEntity[]>;
  
  /** Function to create a new entity (optional for quick-add) */
  createFn?: (data: TCreateData) => Promise<TEntity>;
  
  /** Extract display label from entity */
  getLabel: (entity: TEntity) => string;
  
  /** Extract unique value from entity */
  getValue: (entity: TEntity) => string;
  
  /** Query key for cache invalidation */
  queryKey: readonly string[];
  
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  
  /** Minimum characters before search triggers (default: 0) */
  minSearchLength?: number;
  
  /** Initial options to show before search */
  initialOptions?: TEntity[];
}

export interface EntityAutocompleteReturn<TEntity, TCreateData = Partial<TEntity>> {
  /** Filtered options based on search */
  options: TEntity[];
  
  /** Current search query */
  searchQuery: string;
  
  /** Update search query */
  setSearchQuery: (query: string) => void;
  
  /** Loading state for fetch operations */
  isLoading: boolean;
  
  /** Loading state for create operations */
  isCreating: boolean;
  
  /** Error from fetch or create */
  error: Error | null;
  
  /** Create a new entity with optimistic update */
  createEntity: (data: TCreateData) => Promise<TEntity>;
  
  /** Manually trigger a search */
  refetch: () => Promise<void>;
  
  /** Clear the current search and results */
  clear: () => void;
  
  /** Check if an entity with this label already exists */
  hasExactMatch: (label: string) => boolean;
}

export function useEntityAutocomplete<TEntity, TCreateData = Partial<TEntity>>({
  fetchFn,
  createFn,
  getLabel,
  getValue: _getValue,
  queryKey,
  debounceMs = 300,
  minSearchLength = 0,
  initialOptions = [],
}: EntityAutocompleteConfig<TEntity, TCreateData>): EntityAutocompleteReturn<TEntity, TCreateData> {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<TEntity[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, debounceMs);
  
  // Cache to prevent duplicate fetches
  const cacheRef = useRef(new Map<string, TEntity[]>());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  /**
   * Fetch entities based on debounced search query
   * Uses AbortController to cancel pending requests
   */
  const fetchEntities = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Don't search if below minimum length
    if (debouncedSearch.length < minSearchLength) {
      setOptions(initialOptions);
      return;
    }
    
    // Check cache first
    const cached = cacheRef.current.get(debouncedSearch);
    if (cached) {
      setOptions(cached);
      return;
    }
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await fetchFn(debouncedSearch);
      
      // Update cache (limit cache size to 50 entries - LRU eviction)
      if (cacheRef.current.size > 50) {
        const firstKey = cacheRef.current.keys().next().value;
        if (firstKey !== undefined) {
          cacheRef.current.delete(firstKey);
        }
      }
      cacheRef.current.set(debouncedSearch, results);
      
      setOptions(results);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        console.error('Entity autocomplete fetch error:', err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [debouncedSearch, fetchFn, minSearchLength, initialOptions]);
  
  // Trigger fetch when debounced search changes
  useEffect(() => {
    void fetchEntities();
  }, [fetchEntities]);
  
  /**
   * Create a new entity with optimistic UI update
   * Invalidates query cache to trigger refetch
   */
  const createEntity = useCallback(async (data: TCreateData): Promise<TEntity> => {
    if (!createFn) {
      throw new Error('createFn not provided to useEntityAutocomplete');
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const newEntity = await createFn(data);
      
      // Optimistically add to current options
      setOptions(prev => [newEntity, ...prev]);
      
      // Invalidate query cache to trigger refetch in other components
      await queryClient.invalidate(queryKey as string[]);
      
      // Clear search cache
      cacheRef.current.clear();
      
      return newEntity;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create entity');
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [createFn, queryKey]);
  
  /**
   * Check if an entity with exact label match exists
   * Case-insensitive comparison
   */
  const hasExactMatch = useCallback((label: string): boolean => {
    const normalizedLabel = label.trim().toLowerCase();
    return options.some(entity => 
      getLabel(entity).trim().toLowerCase() === normalizedLabel
    );
  }, [options, getLabel]);
  
  /**
   * Clear search and reset to initial state
   */
  const clear = useCallback(() => {
    setSearchQuery('');
    setOptions(initialOptions);
    setError(null);
    cacheRef.current.clear();
  }, [initialOptions]);
  
  /**
   * Manual refetch (e.g., after external updates)
   */
  const refetch = useCallback(async () => {
    cacheRef.current.delete(debouncedSearch);
    await fetchEntities();
  }, [debouncedSearch, fetchEntities]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return {
    options,
    searchQuery,
    setSearchQuery,
    isLoading,
    isCreating,
    error,
    createEntity,
    refetch,
    clear,
    hasExactMatch,
  };
}
