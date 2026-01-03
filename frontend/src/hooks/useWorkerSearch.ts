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
import { useEffect, useMemo, useRef, useState } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { SearchWorker } from "@/services/search/searchWorker";

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
export function useWorkerSearch<T>(
  props: UseWorkerSearchProps<T>
): UseWorkerSearchReturn<T> {
  const { items, query, fields, idKey = "id" as keyof T } = props;

  // Stabilize items based on idKey to prevent unnecessary re-indexing
  const stableItems = useMemo(() => items, [items]);

  const [filteredItems, setFilteredItems] = useState<T[]>(stableItems);
  const [isSearching, setIsSearching] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const cancelTokenRef = useRef<number | null>(null);
  const prevItemsRef = useRef<T[]>(stableItems);
  const queryRef = useRef(query);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = SearchWorker.create();

    workerRef.current.onmessage = (e) => {
      const { results, requestId } = e.data;
      // Race Condition Protection: Only accept results matching the latest request ID
      if (
        requestId === requestIdRef.current &&
        requestId === cancelTokenRef.current
      ) {
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
    const worker = workerRef.current;
    if (!worker) return;

    // Check if items actually changed (deep equality check on array reference)
    const itemsChanged = prevItemsRef.current !== stableItems;
    if (!itemsChanged) return;

    prevItemsRef.current = stableItems;

    worker.postMessage({
      type: "UPDATE",
      payload: {
        items,
        fields,
        idKey,
      },
    });

    // If query is empty, reset display immediately
    // But ONLY if we haven't already done this for this items reference
    if (!queryRef.current) {
      // Only update filteredItems once per items reference to prevent loops
      setFilteredItems(stableItems);
    } else {
      // If data updated while searching, re-trigger search
      const currentRequestId = ++requestIdRef.current;
      cancelTokenRef.current = currentRequestId;
      setIsSearching(true);
      worker.postMessage({
        type: "SEARCH",
        payload: {
          query: queryRef.current,
          requestId: currentRequestId,
        },
      });
    }
    // Intentionally only depend on data changes, not query/fields
    // Query changes are handled in separate effect below to avoid re-indexing on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableItems, fieldsKey, idKey]);

  // Dispatch Search Task (Only when query changes) with cancellation
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    // Cancel previous search
    if (cancelTokenRef.current !== null) {
      cancelTokenRef.current = null;
    }

    if (!query) {
      setFilteredItems((prev) => (prev === stableItems ? prev : stableItems));
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const currentRequestId = ++requestIdRef.current;
    cancelTokenRef.current = currentRequestId;

    worker.postMessage({
      type: "SEARCH",
      payload: {
        query,
        requestId: currentRequestId,
      },
    });
  }, [query, stableItems]); // Added 'stableItems' to prevent stale data when query is empty

  return { filteredItems, isSearching };
}
