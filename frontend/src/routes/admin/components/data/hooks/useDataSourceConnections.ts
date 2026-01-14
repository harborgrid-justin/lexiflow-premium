/**
 * Hook for managing data source connections
 * Provides CRUD operations and query state for data source connections.
 */

import { useQuery, useMutation, queryClient } from "@/hooks/backend";
import { DataService } from "@/services/data/dataService";
import { DataSource } from "@/api/data-platform/data-sources-api";
import type {
  DataSourceConnection,
  // ConnectionTestResult,
  ConnectionStatus,
} from "../types";

const toDataSourceConnection = (ds: DataSource): DataSourceConnection => ({
  id: ds.id,
  name: ds.name,
  type: (ds.metadata as Record<string, unknown>)?.providerName as string || ds.type,
  region:
    (ds.metadata as Record<string, unknown>)?.region as string || (ds.config as Record<string, unknown>)?.region as string || "us-east-1",
  status: (ds.status as ConnectionStatus) || "disconnected",
  lastSync: ds.config?.lastSync || null,
  host: ds.config?.url,
  providerId: (ds.metadata as Record<string, unknown>)?.providerId as string,
});

export function useDataSourceConnections() {
  const {
    data: connections = [],
    isLoading,
    refetch,
  } = useQuery<DataSourceConnection[]>(
    ["admin", "sources", "connections"],
    async () => {
      const data = await DataService.dataSources.getAll(); // Corrected method
      return data.map(toDataSourceConnection);
    },
    { staleTime: 0, refetchOnWindowFocus: false }
  );

  const addConnectionMutation = useMutation(
    async (data: {
      name: string;
      host: string;
      region: string;
      providerId?: string;
      type?: string;
    }) => {
      const payload: Partial<DataSource> = {
        name: data.name,
        type: "database",
        status: "active",
        config: {
          url: data.host,
        },
        metadata: {
          region: data.region,
          providerId: data.providerId,
          providerName: data.type,
        },
      };
      const result = await DataService.dataSources.create(payload); // Corrected
      return toDataSourceConnection(result);
    },
    {
      onSuccess: (newConnection: DataSourceConnection) => {
        queryClient.setQueryData(
          ["admin", "sources", "connections"],
          (old: DataSourceConnection[] | undefined) => [
            ...(old || []),
            newConnection,
          ]
        );
      },
    }
  );

  const syncMutation = useMutation(
    (id: string) => DataService.dataSources.sync(id), // Corrected
    {
      onMutate: async (id: string) => {
        const previous = queryClient.getQueryState([
          "admin",
          "sources",
          "connections",
        ])?.data;
        queryClient.setQueryData<DataSourceConnection[]>(
          ["admin", "sources", "connections"],
          (old) =>
            old?.map((c) =>
              c.id === id ? { ...c, status: "syncing" as const } : c
            ) || []
        );
        return { previous };
      },
      onSuccess: (_data, id: string) => {
        setTimeout(() => {
          queryClient.setQueryData<DataSourceConnection[]>(
            ["admin", "sources", "connections"],
            (old) =>
              old?.map((c) =>
                c.id === id
                  ? { ...c, status: "active" as const, lastSync: "Just now" }
                  : c
              ) || []
          );
        }, 2000);
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => DataService.dataSources.delete(id), // Corrected
    {
      onSuccess: (_result, id: string) => {
        queryClient.setQueryData<DataSourceConnection[]>(
          ["admin", "sources", "connections"],
          (old) => old?.filter((c) => c.id !== id) || []
        );
      },
    }
  );

  const testMutation = useMutation(
    (id: string) => DataService.dataSources.test(id), // Corrected
    {
      onSuccess: (result: { success: boolean; message?: string }) => {
        if (result.success) alert("Connection test successful!");
        else alert("Connection test failed: " + result.message);
      },
      onError: (error: unknown) => {
        alert(
          "Connection test error: " +
            (error instanceof Error ? error.message : String(error))
        );
      },
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
