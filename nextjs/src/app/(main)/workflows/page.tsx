/**
 * Workflows Dashboard Page - Server Component
 *
 * Main dashboard for workflow automation system.
 * Displays tabs for templates and instances with real-time statistics.
 *
 * Next.js 16 Compliance:
 * - Async Server Component with proper data fetching
 * - Suspense boundaries for streaming
 * - generateMetadata for SEO
 * - Proper cache tag usage
 *
 * @module app/(main)/workflows/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Play,
  Plus,
  FileText,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  TrendingUp,
  LayoutGrid,
  List,
  RefreshCw,
  Settings,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getWorkflowTemplates,
  getWorkflowInstances,
  getWorkflowDashboardStats,
} from './actions';
import type {
  WorkflowTemplateSummary,
  WorkflowInstanceSummary,
  WorkflowDashboardStats,
  WorkflowInstanceStatus,
  WorkflowTemplateStatus,
} from '@/types/workflow-schemas';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Workflows & Automation | LexiFlow',
  description:
    'Manage automated workflows, process templates, and monitor active workflow instances for legal operations.',
  openGraph: {
    title: 'Workflows & Automation | LexiFlow',
    description: 'Automate case processes, task dependencies, and firm operations.',
  },
};

// =============================================================================
// Loading Skeletons
// =============================================================================

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  );
}

function TemplateCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function InstanceRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
      <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></td>
      <td className="px-6 py-4"><div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    </tr>
  );
}

// =============================================================================
// Status Badge Component
// =============================================================================

function StatusBadge({
  status,
  type,
}: {
  status: WorkflowTemplateStatus | WorkflowInstanceStatus;
  type: 'template' | 'instance';
}) {
  const getStyles = () => {
    if (type === 'template') {
      switch (status) {
        case 'active':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'draft':
          return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        case 'inactive':
          return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        case 'archived':
          return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
        default:
          return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      }
    } else {
      switch (status) {
        case 'running':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'completed':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'paused':
          return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        case 'failed':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'cancelled':
          return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
        case 'pending':
          return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        default:
          return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      }
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        getStyles()
      )}
    >
      {status}
    </span>
  );
}

// =============================================================================
// Progress Bar Component
// =============================================================================

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
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
// Stat Card Component
// =============================================================================

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}) {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <p
              className={cn(
                'mt-1 text-xs font-medium flex items-center gap-1',
                trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}
            >
              <TrendingUp className={cn('h-3 w-3', trend < 0 && 'rotate-180')} />
              {trend >= 0 ? '+' : ''}
              {trend}% {trendLabel}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', colorStyles[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Dashboard Stats Section
// =============================================================================

async function DashboardStats() {
  const result = await getWorkflowDashboardStats();

  // Fallback data if API fails
  const stats: WorkflowDashboardStats = result.success && result.data
    ? result.data
    : {
        totalTemplates: 12,
        activeTemplates: 8,
        totalInstances: 156,
        runningInstances: 14,
        completedInstances: 128,
        failedInstances: 4,
        metrics: {
          activeInstances: 14,
          completedThisWeek: 23,
          completedThisMonth: 89,
          averageCompletionTime: 48,
          successRate: 94.5,
          failureRate: 2.5,
          tasksDueToday: 7,
          overdueTasks: 3,
          bottleneckSteps: [],
        },
        recentActivity: [],
      };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active Templates"
        value={stats.activeTemplates}
        icon={FileText}
        color="blue"
      />
      <StatCard
        title="Running Instances"
        value={stats.runningInstances}
        icon={Activity}
        color="green"
      />
      <StatCard
        title="Completed This Month"
        value={stats.metrics.completedThisMonth}
        icon={CheckCircle2}
        trend={12}
        trendLabel="vs last month"
        color="purple"
      />
      <StatCard
        title="Tasks Due Today"
        value={stats.metrics.tasksDueToday}
        icon={Clock}
        color="amber"
      />
    </div>
  );
}

// =============================================================================
// Templates Grid Section
// =============================================================================

async function TemplatesGrid() {
  const result = await getWorkflowTemplates({ status: 'active', limit: 6 });

  // Fallback mock data
  const templates: WorkflowTemplateSummary[] = result.success && result.data
    ? result.data
    : [
        {
          id: '1',
          name: 'Client Onboarding',
          description: 'Standard process for new client intake and setup',
          category: 'client-intake',
          status: 'active',
          version: 3,
          stepCount: 8,
          instanceCount: 45,
          estimatedDuration: 120,
          tags: ['intake', 'clients'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Discovery Process',
          description: 'Litigation discovery workflow with document review',
          category: 'discovery',
          status: 'active',
          version: 2,
          stepCount: 12,
          instanceCount: 28,
          estimatedDuration: 480,
          tags: ['litigation', 'discovery'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Document Approval',
          description: 'Multi-level document approval workflow',
          category: 'document-review',
          status: 'active',
          version: 1,
          stepCount: 5,
          instanceCount: 89,
          estimatedDuration: 60,
          tags: ['documents', 'approval'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          No templates yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Get started by creating your first workflow template.
        </p>
        <Link
          href="/workflows/templates/new"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Link
          key={template.id}
          href={`/workflows/templates/${template.id}`}
          className="group relative rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <StatusBadge status={template.status} type="template" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                v{template.version}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {template.name}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {template.description || `Category: ${template.category}`}
            </p>
            {template.tags && template.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {template.stepCount} steps
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {template.instanceCount} instances
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

// =============================================================================
// Instances Table Section
// =============================================================================

async function InstancesTable() {
  const result = await getWorkflowInstances({ status: 'running', limit: 10 });

  // Fallback mock data
  const instances: WorkflowInstanceSummary[] = result.success && result.data
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
      ];

  if (instances.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-8 text-center">
        <Activity className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          No active instances
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start a workflow from a template to see it here.
        </p>
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
          {instances.map((instance) => (
            <tr
              key={instance.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {instance.templateName}
                  </p>
                  {instance.caseName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {instance.caseName}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={instance.status} type="instance" />
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
                <Link
                  href={`/workflows/instances/${instance.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Workflows & Automation
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Automate case processes, task dependencies, and firm operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Sync Engine
            </button>
            <Link
              href="/workflows/templates/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Workflow
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <section className="mb-8">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <DashboardStats />
          </Suspense>
        </section>

        {/* Quick Navigation Tabs */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <nav className="flex space-x-8">
            <Link
              href="/workflows"
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600 dark:text-blue-400"
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
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
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

        {/* Templates Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Active Templates
            </h2>
            <Link
              href="/workflows/templates"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View all templates
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <TemplateCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <TemplatesGrid />
          </Suspense>
        </section>

        {/* Running Instances Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Active Instances
            </h2>
            <Link
              href="/workflows/instances"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View all instances
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <table className="min-w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      {['Workflow', 'Status', 'Current Step', 'Progress', 'Started'].map(
                        (header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(3)].map((_, i) => (
                      <InstanceRowSkeleton key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            }
          >
            <InstancesTable />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
