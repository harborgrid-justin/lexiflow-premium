/**
 * @module hooks/useWorkerSearch
 * @category Hooks - Search
 * @description Worker-based full-text search hook with race condition protection via request IDs. Manages
 * SearchWorker lifecycle, dispatches UPDATE (data change) and SEARCH (query change) messages, and filters
 * results by configured fields. Provides isSearching flag and filteredItems with non-blocking search
 * execution. Only accepts results matching latest requestId to prevent stale result display.
 * 
 * NO THEME USAGE: Search utility hook with Web Worker integration
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
interface UseWorkerSearchProps<T> {
  items: T[];
  query: string;
  fields?: (keyof T)[];
  idKey?: keyof T;
}

// ============================================================================
// HOOK
// ============================================================================
export const useWorkerSearch = <T>({ items, query, fields, idKey = 'id' as keyof T }: UseWorkerSearchProps<T>) => {
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

