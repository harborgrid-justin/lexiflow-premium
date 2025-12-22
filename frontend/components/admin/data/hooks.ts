/**
 * Custom hooks for Data Sources Management
 * 
 * Encapsulates state management and side effects for data source operations.
 * Separates data access from UI rendering concerns.
 */

import { useState } from 'react';
import { useQuery, useMutation, queryClient } from '../../../hooks/useQueryHooks';
import { DataService } from '../../../services/data/dataService';
import type { 
  DataSourceConnection, 
  ConnectionFormData, 
  ConnectionTestResult 
} from './types';
import { DEFAULT_CONNECTION_FORM } from './constants';

/**
 * Hook for managing data source connections
 * 
 * Provides CRUD operations and query state for data source connections.
 * Handles optimistic updates and cache invalidation.
 */
export function useDataSourceConnections() {
  // Query for fetching all connections
  const { 
    data: connections = [], 
    isLoading, 
    refetch 
  } = useQuery<DataSourceConnection[]>(
    ['admin', 'sources', 'connections'],
    DataService.sources.getConnections,
    {
      staleTime: 0,
      refetchOnWindowFocus: false,
    }
  );

  // Mutation for adding new connection
  const addConnectionMutation = useMutation(
    DataService.sources.addConnection,
    {
      onSuccess: (newConnection: DataSourceConnection) => {
        queryClient.setQueryData(
          ['admin', 'sources', 'connections'], 
          (old: DataSourceConnection[] | undefined) => [...(old || []), newConnection]
        );
      }
    }
  );

  // Mutation for syncing a connection
  const syncMutation = useMutation(
    DataService.sources.syncConnection, 
    {
      onMutate: async (id: string) => {
        const previous = queryClient.getQueryState(['admin', 'sources', 'connections'])?.data;
        
        // Optimistic update: set status to 'syncing'
        queryClient.setQueryData<DataSourceConnection[]>(
          ['admin', 'sources', 'connections'], 
          (old) => 
            old?.map(c => c.id === id ? { ...c, status: 'syncing' as const } : c) || []
        );
        
        return { previous };
      },
      onSuccess: (_data, id: string) => {
        // Simulate sync completion after 2 seconds
        setTimeout(() => {
          queryClient.setQueryData<DataSourceConnection[]>(
            ['admin', 'sources', 'connections'], 
            (old) => 
              old?.map(c => c.id === id ? { ...c, status: 'active' as const, lastSync: 'Just now' } : c) || []
          );
        }, 2000);
      }
    }
  );

  // Mutation for deleting a connection
  const deleteMutation = useMutation(
    DataService.sources.deleteConnection, 
    {
      onSuccess: (_result, id: string) => {
        queryClient.setQueryData<DataSourceConnection[]>(
          ['admin', 'sources', 'connections'], 
          (old) => old?.filter(c => c.id !== id) || []
        );
      }
    }
  );

  // Mutation for testing a connection
  const testMutation = useMutation(
    DataService.sources.testConnection, 
    {
      onSuccess: (result: ConnectionTestResult) => {
        if (result.success) {
          alert('Connection test successful!');
        } else {
          alert('Connection test failed: ' + result.message);
        }
      },
      onError: (error: unknown) => {
        alert('Connection test error: ' + error.message);
      }
    }
  );

  return {
    connections,
    isLoading,
    refetch,
    addConnection: addConnectionMutation.mutate,
    syncConnection: syncMutation.mutate,
    deleteConnection: deleteMutation.mutate,
    testConnection: testMutation.mutate,
    isAdding: addConnectionMutation.isLoading,
    isSyncing: syncMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isTesting: testMutation.isLoading,
  };
}

/**
 * Hook for managing connection form state
 * 
 * Encapsulates form state and validation for creating new connections.
 */
export function useConnectionForm() {
  const [formData, setFormData] = useState<ConnectionFormData>(DEFAULT_CONNECTION_FORM);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const resetForm = () => {
    setFormData(DEFAULT_CONNECTION_FORM);
    setSelectedProvider(null);
    setIsAdding(false);
  };

  const updateField = <K extends keyof ConnectionFormData>(
    field: K, 
    value: ConnectionFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    selectedProvider,
    isAdding,
    setFormData,
    setSelectedProvider,
    setIsAdding,
    resetForm,
    updateField,
  };
}

/**
 * Hook for managing local storage data
 * 
 * Provides access to browser localStorage items with reactive updates.
 */
export function useLocalStorageFiles() {
  const [files, setFiles] = useState<Array<{ name: string; size: string; modified: string }>>([]);

  const loadFiles = () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = (new Blob([value]).size / 1024).toFixed(2) + ' KB';
        items.push({ name: key, size: size, modified: 'Unknown' });
      }
    }
    setFiles(items);
  };

  const clearCache = () => {
    if (confirm('Are you sure you want to clear all local storage? This will reset your preferences.')) {
      localStorage.clear();
      setFiles([]);
    }
  };

  const deleteItem = (key: string) => {
    localStorage.removeItem(key);
    setFiles(prev => prev.filter(f => f.name !== key));
  };

  return {
    files,
    loadFiles,
    clearCache,
    deleteItem,
  };
}
