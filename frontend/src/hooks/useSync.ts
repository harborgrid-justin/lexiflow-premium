import { useContext } from 'react';
import { SyncContext, SyncContextType } from '@/providers';

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within a SyncProvider');
  return context;
};
