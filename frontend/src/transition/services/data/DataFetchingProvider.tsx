/**
 * DataFetchingProvider - Query client for data fetching
 * Wrapper around TanStack Query or similar
 */

import { createContext, useContext, type ReactNode } from 'react';
import { queryClient } from './client/queryClient';

interface DataFetchingContextValue {
  queryClient: typeof queryClient;
}

const DataFetchingContext = createContext<DataFetchingContextValue | null>(null);

export function useDataFetching() {
  const context = useContext(DataFetchingContext);
  if (!context) {
    throw new Error('useDataFetching must be used within DataFetchingProvider');
  }
  return context;
}

interface DataFetchingProviderProps {
  children: ReactNode;
}

export function DataFetchingProvider({ children }: DataFetchingProviderProps) {
  const value: DataFetchingContextValue = {
    queryClient,
  };

  return (
    <DataFetchingContext.Provider value={value}>
      {children}
    </DataFetchingContext.Provider>
  );
}
