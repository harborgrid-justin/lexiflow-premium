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

import { useEffect } from 'react';
import { cleanupDataService, logDataServiceMemory } from '../services/data/dataService';

interface UseDataServiceCleanupOptions {
  /**
   * Enable periodic memory stats logging (default: false)
   * Useful for development/debugging
   */
  enableLogging?: boolean;
  
  /**
   * Logging interval in milliseconds (default: 60000 = 1 minute)
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
export function useDataServiceCleanup(options: UseDataServiceCleanupOptions = {}) {
  const { enableLogging = false, loggingInterval = 60000 } = options;

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Optional periodic logging for debugging
    if (enableLogging && process.env.NODE_ENV === 'development') {
      console.log('[useDataServiceCleanup] Periodic memory logging enabled');
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
      
      console.log('[useDataServiceCleanup] Cleaning up DataService...');
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
export function useDataServiceMemoryStats(refreshInterval: number = 5000) {
  const [stats, setStats] = React.useState(() => ({
    repositoryCount: 0,
    totalListeners: 0,
    singletonCount: 0,
    repositories: [] as Array<{ name: string; listeners: number }>,
  }));

  React.useEffect(() => {
    // Dynamically import to avoid circular dependency
    import('../services/dataService').then(({ getDataServiceMemoryStats }) => {
      const updateStats = () => setStats(getDataServiceMemoryStats());
      updateStats(); // Initial load
      
      const intervalId = setInterval(updateStats, refreshInterval);
      return () => clearInterval(intervalId);
    });
  }, [refreshInterval]);

  return stats;
}

// Need React import for useDataServiceMemoryStats
import * as React from 'react';

