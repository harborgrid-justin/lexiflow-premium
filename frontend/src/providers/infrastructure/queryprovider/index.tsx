/**
 * ================================================================================
 * QUERY CLIENT PROVIDER - INFRASTRUCTURE LAYER
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Custom Query Implementation
 *
 * RESPONSIBILITIES:
 * • Query client context for data fetching
 * • Singleton pattern for global query state
 * • Server-state synchronization
 * • Cache management
 * • Request deduplication
 *
 * REACT 18 PATTERNS:
 * ✓ Singleton queryClient (services/queryClient.ts)
 * ✓ No context needed (direct import pattern)
 * ✓ Suspense-compatible
 * ✓ Concurrent rendering safe
 * ✓ StrictMode compatible
 *
 * RULES:
 * • Must NOT depend on Application or Domain layers
 * • Provides data fetching infrastructure
 * • No business logic
 *
 * DATA FLOW:
 * SERVER → QUERY CLIENT → HOOKS → COMPONENTS
 *
 * @module providers/infrastructure/queryprovider
 */

import { type ReactNode } from 'react';

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
