/**
 * Data Platform Dashboard Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import {
  Activity,
  Database,
  Download,
  GitBranch,
  HardDrive,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  Server,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Data Platform | LexiFlow',
  description: 'Manage data pipelines, sources, and integrations',
};

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSync: string;
  recordCount: number;
  errorCount: number;
}

interface DataPipeline {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: string;
  lastRun: string;
  schedule: string;
}

interface DataPlatformSearchParams {
  searchParams: Promise<{
    search?: string;
    tab?: string;
  }>;
}

async function DataPlatformContent({ searchParams }: DataPlatformSearchParams) {
  const params = await searchParams;
  const search = params.search || '';
  const tab = params.tab || 'sources';

  let sources: DataSource[] = [];
  let pipelines: DataPipeline[] = [];

  try {
    sources = await apiFetch('/data-platform/sources');
  } catch {
    sources = [];
  }

  try {
    pipelines = await apiFetch('/data-platform/pipelines');
  } catch {
    pipelines = [];
  }

  // Ensure arrays are valid
  sources = Array.isArray(sources) ? sources : [];
  pipelines = Array.isArray(pipelines) ? pipelines : [];

  // Apply search filter
  const filteredSources = search
    ? sources.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : sources;

  const filteredPipelines = search
    ? pipelines.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : pipelines;

  // Stats
  const totalSources = sources.length;
  const activeSources = sources.filter((s) => s.status === 'active').length;
  const totalRecords = sources.reduce((acc, s) => acc + s.recordCount, 0);
  const runningPipelines = pipelines.filter((p) => p.status === 'running').length;

  const sourceStatusColors = {
    active: 'success',
    inactive: 'default',
    error: 'danger',
    syncing: 'warning',
  } as const;

  const pipelineStatusColors = {
    running: 'success',
    idle: 'default',
    error: 'danger',
    paused: 'warning',
  } as const;

  const sourceColumns = [
    {
      header: 'Source',
      accessor: (row: DataSource) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">{row.name}</p>
            <p className="text-sm text-slate-500">{row.type}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: DataSource) => (
        <Badge variant={sourceStatusColors[row.status as keyof typeof sourceStatusColors] || 'default'}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Records',
      accessor: (row: DataSource) => row.recordCount.toLocaleString(),
    },
    {
      header: 'Errors',
      accessor: (row: DataSource) => (
        <span className={row.errorCount > 0 ? 'text-red-600' : 'text-slate-500'}>
          {row.errorCount}
        </span>
      ),
    },
    {
      header: 'Last Sync',
      accessor: (row: DataSource) => new Date(row.lastSync).toLocaleString(),
    },
    {
      header: 'Actions',
      accessor: (row: DataSource) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" icon={<RefreshCw className="h-3 w-3" />}>
            Sync
          </Button>
          <Link href={`/data-platform/sources/${row.id}`}>
            <Button size="sm" variant="ghost">
              Details
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const pipelineColumns = [
    {
      header: 'Pipeline',
      accessor: (row: DataPipeline) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <GitBranch className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">{row.name}</p>
            <p className="text-sm text-slate-500">{row.source} → {row.destination}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: DataPipeline) => (
        <div className="flex items-center gap-2">
          {row.status === 'running' && (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          <Badge variant={pipelineStatusColors[row.status as keyof typeof pipelineStatusColors] || 'default'}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Schedule',
      accessor: 'schedule' as const,
    },
    {
      header: 'Last Run',
      accessor: (row: DataPipeline) => new Date(row.lastRun).toLocaleString(),
    },
    {
      header: 'Actions',
      accessor: (row: DataPipeline) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" icon={<Play className="h-3 w-3" />}>
            Run
          </Button>
          <Link href={`/data-platform/pipelines/${row.id}`}>
            <Button size="sm" variant="ghost">
              Configure
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalSources}</p>
                <p className="text-sm text-slate-500">Data Sources</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{activeSources}</p>
                <p className="text-sm text-slate-500">Active Sources</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <GitBranch className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{runningPipelines}</p>
                <p className="text-sm text-slate-500">Running Pipelines</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {(totalRecords / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-slate-500">Total Records</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Tabs */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search sources and pipelines..."
                defaultValue={search}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div className="flex gap-2">
              <Link href="?tab=sources">
                <Button variant={tab === 'sources' ? 'primary' : 'outline'} size="sm">
                  Sources
                </Button>
              </Link>
              <Link href="?tab=pipelines">
                <Button variant={tab === 'pipelines' ? 'primary' : 'outline'} size="sm">
                  Pipelines
                </Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Data Sources Tab */}
      {tab === 'sources' && (
        <Card>
          <CardBody className="p-0">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Data Sources
              </h3>
              <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                Add Source
              </Button>
            </div>
            {filteredSources.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<Database className="h-12 w-12" />}
                  title="No data sources found"
                  description="Connect your first data source to start ingesting data"
                  action={<Button icon={<Plus className="h-4 w-4" />}>Add Source</Button>}
                />
              </div>
            ) : (
              <Table columns={sourceColumns} data={filteredSources} />
            )}
          </CardBody>
        </Card>
      )}

      {/* Pipelines Tab */}
      {tab === 'pipelines' && (
        <Card>
          <CardBody className="p-0">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Data Pipelines
              </h3>
              <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                Create Pipeline
              </Button>
            </div>
            {filteredPipelines.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<GitBranch className="h-12 w-12" />}
                  title="No pipelines configured"
                  description="Create your first data pipeline to automate data flows"
                  action={<Button icon={<Plus className="h-4 w-4" />}>Create Pipeline</Button>}
                />
              </div>
            ) : (
              <Table columns={pipelineColumns} data={filteredPipelines} />
            )}
          </CardBody>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <RefreshCw className="h-5 w-5" />
              <span>Sync All Sources</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Layers className="h-5 w-5" />
              <span>View Catalog</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Server className="h-5 w-5" />
              <span>System Health</span>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardBody>
              <SkeletonLine className="h-16" />
            </CardBody>
          </Card>
        ))}
      </div>
      <Card>
        <CardBody>
          <SkeletonLine className="h-10" />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonLine key={i} className="h-14" />
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default async function DataPlatformPage({ searchParams }: DataPlatformSearchParams) {
  return (
    <>
      <PageHeader
        title="Data Platform"
        description="Manage data sources, pipelines, and integrations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' },
          { label: 'Data Platform' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
            <Button icon={<Plus className="h-4 w-4" />}>Add Integration</Button>
          </div>
        }
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <DataPlatformContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
