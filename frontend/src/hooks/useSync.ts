/**
 * @module hooks/useSync
 * @category Hooks - Data Synchronization
 *
 * Accesses SyncContext for optimistic UI updates and background sync.
 * Must be used within SyncProvider.
 *
 * @example
 * ```typescript
 * const { performMutation } = useSync();
 *
 * const handleSave = () => {
 *   performMutation('BILLING_LOG', newEntry, () =>
 *     DataService.billing.addTimeEntry(newEntry)
 *   );
 * };
 * ```
 */

import { SyncContext, SyncContextType } from "@/contexts/sync/SyncContext";
import { useContext } from "react";

/**
 * Accesses synchronization context.
 *
 * @returns SyncContextType with performMutation method
 * @throws Error if used outside SyncProvider
 */
export function useSync(): SyncContextType {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync must be used within a SyncProvider");
  return context;
}
