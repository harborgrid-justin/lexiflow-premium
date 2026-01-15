/**
 * Cloud Database View Component
 *
 * Manages cloud database connections including adding, syncing,
 * deleting, and testing connections.
 */

import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Database, Plus, RefreshCw, X } from 'lucide-react';
import React from 'react';
import { ConnectionCard } from './ConnectionCard';
import { DataSourceSelector } from './DataSourceSelector';
import { SystemHealthDisplay } from './SystemHealthDisplay';
import { DATA_PROVIDERS } from './constants';
import { useConnectionForm, useDataSourceConnections } from './hooks';
import type { ConnectionFormData, DataProvider } from './types';

/**
 * Main view for managing cloud database connections - React 18 optimized with React.memo
 */
export const CloudDatabaseView = React.memo(function CloudDatabaseView() {
  const { theme } = useTheme();
  const { isAdding, setIsAdding, formData, setFormData } = useConnectionForm();
  const { selectedProvider, setSelectedProvider, resetForm } = useConnectionForm();

  return (
    <div className="space-y-6">
      <DataSourceSelector />
      <SystemHealthDisplay />
      <CloudDatabaseContent
        theme={theme}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        formData={formData}
        setFormData={setFormData}
        resetForm={resetForm}
      />
    </div>
  );
});

CloudDatabaseView.displayName = 'CloudDatabaseView';

// interface CloudDatabaseContentProps {
//   theme: ThemeContextValue['theme'];
//   isAdding: boolean;
//   setIsAdding: (value: boolean) => void;
//   selectedProvider: string | null;
//   setSelectedProvider: (value: string | null) => void;
//
//   formData: ConnectionFormData;
//
//   setFormData: React.Dispatch<React.SetStateAction<ConnectionFormData>>;
//   resetForm: () => void;
// }

const CloudDatabaseContent = ({
  theme,
  isAdding,
  setIsAdding,
  selectedProvider,
  setSelectedProvider,
  formData,
  setFormData,
  resetForm
}) => {
  const {
    connections,
    isLoading,
    refetch,
    addConnection,
    syncConnection,
    deleteConnection,
    testConnection,
    isAdding: isSubmitting
  } = useDataSourceConnections();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    const provider = DATA_PROVIDERS.find(p => p.id === selectedProvider);
    addConnection({
      ...formData,
      type: provider?.name,
      providerId: selectedProvider
    });

    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
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
            title="Refresh connections"
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

      {/* Add Connection Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={cn("p-6 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800 mb-6")}>
              {!selectedProvider ? (
                <ProviderSelection
                  providers={DATA_PROVIDERS}
                  onSelect={setSelectedProvider}
                  theme={theme}
                />
              ) : (
                <ConnectionForm
                  selectedProvider={selectedProvider}
                  providers={DATA_PROVIDERS}
                  formData={formData}
                  setFormData={setFormData}
                  onCancel={() => { setIsAdding(false); setSelectedProvider(null); }}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  theme={theme}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Connections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {connections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              onSync={syncConnection}
              onDelete={deleteConnection}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onTest={testConnection as any}
            />
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {connections.length === 0 && !isLoading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl">
            <div className="p-4 rounded-full bg-gray-50 mb-4">
              <Database className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className={cn("text-lg font-medium", theme.text.primary)}>No connections yet</h3>
            <p className={cn("text-sm text-gray-500 mt-1 max-w-sm")}>
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

interface ProviderSelectionProps {
  providers: readonly DataProvider[];
  onSelect: (id: string) => void;
  theme: ThemeContextValue['theme'];
}

const ProviderSelection = function ProviderSelection({ providers, onSelect, theme }: ProviderSelectionProps) {
  return (
    <>
      <h4 className={cn("text-sm font-bold mb-4", theme.text.primary)}>Select Provider</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {providers.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="group flex flex-col items-center justify-center p-6 rounded-xl border bg-white dark:bg-slate-800 hover:border-blue-500 hover:shadow-md transition-all gap-3"
          >
            <div className={cn("p-3 rounded-full bg-gray-50 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors")}>
              <p.icon className={cn("h-6 w-6", p.color)} />
            </div>
            <span className={cn("text-sm font-medium", theme.text.primary)}>{p.name}</span>
          </button>
        ))}
      </div>
    </>
  );
};

interface ConnectionFormProps {
  selectedProvider: string;
  providers: readonly DataProvider[];
  formData: ConnectionFormData;
  setFormData: React.Dispatch<React.SetStateAction<ConnectionFormData>>;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  theme: ThemeContextValue['theme'];
}

function ConnectionForm({
  selectedProvider,
  providers,
  formData,
  setFormData,
  onCancel,
  onSubmit,
  isSubmitting,
  theme
}: ConnectionFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => { /* Navigate back to provider selection */ }}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Providers
        </button>
        <span className="text-gray-400">/</span>
        <span className={cn("text-sm font-bold", theme.text.primary)}>
          Configure {providers.find(p => p.id === selectedProvider)?.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Connection Name
          </label>
          <input
            type="text"
            required
            className={cn("w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all", theme.surface.default, theme.border.default, theme.text.primary)}
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Production Warehouse"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Host / Endpoint
          </label>
          <input
            type="text"
            required
            className={cn("w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all", theme.surface.default, theme.border.default, theme.text.primary)}
            value={formData.host}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, host: e.target.value })}
            placeholder="e.g. xy12345.us-east-1.snowflakecomputing.com"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
        >
          {isSubmitting ? 'Connecting...' : 'Connect Source'}
        </button>
      </div>
    </form>
  );
}
