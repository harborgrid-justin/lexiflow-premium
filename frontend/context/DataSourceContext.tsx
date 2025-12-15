import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { queryClient } from '../services/queryClient';

export type DataSourceType = 'indexeddb' | 'postgresql' | 'cloud';

interface DataSourceContextValue {
  currentSource: DataSourceType;
  switchDataSource: (source: DataSourceType) => Promise<void>;
  isBackendApiEnabled: boolean;
}

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined);

interface DataSourceProviderProps {
  children: ReactNode;
}

export const DataSourceProvider: React.FC<DataSourceProviderProps> = ({ children }) => {
  const [currentSource, setCurrentSource] = useState<DataSourceType>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const storedValue = localStorage.getItem('VITE_USE_BACKEND_API');
      if (storedValue === 'true') return 'postgresql';
    }
    return 'indexeddb';
  });

  const [isBackendApiEnabled, setIsBackendApiEnabled] = useState(currentSource !== 'indexeddb');

  const switchDataSource = async (source: DataSourceType): Promise<void> => {
    console.log(`[DataSource] Switching from ${currentSource} to ${source}`);
    
    // Update localStorage flag
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const useBackend = source === 'postgresql' || source === 'cloud';
      localStorage.setItem('VITE_USE_BACKEND_API', String(useBackend));
      setIsBackendApiEnabled(useBackend);
    }

    // Clear ALL cached queries by invalidating all keys
    // This forces refetch on next render
    queryClient.invalidate('');
    
    // Update state
    setCurrentSource(source);
    
    // Force a full page reload to reinitialize all services with new data source
    console.log('[DataSource] Reloading application...');
    window.location.reload();
  };

  useEffect(() => {
    console.log(`[DataSource] Current data source: ${currentSource}`);
  }, [currentSource]);

  return (
    <DataSourceContext.Provider value={{ currentSource, switchDataSource, isBackendApiEnabled }}>
      {children}
    </DataSourceContext.Provider>
  );
};

export const useDataSource = (): DataSourceContextValue => {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
};
