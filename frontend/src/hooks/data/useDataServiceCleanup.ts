/**
 * useDataServiceCleanup Hook
 *
 * Ensures proper cleanup of DataService repositories and listeners
 * to prevent memory leaks. Use this at the root App component level.
 *
 * Features:
 * - Clears all repository listeners on unmount
 * - Clears singleton cache
 * - Optional periodic memory stats logging
 */

import { useEffect } from "react";

import { DATA_SERVICE_MEMORY_REFRESH_INTERVAL_MS } from "@/config/features/hooks.config";
import {
  cleanupDataService,
  logDataServiceMemory,
} from "@/services/data/data-service.service";

interface UseDataServiceCleanupOptions {
  /**
   * Enable periodic memory stats logging (default: false)
   * Useful for development/debugging
   */
  enableLogging?: boolean;

  /**
   * Logging interval in milliseconds (default: 120000 = 2 minutes)
   */
  loggingInterval?: number;
}

/**
 * Hook to manage DataService lifecycle and memory cleanup.
 *
 * @example
 * ```tsx
 * function App() {
 *   useDataServiceCleanup({ enableLogging: true });
 *   return <YourApp />;
 * }
 * ```
 */
export function useDataServiceCleanup(
  options: UseDataServiceCleanupOptions = {}
) {
  const { enableLogging = false, loggingInterval = 120000 } = options;

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Optional periodic logging for debugging
    if (enableLogging && process.env.NODE_ENV === "development") {
      console.log("[useDataServiceCleanup] Periodic memory logging enabled");
      logDataServiceMemory(); // Log immediately

      intervalId = setInterval(() => {
        logDataServiceMemory();
      }, loggingInterval);
    }

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }

      console.log("[useDataServiceCleanup] Cleaning up DataService...");
      cleanupDataService();
    };
  }, [enableLogging, loggingInterval]);
}

/**
 * Hook for components that need to track repository memory usage.
 * Returns current memory stats.
 *
 * @example
 * ```tsx
 * function DebugPanel() {
 *   const stats = useDataServiceMemoryStats();
 *   return <div>Repositories: {stats.repositoryCount}</div>;
 * }
 * ```
 */
export function useDataServiceMemoryStats(
  refreshInterval: number = DATA_SERVICE_MEMORY_REFRESH_INTERVAL_MS
) {
  const [stats, setStats] = React.useState(() => ({
    repositoryCount: 0,
    totalListeners: 0,
    refactoredSingletons: 0,
    legacyRepositories: 0,
    totalRepositories: 0,
    estimatedMemoryKB: 0,
    repositories: [] as Array<{ name: string; listeners: number }>,
    refactoredKeys: [] as string[],
  }));

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    // Dynamically import to avoid circular dependency
    import("@/services/data/dataService").then(
      ({ getDataServiceMemoryStats }) => {
        const updateStats = () => {
          const memStats = getDataServiceMemoryStats() as {
            repositoryCount?: number;
            totalListeners: number;
            refactoredSingletons: number;
            legacyRepositories: number;
            totalRepositories: number;
            estimatedMemoryKB?: number;
            repositories?: Array<{ name: string; listeners: number }>;
            refactoredKeys: string[];
          };
          setStats({
            repositoryCount: memStats.repositoryCount || 0,
            totalListeners: memStats.totalListeners || 0,
            refactoredSingletons: memStats.refactoredSingletons || 0,
            legacyRepositories: memStats.legacyRepositories || 0,
            totalRepositories: memStats.totalRepositories || 0,
            estimatedMemoryKB: memStats.estimatedMemoryKB || 0,
            repositories: memStats.repositories || [],
            refactoredKeys: memStats.refactoredKeys || [],
          });
        };
        updateStats(); // Initial load

        intervalId = setInterval(updateStats, refreshInterval);
      }
    );

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval]);

  return stats;
}

// Need React import for useDataServiceMemoryStats
import * as React from "react";
