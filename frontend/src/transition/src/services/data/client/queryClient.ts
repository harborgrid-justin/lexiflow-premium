/**
 * Query client - Configuration for TanStack Query
 * 
 * Configures the global query client with default policies for:
 * - Stale time (freshness)
 * - Cache time (garbage collection)
 * - Retries (resilience)
 * - Network mode (offline behavior)
 * 
 * @module services/data/client/queryClient
 */

import { QueryClient } from '@tanstack/react-query';

// Default stale time: 0 (always fetch fresh data unless configured otherwise)
// Default GC time: 5 minutes
const DEFAULT_STALE_TIME = 0;
const DEFAULT_GC_TIME = 5 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      retry: 1,
      refetchOnWindowFocus: false, // Prevent excessive refetches during dev
      networkMode: 'always', // Assist with development inside containers
    },
    mutations: {
      retry: 0,
      networkMode: 'always',
    },
  },
});
