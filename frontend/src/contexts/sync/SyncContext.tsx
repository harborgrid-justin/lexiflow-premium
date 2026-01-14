/**
 * @module contexts/sync/SyncContext
 * @description Synchronization context for managing data sync between client and server
 */

import { createContext, useContext } from 'react';
import type { SyncContextValue } from './SyncContext.types';

export const SyncContext = createContext<SyncContextValue | null>(null);

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within SyncProvider');
  }
  return context;
}
