/**
 * Query Client Provider for React Router v7
 *
 * Provides query client context to the application.
 * This is a simple passthrough provider since the custom QueryClient
 * implementation uses a singleton pattern.
 *
 * @module providers/QueryClientProvider
 */

import { ReactNode } from 'react';

/**
 * Query Client Provider Component
 *
 * The underlying queryClient is a singleton exported from
 * @/services/infrastructure/queryClient, so no context is needed.
 * This provider exists for future extensibility and API consistency.
 */
export function QueryClientProvider({ children }: { children: ReactNode }) {
  // The custom queryClient is a singleton, so no provider context needed
  // This wrapper exists for API consistency and future extensibility
  return <>{children}</>;
}
