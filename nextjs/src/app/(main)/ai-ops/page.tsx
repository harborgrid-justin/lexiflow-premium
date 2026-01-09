/**
 * AI Operations Dashboard Page
 */

import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, CardBody, EmptyState, SkeletonLine, Table } from '@/components/ui';
import { apiFetch } from '@/lib/api-server';
import {
  Activity,
  Bot,
  Brain,
  Cpu,
  FileCode,
  Gauge,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Operations | LexiFlow',
  description: 'Manage AI models, jobs, and intelligent automation',
};

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: string;
  status: string;
  version: string;
  lastUsed: string;
  requestCount: number;
}

interface AIJob {
  id: string;
  name: string;
  model: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  inputCount: number;
  outputCount: number;
}

interface AIOperationsSearchParams {
  searchParams: Promise<{
    search?: string;
    tab?: string;
  }>;
}

async function AIOperationsContent({ searchParams }: AIOperationsSearchParams) {
  const params = await searchParams;
  const search = params.search || '';
  const tab = params.tab || 'models';

  let models: AIModel[] = [];
  let jobs: AIJob[] = [];

  try {
    models = await apiFetch('/ai-ops/models');
  } catch {
    models = [];
  }

  try {
    jobs = await apiFetch('/ai-ops/jobs');
  } catch {
    jobs = [];
  }

  // Ensure arrays are valid
  models = Array.isArray(models) ? models : [];
  jobs = Array.isArray(jobs) ? jobs : [];

  // Apply filters
  const filteredModels = search
    ? models.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase())
    )
    : models;

  const filteredJobs = search
    ? jobs.filter((j) =>
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.model.toLowerCase().includes(search.toLowerCase())
    )
    : jobs;

  // Stats
  const activeModels = models.filter((m) => m.status === 'active').length;
  const totalRequests = models.reduce((acc, m) => acc + m.requestCount, 0);
  const runningJobs = jobs.filter((j) => j.status === 'running').length;
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;

  const modelStatusColors = {
    active: 'success',
    inactive: 'default',
    error: 'danger',
    training: 'warning',
  } as const;

  const jobStatusColors = {
    running: 'info',
    completed: 'success',
    queued: 'warning',
    failed: 'danger',
  } as const;

  const modelColumns = [
    {
      header: 'Model',
      accessor: (row: AIModel) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">{row.name}</p>
            <p className="text-sm text-slate-500">{row.provider} • {row.type}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: AIModel) => (
        <Badge variant={modelStatusColors[row.status as keyof typeof modelStatusColors] || 'default'}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Version',
      accessor: 'version' as const,
    },
    {
      header: 'Requests',
      accessor: (row: AIModel) => row.requestCount.toLocaleString(),
    },
    {
      header: 'Last Used',
      accessor: (row: AIModel) => new Date(row.lastUsed).toLocaleString(),
    },
    {
      header: 'Actions',
      accessor: (row: AIModel) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" icon={<Settings className="h-3 w-3" />}>
            Configure
          </Button>
          <Link href={`/ai-ops/models/${row.id}`}>
            <Button size="sm" variant="ghost">
              Details
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const jobColumns = [
    {
      header: 'Job',
      accessor: (row: AIJob) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">{row.name}</p>
            <p className="text-sm text-slate-500">Model: {row.model}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: AIJob) => (
        <div className="flex items-center gap-2">
          {row.status === 'running' && (
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
          <Badge variant={jobStatusColors[row.status as keyof typeof jobStatusColors] || 'default'}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Progress',
      accessor: (row: AIJob) => {
        const progress = row.inputCount > 0 ? (row.outputCount / row.inputCount) * 100 : 0;
        return (
          <div className="w-24">
            <div className="flex justify-between text-xs mb-1">
              <span>{row.outputCount}</span>
              <span>{row.inputCount}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${row.status === 'failed' ? 'bg-red-500' :
                  row.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Started',
      accessor: (row: AIJob) => new Date(row.startedAt).toLocaleString(),
    },
    {
      header: 'Actions',
      accessor: (row: AIJob) => (
        <div className="flex gap-2">
          {row.status === 'queued' && (
            <Button size="sm" variant="ghost" icon={<Play className="h-3 w-3" />}>
              Start
            </Button>
          )}
          <Link href={`/ai-ops/jobs/${row.id}`}>
            <Button size="sm" variant="ghost">
              View
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
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{activeModels}</p>
                <p className="text-sm text-slate-500">Active Models</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{runningJobs}</p>
                <p className="text-sm text-slate-500">Running Jobs</p>
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
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {(totalRequests / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-500">Total Requests</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Gauge className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{completedJobs}</p>
                <p className="text-sm text-slate-500">Completed Today</p>
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
                placeholder="Search models and jobs..."
                defaultValue={search}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div className="flex gap-2">
              <Link href="?tab=models">
                <Button variant={tab === 'models' ? 'primary' : 'outline'} size="sm">
                  Models
                </Button>
              </Link>
              <Link href="?tab=jobs">
                <Button variant={tab === 'jobs' ? 'primary' : 'outline'} size="sm">
                  Jobs
                </Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Models Tab */}
      {tab === 'models' && (
        <Card>
          <CardBody className="p-0">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                AI Models
              </h3>
              <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                Register Model
              </Button>
            </div>
            {filteredModels.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<Brain className="h-12 w-12" />}
                  title="No AI models found"
                  description="Register your first AI model to start using intelligent automation"
                  action={<Button icon={<Plus className="h-4 w-4" />}>Register Model</Button>}
                />
              </div>
            ) : (
              <Table columns={modelColumns} data={filteredModels} />
            )}
          </CardBody>
        </Card>
      )}

      {/* Jobs Tab */}
      {tab === 'jobs' && (
        <Card>
          <CardBody className="p-0">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                AI Jobs
              </h3>
              <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                Create Job
              </Button>
            </div>
            {filteredJobs.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<Zap className="h-12 w-12" />}
                  title="No AI jobs found"
                  description="Create your first AI job to process documents at scale"
                  action={<Button icon={<Plus className="h-4 w-4" />}>Create Job</Button>}
                />
              </div>
            ) : (
              <Table columns={jobColumns} data={filteredJobs} />
            )}
          </CardBody>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
            AI Capabilities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <FileCode className="h-5 w-5" />
              <span>Document Analysis</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Bot className="h-5 w-5" />
              <span>Legal Research</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Sparkles className="h-5 w-5" />
              <span>Contract Review</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Cpu className="h-5 w-5" />
              <span>Batch Processing</span>
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

export default async function AIOperationsPage({ searchParams }: AIOperationsSearchParams) {
  return (
    <>
      <PageHeader
        title="AI Operations"
        description="Manage AI models, automation jobs, and intelligent features"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' },
          { label: 'AI Operations' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
            <Button icon={<Plus className="h-4 w-4" />}>New Job</Button>
          </div>
        }
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <AIOperationsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
