/**
 * useInfiniteScroll Hook
 * Implements infinite scroll with intersection observer
 */

import { useEffect, useRef, useCallback, useState } from 'react';

export interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  hasMore?: boolean;
  initialLoad?: boolean;
}

export interface UseInfiniteScrollResult {
  ref: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

/**
 * Hook for infinite scroll implementation
 *
 * @param onLoadMore - Callback to load more items
 * @param options - Intersection observer options
 *
 * @example
 * const { ref, isLoading } = useInfiniteScroll(
 *   async () => {
 *     const newItems = await fetchMoreItems(page);
 *     setItems(prev => [...prev, ...newItems]);
 *     setPage(prev => prev + 1);
 *   },
 *   { hasMore: hasMoreItems }
 * );
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={ref}>{isLoading && 'Loading...'}</div>
 *   </div>
 * );
 */
export function useInfiniteScroll(
  onLoadMore: () => Promise<void> | void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollResult {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
    hasMore = true,
    initialLoad = false,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);
  const isLoadingRef = useRef(false);

  // Keep the loadMore callback up to date
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Load more handler
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !enabled) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      await loadMoreRef.current();
    } catch (error) {
      console.error('[useInfiniteScroll] Error loading more:', error);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, enabled]);

  // Setup intersection observer
  useEffect(() => {
    if (!enabled || !hasMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Start observing
    observerRef.current.observe(sentinel);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, threshold, rootMargin, loadMore]);

  // Initial load
  useEffect(() => {
    if (initialLoad && enabled && hasMore && !isLoadingRef.current) {
      loadMore();
    }
  }, [initialLoad, enabled, hasMore, loadMore]);

  // Reset function
  const reset = useCallback(() => {
    isLoadingRef.current = false;
    setIsLoading(false);
  }, []);

  return {
    ref: sentinelRef,
    isLoading,
    setIsLoading,
    reset,
  };
}

/**
 * Hook for scroll-based pagination (alternative to intersection observer)
 *
 * @example
 * const { onScroll, isLoading } = useScrollPagination(
 *   async () => {
 *     const newItems = await fetchMoreItems(page);
 *     setItems(prev => [...prev, ...newItems]);
 *     setPage(prev => prev + 1);
 *   },
 *   { hasMore: hasMoreItems, threshold: 0.8 }
 * );
 *
 * return (
 *   <div onScroll={onScroll} style={{ height: '100vh', overflow: 'auto' }}>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     {isLoading && <div>Loading...</div>}
 *   </div>
 * );
 */
export function useScrollPagination(
  onLoadMore: () => Promise<void> | void,
  options: {
    threshold?: number;
    enabled?: boolean;
    hasMore?: boolean;
  } = {}
) {
  const { threshold = 0.8, enabled = true, hasMore = true } = options;

  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const loadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const onScroll = useCallback(
    async (event: React.UIEvent<HTMLElement>) => {
      if (isLoadingRef.current || !hasMore || !enabled) {
        return;
      }

      const target = event.currentTarget;
      const scrollHeight = target.scrollHeight;
      const scrollTop = target.scrollTop;
      const clientHeight = target.clientHeight;

      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage >= threshold) {
        isLoadingRef.current = true;
        setIsLoading(true);

        try {
          await loadMoreRef.current();
        } catch (error) {
          console.error('[useScrollPagination] Error loading more:', error);
        } finally {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [hasMore, enabled, threshold]
  );

  return {
    onScroll,
    isLoading,
    setIsLoading,
  };
}

export default useInfiniteScroll;
