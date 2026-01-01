/**
 * Hook for managing data source connections
 * Provides CRUD operations and query state for data source connections.
 */

import { useQuery, useMutation, queryClient } from '@/hooks/backend';
import { DataService } from '@/services/data/dataService';
import type { DataSourceConnection, ConnectionTestResult } from '../types';

export function useDataSourceConnections() {
  const { data: connections = [], isLoading, refetch } = useQuery<DataSourceConnection[]>(
    ['admin', 'sources', 'connections'],
    DataService.sources.getConnections,
    { staleTime: 0, refetchOnWindowFocus: false }
  );

  const addConnectionMutation = useMutation(DataService.sources.addConnection, {
    onSuccess: (newConnection: DataSourceConnection) => {
      queryClient.setQueryData(
        ['admin', 'sources', 'connections'],
        (old: DataSourceConnection[] | undefined) => [...(old || []), newConnection]
      );
    },
  });

  const syncMutation = useMutation(DataService.sources.syncConnection, {
    onMutate: async (id: string) => {
      const previous = queryClient.getQueryState(['admin', 'sources', 'connections'])?.data;
      queryClient.setQueryData<DataSourceConnection[]>(
        ['admin', 'sources', 'connections'],
        (old) => old?.map((c) => (c.id === id ? { ...c, status: 'syncing' as const } : c)) || []
      );
      return { previous };
    },
    onSuccess: (_data, id: string) => {
      setTimeout(() => {
        queryClient.setQueryData<DataSourceConnection[]>(
          ['admin', 'sources', 'connections'],
          (old) => old?.map((c) => (c.id === id ? { ...c, status: 'active' as const, lastSync: 'Just now' } : c)) || []
        );
      }, 2000);
    },
  });

  const deleteMutation = useMutation(DataService.sources.deleteConnection, {
    onSuccess: (_result, id: string) => {
      queryClient.setQueryData<DataSourceConnection[]>(['admin', 'sources', 'connections'], (old) => old?.filter((c) => c.id !== id) || []);
    },
  });

  const testMutation = useMutation(DataService.sources.testConnection, {
    onSuccess: (result: ConnectionTestResult) => {
      if (result.success) alert('Connection test successful!');
      else alert('Connection test failed: ' + result.message);
    },
    onError: (error: unknown) => {
      alert('Connection test error: ' + (error instanceof Error ? error.message : String(error)));
    },
  });

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
