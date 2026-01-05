
import { useContext, useSyncExternalStore } from 'react';
import { store, ActionContext, DataState } from '../components/providers/DataProvider.tsx';

/**
 * useData Hook (React 18 Architecture)
 * 
 * Uses useSyncExternalStore to subscribe to the external EnterpriseStore.
 */
export function useData<T>(selector: (state: DataState) => T): T {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return selector(state);
}

/**
 * useActions Hook
 */
export const useActions = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useActions must be used within a DataProvider.');
  }
  return context;
};
