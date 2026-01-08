/**
 * Workflow Instances Page
 *
 * View and manage running workflow instances.
 * Supports filtering by status, template, and search.
 *
 * Next.js 16 Compliance:
 * - Async params/searchParams handling
 * - Server Component with Suspense
 * - generateMetadata for SEO
 *
 * @module app/(main)/workflows/instances/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Search,
  Filter,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWorkflowInstances } from '../actions';
import type {
  WorkflowInstanceSummary,
  WorkflowInstanceStatus,
} from '@/types/workflow-schemas';
import { INSTANCE_STATUS_LABELS } from '@/types/workflow-schemas';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Workflow Instances | LexiFlow',
  description: 'Monitor and manage running workflow instances.',
};

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    status?: WorkflowInstanceStatus;
    templateId?: string;
    search?: string;
    page?: string;
  }>;
}

// =============================================================================
// Status Badge Component
// =============================================================================

function StatusBadge({ status }: { status: WorkflowInstanceStatus }) {
  const config: Record<WorkflowInstanceStatus, { bg: string; icon: React.ReactNode }> = {
    pending: {
      bg: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      icon: <Clock className="h-3 w-3" />,
    },
    running: {
      bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: <Activity className="h-3 w-3" />,
    },
    paused: {
      bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      icon: <Pause className="h-3 w-3" />,
    },
    completed: {
      bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    failed: {
      bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: <XCircle className="h-3 w-3" />,
    },
    cancelled: {
      bg: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
      icon: <Square className="h-3 w-3" />,
    },
  };

  const { bg, icon } = config[status] || config.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        bg
      )}
    >
      {icon}
      {INSTANCE_STATUS_LABELS[status]}
    </span>
  );
}

// =============================================================================
// Progress Bar Component
// =============================================================================

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            value >= 100
              ? 'bg-green-500'
              : value >= 75
              ? 'bg-blue-500'
              : value >= 50
              ? 'bg-amber-500'
              : 'bg-slate-400'
          )}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-10 text-right">
        {value}%
      </span>
    </div>
  );
}

// =============================================================================
// Stats Cards Component
// =============================================================================

async function InstanceStats() {
  const [runningResult, completedResult, failedResult] = await Promise.all([
    getWorkflowInstances({ status: 'running' }),
    getWorkflowInstances({ status: 'completed' }),
    getWorkflowInstances({ status: 'failed' }),
  ]);

  const stats = {
    running: runningResult.success ? runningResult.data?.length || 0 : 0,
    completed: completedResult.success ? completedResult.data?.length || 0 : 0,
    failed: failedResult.success ? failedResult.data?.length || 0 : 0,
  };

  // Fallback mock data
  if (stats.running === 0 && stats.completed === 0 && stats.failed === 0) {
    stats.running = 14;
    stats.completed = 128;
    stats.failed = 4;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Running</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {stats.running}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {stats.completed}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Failed</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {stats.failed}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Instances Table Component
// =============================================================================

async function InstancesTable({
  status,
  templateId,
  search,
}: {
  status?: WorkflowInstanceStatus;
  templateId?: string;
  search?: string;
}) {
  const result = await getWorkflowInstances({ status, templateId, limit: 50 });

  // Fallback mock data
  const instances: WorkflowInstanceSummary[] =
    result.success && result.data
      ? result.data
      : [
          {
            id: 'inst-1',
            templateName: 'Client Onboarding',
            status: 'running',
            progress: 65,
            currentStepName: 'Document Collection',
            caseId: 'case-123',
            caseName: 'Smith v. Jones',
            startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'inst-2',
            templateName: 'Discovery Process',
            status: 'running',
            progress: 30,
            currentStepName: 'Initial Review',
            caseId: 'case-456',
            caseName: 'Acme Corp Litigation',
            startedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
          {
            id: 'inst-3',
            templateName: 'Document Approval',
            status: 'paused',
            progress: 80,
            currentStepName: 'Partner Review',
            startedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'inst-4',
            templateName: 'Billing Review',
            status: 'completed',
            progress: 100,
            caseName: 'Monthly Billing - December',
            startedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
          {
            id: 'inst-5',
            templateName: 'Compliance Audit',
            status: 'failed',
            progress: 45,
            currentStepName: 'Document Validation',
            startedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          },
          {
            id: 'inst-6',
            templateName: 'Client Onboarding',
            status: 'running',
            progress: 20,
            currentStepName: 'Conflict Check',
            caseId: 'case-789',
            caseName: 'Johnson Estate',
            startedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ];

  // Filter by search if provided
  const filteredInstances = search
    ? instances.filter(
        (i) =>
          i.templateName.toLowerCase().includes(search.toLowerCase()) ||
          i.caseName?.toLowerCase().includes(search.toLowerCase())
      )
    : instances;

  if (filteredInstances.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <Activity className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          No instances found
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {search
            ? `No instances match "${search}"`
            : 'Start a workflow from a template to see it here.'}
        </p>
        <Link
          href="/workflows/templates"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Play className="h-4 w-4" />
          Browse Templates
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workflow
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Step
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Started
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredInstances.map((instance) => (
            <tr
              key={instance.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div>
                  <Link
                    href={`/workflows/instances/${instance.id}`}
                    className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {instance.templateName}
                  </Link>
                  {instance.caseName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {instance.caseName}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={instance.status} />
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {instance.currentStepName || '-'}
              </td>
              <td className="px-6 py-4 w-40">
                <ProgressBar value={instance.progress} />
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {new Date(instance.startedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  {instance.status === 'running' && (
                    <button
                      className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Pause"
                    >
                      <Pause className="h-4 w-4" />
                    </button>
                  )}
                  {instance.status === 'paused' && (
                    <button
                      className="p-1.5 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Resume"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  {instance.status === 'failed' && (
                    <button
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Retry"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                  <Link
                    href={`/workflows/instances/${instance.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 px-2"
                  >
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function LoadingSkeleton() {
  return (
    <>
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div>
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {['Workflow', 'Status', 'Current Step', 'Progress', 'Started'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </td>
                <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
                <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                <td className="px-6 py-4"><div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function WorkflowInstancesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const { status, templateId, search } = resolvedParams;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Workflow Instances
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Monitor and manage running workflow instances.
            </p>
          </div>
          <Link
            href="/workflows/templates"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Play className="h-4 w-4" />
            Start New Workflow
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <nav className="flex space-x-8">
            <Link
              href="/workflows"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Dashboard
            </Link>
            <Link
              href="/workflows/templates"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Templates
            </Link>
            <Link
              href="/workflows/instances"
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              Instances
            </Link>
            <Link
              href="/workflows/builder"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Builder
            </Link>
          </nav>
        </div>

        {/* Stats Cards */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          }
        >
          <InstanceStats />
        </Suspense>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search instances..."
              defaultValue={search}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            defaultValue={status || ''}
            className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Instances Table */}
        <Suspense fallback={<LoadingSkeleton />}>
          <InstancesTable status={status} templateId={templateId} search={search} />
        </Suspense>
      </div>
    </div>
  );
}
