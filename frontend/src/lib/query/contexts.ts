/**
 * Query Client Contexts
 *
 * React contexts for query client.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/query/contexts
 */

import { createContext } from "react";

/**
 * Query Client Context
 *
 * Note: The custom queryClient is a singleton, so no context is actually needed.
 * This exists for API consistency and future extensibility.
 */
export const QueryClientContext = createContext<unknown>(undefined);

QueryClientContext.displayName = "QueryClientContext";
