import { DataSource } from '@/lib/frontend-api';
import { useTheme } from '@/theme';
import { queryClient, useMutation, useQuery } from '@/hooks/backend';
import { useNotify } from '@/hooks/core';
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/shared/lib/cn';
import { AnimatePresence } from 'framer-motion';
import { Database, Plus, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionForm } from './ConnectionForm';
import type { ConnectionFormData, ConnectionStatus, DataConnection } from './types';

interface SyncConnectionResult {
  recordsSynced: number;
}

interface ConnectionPayload {
  name: string;
  host: string;
  region: string;
  providerId?: string;
  type?: string;
}

const PROVIDERS = [
  { id: 'snowflake', name: 'Snowflake' },
  { id: 'postgres', name: 'PostgreSQL' },
  { id: 'mongo', name: 'MongoDB' },
  { id: 's3', name: 'Amazon S3' },
];

const toDataConnection = (ds: DataSource): DataConnection => ({
  id: ds.id,
  name: ds.name,
  type: (ds.metadata as Record<string, unknown>)?.providerName as string || ds.type,
  region: (ds.metadata as Record<string, unknown>)?.region as string || (ds.config as Record<string, unknown>)?.region as string || 'us-east-1',
  status: (ds.status as ConnectionStatus) || 'disconnected',
  lastSync: ds.config?.lastSync,
});

export function CloudDatabaseContent() {
  const { theme } = useTheme();
  const notify = useNotify();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>({
    name: '',
    host: '',
    region: 'us-east-1'
  });

  const { data: connections = [], isLoading, refetch } = useQuery<DataConnection[]>(
    ['admin', 'sources', 'connections'],
    async () => {
      const data = await DataService.dataSources.getAll();
      return data.map(toDataConnection);
    },
    {
      staleTime: 0,
      refetchOnWindowFocus: false,
    }
  );

  // Concurrent-safe: Functional state updates in cache (Principle #5)
  const addConnectionMutation = useMutation(
    async (data: ConnectionPayload) => {
      const payload: Partial<DataSource> = {
        name: data.name,
        type: 'database',
        status: 'active',
        config: {
          url: data.host,
        },
        metadata: {
          region: data.region,
          providerId: data.providerId,
          providerName: data.type
        }
      };
      const result = await DataService.dataSources.create(payload);
      return toDataConnection(result);
    },
    {
      onSuccess: (newConnection: DataConnection) => {
        // Functional update prevents stale closures
        queryClient.setQueryData(['admin', 'sources', 'connections'],
          (old: DataConnection[] | undefined) => [...(old || []), newConnection]
        );
        setIsAdding(false);
        setSelectedProvider(null);
        setFormData({ name: '', host: '', region: 'us-east-1' });
      }
    }
  );

  // Concurrent-safe: Optimistic updates with functional state (Principle #5)
  const syncMutation = useMutation(
    (id: string) => DataService.dataSources.sync(id),
    {
      onMutate: (id: string) => {
        // Functional update ensures we work with latest state
        queryClient.setQueryData<DataConnection[]>(
          ['admin', 'sources', 'connections'],
          (old) => old ? old.map(c => c.id === id ? { ...c, status: 'syncing' as ConnectionStatus } : c) : []
        );
      },
      onSuccess: (data: unknown, id: string) => {
        setTimeout(() => {
          queryClient.setQueryData<DataConnection[]>(
            ['admin', 'sources', 'connections'],
            (old) => old ? old.map(c => c.id === id ? { ...c, status: 'active' as ConnectionStatus, lastSync: 'Just now' } : c) : []
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (data && typeof data === 'object' && 'jobId' in (data as any)) {
            // Adapted notification message since sync return type changed
            notify.success(`Sync job started successfully`);
          } else if (data && typeof data === 'object' && 'recordsSynced' in data) {
            notify.success(`Synced ${(data as SyncConnectionResult).recordsSynced} records successfully`);
          }
        }, 2000);
      }
    });

  // Concurrent-safe: Functional filter for deletions (Principle #5)
  const deleteMutation = useMutation(
    (id: string) => DataService.dataSources.delete(id),
    {
      onSuccess: (_: unknown, id: string) => {
        // Functional update prevents race conditions
        queryClient.setQueryData<DataConnection[]>(
          ['admin', 'sources', 'connections'],
          (old) => old ? old.filter(c => c.id !== id) : []
        );
      }
    });

  const testMutation = useMutation(
    (id: string) => DataService.dataSources.test(id),
    {
      onSuccess: (result: { success: boolean; message?: string }) => {
        alert(result.success ? 'Connection test successful!' : 'Connection test failed: ' + result.message);
      },
      onError: (error: Error) => {
        alert('Connection test error: ' + error.message);
      }
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    addConnectionMutation.mutate({
      ...formData,
      type: PROVIDERS.find(p => p.id === selectedProvider)?.name,
      providerId: selectedProvider
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className={cn("text-sm font-medium", theme.text.secondary)}>
            {connections.length} Active Connections
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 border",
              theme.border.default,
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-slate-800"
            )}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm",
              isAdding
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25"
            )}
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isAdding ? 'Cancel' : 'New Connection'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        <ConnectionForm
          isAdding={isAdding}
          setIsAdding={setIsAdding}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isLoading={addConnectionMutation.isLoading}
        />
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {connections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              onSync={(id: string) => syncMutation.mutate(id)}
              onDelete={(id: string) => deleteMutation.mutate(id)}
              onTest={(conn: DataConnection) => testMutation.mutate(conn.id)}
            />
          ))}
        </AnimatePresence>

        {connections.length === 0 && !isLoading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl">
            <div className="p-4 rounded-full bg-gray-50 mb-4">
              <Database className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className={cn("text-lg font-medium", theme.text.primary)}>No connections yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Connect your first data source to start syncing data across your enterprise.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 text-blue-600 font-medium text-sm hover:underline"
            >
              Add your first connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
