import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Data Source Context
 * Handles switching between local (IndexedDB) and remote (PostgreSQL/Cloud) sources.
 */

export type DataSourceType = 'indexeddb' | 'postgresql' | 'cloud';

export interface DataSourceContextValue {
  currentSource: DataSourceType;
  switchDataSource: (source: DataSourceType) => void; // Changed to sync as reload is terminal
  isBackendApiEnabled: boolean;
}

// --- Internal Helpers (Kept outside to avoid closures/circularity) ---

const STORAGE_KEY = 'VITE_USE_BACKEND_API';

function getInitialDataSource(): DataSourceType {
  // 1. Check localStorage first (user preference)
  if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) {
    return localStorage.getItem(STORAGE_KEY) === 'true' ? 'postgresql' : 'indexeddb';
  }
  
  // 2. Fallback to Environment Variable
  const envValue = import.meta.env.VITE_USE_BACKEND_API;
  return (envValue === 'true' || envValue === true) ? 'postgresql' : 'indexeddb';
}

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined);

interface DataSourceProviderProps {
  children: ReactNode;
}

export const DataSourceProvider: React.FC<DataSourceProviderProps> = ({ children }) => {
  const [currentSource, setCurrentSource] = useState<DataSourceType>(getInitialDataSource);

  // Derived state: boolean check for backend
  const isBackendApiEnabled = currentSource !== 'indexeddb';

  /**
   * switchDataSource
   * Updates storage and performs a hard reload to reset the service registry
   */
  const switchDataSource = (source: DataSourceType) => {
    if (source === currentSource) return;

    console.log(`[DataSource] Switching to ${source}...`);
    
    // Update storage so the next load picks up the right source
    if (typeof window !== 'undefined') {
      const useBackend = source !== 'indexeddb';
      localStorage.setItem(STORAGE_KEY, String(useBackend));
      
      // We do NOT call queryClient here. 
      // The reload ensures a clean slate for all singleton services.
      window.location.reload();
    }

    setCurrentSource(source);
  };

  useEffect(() => {
    console.log(`[DataSource] Context initialized with: ${currentSource}`);
  }, [currentSource]);

  return (
    <DataSourceContext.Provider 
      value={{ 
        currentSource, 
        switchDataSource, 
        isBackendApiEnabled 
      }}
    >
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