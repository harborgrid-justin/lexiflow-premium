/**
 * Query Client Provider for Next.js
 *
 * Provides TanStack Query client context to the application.
 * This wraps the entire app with React Query provider for data fetching and caching.
 *
 * @module providers/QueryClientProvider
 */

'use client';

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * Query Client Provider Component
 *
 * Creates and provides a TanStack Query client instance for the application.
 * Uses client-side state to ensure a single instance per user session.
 */
export function QueryClientProvider({ children }: { children: ReactNode }) {
  // Create a stable QueryClient instance for the session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}
