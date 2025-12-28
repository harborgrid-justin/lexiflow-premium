/**
 * @module hooks/useWorkerSearch
 * @category Hooks - Search
 * 
 * Worker-based full-text search with race condition protection.
 * Manages SearchWorker lifecycle and non-blocking search execution.
 * 
 * @example
 * ```typescript
 * const { filteredItems, isSearching } = useWorkerSearch({
 *   items: documents,
 *   query: searchTerm,
 *   fields: ['title', 'content', 'author']
 * });
 * 
 * {isSearching && <Spinner />}
 * {filteredItems.map(item => <Item key={item.id} {...item} />)}
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useEffect, useRef } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { SearchWorker } from '@/services';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Props for useWorkerSearch hook
 */
interface UseWorkerSearchProps<T> {
  /** Items to search */
  items: T[];
  /** Search query */
  query: string;
  /** Fields to search in */
  fields?: (keyof T)[];
  /** ID key for item identity */
  idKey?: keyof T;
}

/**
 * Return type for useWorkerSearch hook
 */
export interface UseWorkerSearchReturn<T> {
  /** Filtered items matching search */
  filteredItems: T[];
  /** Whether search is in progress */
  isSearching: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Worker-based full-text search with race condition protection.
 * 
 * @param props - Configuration options
 * @returns Object with filtered items and searching state
 */
export function useWorkerSearch<T>(props: UseWorkerSearchProps<T>): UseWorkerSearchReturn<T> {
  const { items, query, fields, idKey = 'id' as keyof T } = props;
  const [filteredItems, setFilteredItems] = useState<T[]>(items);
  const [isSearching, setIsSearching] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const cancelTokenRef = useRef<number | null>(null);
  const prevItemsRef = useRef<T[]>(items);
  
  // Initialize Worker
  useEffect(() => {
    workerRef.current = SearchWorker.create();
    
    workerRef.current.onmessage = (e) => {
      const { results, requestId } = e.data;
      // Race Condition Protection: Only accept results matching the latest request ID
      if (requestId === requestIdRef.current && requestId === cancelTokenRef.current) {
          setFilteredItems(results);
          setIsSearching(false);
      }
    };

    return () => {
      workerRef.current?.terminate();
      if (cancelTokenRef.current !== null) {
        cancelTokenRef.current = null;
      }
    };
  }, []);

  // Use a stable key for fields to prevent effect loops with inline arrays
  const fieldsKey = JSON.stringify(fields);

  // Dispatch Data Update (Only when items/config change)
  useEffect(() => {
      if (!workerRef.current) return;
      
      // Check if items actually changed (deep equality check on array reference)
      const itemsChanged = prevItemsRef.current !== items;
      if (!itemsChanged) return;
      
      prevItemsRef.current = items;
      
      workerRef.current.postMessage({
          type: 'UPDATE',
          payload: {
              items,
              fields,
              idKey
          }
      });
      
      // If query is empty, reset display immediately
      // But ONLY if we haven't already done this for this items reference
      if (!query) {
          // Only update filteredItems once per items reference to prevent loops
          setFilteredItems(items);
      } else {
          // If data updated while searching, re-trigger search
          const currentRequestId = ++requestIdRef.current;
          cancelTokenRef.current = currentRequestId;
          setIsSearching(true);
          workerRef.current.postMessage({
              type: 'SEARCH',
              payload: {
                  query,
                  requestId: currentRequestId
              }
          });
      }
  // Intentionally only depend on data changes, not query/fields
  // Query changes are handled in separate effect below to avoid re-indexing on every keystroke
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Separated concerns: data updates vs query updates
  }, [items, fieldsKey, idKey]); 

  // Dispatch Search Task (Only when query changes) with cancellation
  useEffect(() => {
    if (!workerRef.current) return;

    // Cancel previous search
    if (cancelTokenRef.current !== null) {
      cancelTokenRef.current = null;
    }

    if (!query) {
        setFilteredItems(prev => prev === items ? prev : items);
        setIsSearching(false);
        return;
    }

    setIsSearching(true);
    const currentRequestId = ++requestIdRef.current;
    cancelTokenRef.current = currentRequestId;
    
    workerRef.current.postMessage({
        type: 'SEARCH',
        payload: {
            query,
            requestId: currentRequestId
        }
    });

  }, [query, items]); // Added 'items' to prevent stale data when query is empty

  return { filteredItems, isSearching };
};

