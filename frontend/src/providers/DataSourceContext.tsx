import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isBackendApiEnabled as checkBackendEnabled } from '../services/integration/apiConfig';

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

const STORAGE_KEY = 'VITE_USE_INDEXEDDB';

function getInitialDataSource(): DataSourceType {
  // Use the centralized apiConfig detection logic
  return checkBackendEnabled() ? 'postgresql' : 'indexeddb';
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
      // Use VITE_USE_INDEXEDDB for consistency with apiConfig.ts
      if (source === 'indexeddb') {
        localStorage.setItem('VITE_USE_INDEXEDDB', 'true');
      } else {
        localStorage.removeItem('VITE_USE_INDEXEDDB');
      }
      
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
