/**
 * @module hooks/useGlobalQueryStatus
 * @category Hooks - Data Management
 *
 * Tracks global query fetching status for loading indicators.
 * Subscribes to QueryClient updates.
 *
 * @example
 * ```typescript
 * const { isFetching } = useGlobalQueryStatus();
 *
 * {isFetching && <GlobalLoadingSpinner />}
 * ```
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useEffect, useState } from "react";

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Services & Data - Direct import to avoid circular dependency
import { queryClient } from "@/services/infrastructure/query-client.service";

// ========================================
// TYPES
// ========================================

/**
 * Return type for useGlobalQueryStatus hook
 */
export interface UseGlobalQueryStatusReturn {
  /** Whether any queries are currently fetching */
  isFetching: boolean;
}

// ========================================
// HOOK
// ========================================

/**
 * Tracks global query fetching status.
 *
 * @returns Object with isFetching flag
 */
export function useGlobalQueryStatus(): UseGlobalQueryStatusReturn {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const unsubscribe = queryClient.subscribeToGlobalUpdates((status) => {
      setIsFetching(status.isFetching > 0);
    });

    return () => unsubscribe();
  }, []);

  return { isFetching };
}
