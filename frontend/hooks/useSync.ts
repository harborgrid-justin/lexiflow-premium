import { useContext } from 'react';
import { SyncContext, SyncContextType } from '../context/SyncContext';

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within a SyncProvider');
  return context;
};
