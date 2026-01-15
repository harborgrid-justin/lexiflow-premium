/**
 * ================================================================================
 * QUERY CLIENT PROVIDER - INFRASTRUCTURE LAYER (Standalone)
 * ================================================================================
 *
 * ENTERPRISE LAYERING: INFRASTRUCTURE LAYER
 *
 * RESPONSIBILITIES:
 * - Query client context for data fetching
 * - Singleton pattern for global query state
 * - Server-state synchronization
 *
 * RULES:
 * - Must NOT depend on Application or Domain layers
 * - Provides data fetching infrastructure
 * - No business logic
 *
 * DATA FLOW:
 * QUERY CLIENT → HOOKS → COMPONENTS
 *
 * @module providers/infrastructure/queryprovider
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
