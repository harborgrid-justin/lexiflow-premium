/**
 * Workflow Instance Detail Page
 *
 * View detailed information about a running workflow instance.
 * Displays progress, step history, and execution controls.
 *
 * Next.js 16 Compliance:
 * - Async params handling
 * - Server Actions for mutations
 * - generateMetadata with dynamic params
 *
 * @module app/(main)/workflows/instances/[id]/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Circle,
  User,
  Calendar,
  FileText,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getWorkflowInstance,
  pauseWorkflowInstance,
  resumeWorkflowInstance,
  cancelWorkflowInstance,
  retryWorkflowInstance,
  instanceControlFormAction,
} from '../../actions';
import type {
  WorkflowInstance,
  WorkflowStepExecution,
  WorkflowInstanceStatus,
  WorkflowStepStatus,
} from '@/types/workflow-schemas';
import { INSTANCE_STATUS_LABELS } from '@/types/workflow-schemas';

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getWorkflowInstance(resolvedParams.id);

  if (!result.success || !result.data) {
    return {
      title: 'Instance Not Found | LexiFlow',
    };
  }

  return {
    title: `${result.data.templateName} Instance | LexiFlow`,
    description: `Workflow instance for ${result.data.templateName}`,
  };
}

// =============================================================================
// Status Components
// =============================================================================

function InstanceStatusBadge({ status }: { status: WorkflowInstanceStatus }) {
  const config: Record<WorkflowInstanceStatus, { bg: string; icon: React.ReactNode }> = {
    pending: {
      bg: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      icon: <Clock className="h-4 w-4" />,
    },
    running: {
      bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: <Activity className="h-4 w-4" />,
    },
    paused: {
      bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      icon: <Pause className="h-4 w-4" />,
    },
    completed: {
      bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    failed: {
      bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: <XCircle className="h-4 w-4" />,
    },
    cancelled: {
      bg: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
      icon: <Square className="h-4 w-4" />,
    },
  };

  const { bg, icon } = config[status] || config.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium capitalize',
        bg
      )}
    >
      {icon}
      {INSTANCE_STATUS_LABELS[status]}
    </span>
  );
}

function StepStatusIcon({ status }: { status: WorkflowStepStatus }) {
  const icons: Record<WorkflowStepStatus, React.ReactNode> = {
    pending: <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />,
    in_progress: <Activity className="h-5 w-5 text-blue-500 animate-pulse" />,
    completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    skipped: <ChevronRight className="h-5 w-5 text-slate-400" />,
    failed: <XCircle className="h-5 w-5 text-red-500" />,
    blocked: <AlertCircle className="h-5 w-5 text-amber-500" />,
  };

  return icons[status] || icons.pending;
}

// =============================================================================
// Progress Ring Component
// =============================================================================

function ProgressRing({ value, size = 120 }: { value: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-500',
            value >= 100
              ? 'text-green-500'
              : value >= 75
              ? 'text-blue-500'
              : value >= 50
              ? 'text-amber-500'
              : 'text-slate-400'
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}%</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Complete</span>
      </div>
    </div>
  );
}

// =============================================================================
// Steps Timeline Component
// =============================================================================

function StepsTimeline({ steps }: { steps: readonly WorkflowStepExecution[] }) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <Circle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm">No step executions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.stepId}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 && (
                <span
                  className={cn(
                    'absolute left-[18px] top-8 -ml-px h-full w-0.5',
                    step.status === 'completed'
                      ? 'bg-green-300 dark:bg-green-700'
                      : step.status === 'failed'
                      ? 'bg-red-300 dark:bg-red-700'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full ring-4',
                      step.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 ring-green-50 dark:ring-green-900/50'
                        : step.status === 'in_progress'
                        ? 'bg-blue-100 dark:bg-blue-900/30 ring-blue-50 dark:ring-blue-900/50'
                        : step.status === 'failed'
                        ? 'bg-red-100 dark:bg-red-900/30 ring-red-50 dark:ring-red-900/50'
                        : 'bg-white dark:bg-slate-800 ring-slate-100 dark:ring-slate-700'
                    )}
                  >
                    <StepStatusIcon status={step.status} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {step.stepName}
                    </p>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded capitalize',
                        step.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : step.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : step.status === 'failed'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      )}
                    >
                      {step.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    {step.startedAt && (
                      <span>Started: {new Date(step.startedAt).toLocaleString()}</span>
                    )}
                    {step.completedAt && (
                      <span>Completed: {new Date(step.completedAt).toLocaleString()}</span>
                    )}
                    {step.attempts > 1 && <span>Attempts: {step.attempts}</span>}
                  </div>
                  {step.error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      Error: {step.error}
                    </p>
                  )}
                  {step.notes && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                      {step.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =============================================================================
// Instance Actions Component
// =============================================================================

function InstanceActions({ instance }: { instance: WorkflowInstance }) {
  const canPause = instance.status === 'running';
  const canResume = instance.status === 'paused';
  const canCancel = instance.status === 'running' || instance.status === 'paused';
  const canRetry = instance.status === 'failed';

  return (
    <div className="flex items-center gap-2">
      {canPause && (
        <form action={instanceControlFormAction}>
          <input type="hidden" name="id" value={instance.id} />
          <input type="hidden" name="action" value="pause" />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        </form>
      )}

      {canResume && (
        <form action={instanceControlFormAction}>
          <input type="hidden" name="id" value={instance.id} />
          <input type="hidden" name="action" value="resume" />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            Resume
          </button>
        </form>
      )}

      {canRetry && (
        <form action={instanceControlFormAction}>
          <input type="hidden" name="id" value={instance.id} />
          <input type="hidden" name="action" value="retry" />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </form>
      )}

      {canCancel && (
        <form action={instanceControlFormAction}>
          <input type="hidden" name="id" value={instance.id} />
          <input type="hidden" name="action" value="cancel" />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Square className="h-4 w-4" />
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

// =============================================================================
// Instance Content Component
// =============================================================================

async function InstanceContent({ id }: { id: string }) {
  const result = await getWorkflowInstance(id);

  // Fallback mock data for development
  const instance: WorkflowInstance =
    result.success && result.data
      ? result.data
      : {
          id,
          templateId: 'template-1',
          templateName: 'Client Onboarding',
          templateVersion: 3,
          status: 'running',
          caseId: 'case-123',
          caseName: 'Smith v. Jones',
          currentStepId: 'step-3',
          currentStepName: 'Document Collection',
          progress: 65,
          startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          startedBy: 'user-1',
          stepExecutions: [
            {
              stepId: 'step-1',
              stepName: 'Initial Contact',
              status: 'completed',
              startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              completedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
              completedBy: 'user-1',
              attempts: 1,
            },
            {
              stepId: 'step-2',
              stepName: 'Conflict Check',
              status: 'completed',
              startedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
              completedAt: new Date(Date.now() - 86400000).toISOString(),
              completedBy: 'user-2',
              attempts: 1,
              notes: 'Cleared - no conflicts found',
            },
            {
              stepId: 'step-3',
              stepName: 'Document Collection',
              status: 'in_progress',
              startedAt: new Date(Date.now() - 86400000).toISOString(),
              assignedTo: 'user-3',
              attempts: 1,
            },
            {
              stepId: 'step-4',
              stepName: 'Review & Approval',
              status: 'pending',
              attempts: 0,
            },
            {
              stepId: 'step-5',
              stepName: 'Send Welcome Package',
              status: 'pending',
              attempts: 0,
            },
          ],
          variables: [
            { variableId: 'var-1', key: 'client_name', value: 'John Smith', setAt: new Date().toISOString() },
            { variableId: 'var-2', key: 'client_email', value: 'john@example.com', setAt: new Date().toISOString() },
            { variableId: 'var-3', key: 'matter_type', value: 'Personal Injury', setAt: new Date().toISOString() },
          ],
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date().toISOString(),
        };

  if (!instance) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/workflows/instances"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Instances
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {instance.templateName}
              </h1>
              <InstanceStatusBadge status={instance.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>ID: {instance.id.substring(0, 8)}...</span>
              {instance.caseName && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <Link
                    href={`/cases/${instance.caseId}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    {instance.caseName}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </>
              )}
            </div>
          </div>
          <InstanceActions instance={instance} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Progress</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ProgressRing value={instance.progress} />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current Step</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {instance.currentStepName || 'Completed'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {instance.stepExecutions.filter((s) => s.status === 'completed').length} of{' '}
                    {instance.stepExecutions.length} steps completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Step Execution History
              </h2>
            </div>
            <div className="p-6">
              <StepsTimeline steps={instance.stepExecutions} />
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Details</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Template</dt>
                    <dd className="text-sm font-medium text-slate-900 dark:text-white">
                      <Link
                        href={`/workflows/templates/${instance.templateId}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {instance.templateName} v{instance.templateVersion}
                      </Link>
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Started</dt>
                    <dd className="text-sm font-medium text-slate-900 dark:text-white">
                      {new Date(instance.startedAt).toLocaleString()}
                    </dd>
                  </div>
                </div>
                {instance.completedAt && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 dark:text-slate-400">Completed</dt>
                      <dd className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(instance.completedAt).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                )}
                {instance.pausedAt && (
                  <div className="flex items-start gap-3">
                    <Pause className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 dark:text-slate-400">Paused</dt>
                      <dd className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(instance.pausedAt).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Variables Card */}
          {instance.variables.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Variables</h2>
              </div>
              <div className="p-6">
                <dl className="space-y-3">
                  {instance.variables.map((variable) => (
                    <div key={variable.variableId}>
                      <dt className="text-xs text-slate-500 dark:text-slate-400">
                        {variable.key}
                      </dt>
                      <dd className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                        {String(variable.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function WorkflowInstanceDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <div className="px-6 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <InstanceContent id={resolvedParams.id} />
        </Suspense>
      </div>
    </div>
  );
}
