/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Data Platform Domain - View Component
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { CheckCircle, Database, Plus, XCircle } from 'lucide-react';
import React from 'react';
import { useDataPlatform } from './DataPlatformProvider';

export function DataPlatformView() {
  const { sources, typeFilter, setTypeFilter, metrics } = useDataPlatform();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Data Platform"
        subtitle="Integrated data sources and pipelines"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            Add Source
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Sources"
          value={metrics.totalSources}
        />
        <MetricCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Connected"
          value={metrics.connectedCount}
        />
        <MetricCard
          icon={<Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          label="Total Records"
          value={metrics.totalRecords}
        />
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <FilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
            All Types
          </FilterButton>
          <FilterButton active={typeFilter === 'Database'} onClick={() => setTypeFilter('Database')}>
            Database
          </FilterButton>
          <FilterButton active={typeFilter === 'API'} onClick={() => setTypeFilter('API')}>
            API
          </FilterButton>
          <FilterButton active={typeFilter === 'File'} onClick={() => setTypeFilter('File')}>
            File
          </FilterButton>
          <FilterButton active={typeFilter === 'Stream'} onClick={() => setTypeFilter('Stream')}>
            Stream
          </FilterButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map(source => (
            <DataSourceCard key={source.id} source={source} />
          ))}
          {sources.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
              No data sources found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type DataSource = {
  id: string;
  name: string;
  type: 'Database' | 'API' | 'File' | 'Stream';
  status: 'Connected' | 'Disconnected' | 'Error';
  recordCount: number;
  lastSync: string;
};

const statusConfig = {
  Connected: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400' },
  Disconnected: { icon: XCircle, color: 'text-slate-600 dark:text-slate-400' },
  Error: { icon: XCircle, color: 'text-rose-600 dark:text-rose-400' },
};

function DataSourceCard({ source }: { source: DataSource }) {
  const StatusIcon = statusConfig[source.status].icon;
  const statusColor = statusConfig[source.status].color;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {source.type}
          </span>
        </div>
        <StatusIcon className={`w-5 h-5 ${statusColor}`} />
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
        {source.name}
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Records:</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {source.recordCount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Last Sync:</span>
          <span className="text-xs text-slate-500 dark:text-slate-500">
            {new Date(source.lastSync).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
