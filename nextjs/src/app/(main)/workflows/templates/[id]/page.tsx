/**
 * Workflow Template Detail Page
 *
 * View and edit a single workflow template.
 * Displays template configuration, steps, and usage statistics.
 *
 * Next.js 16 Compliance:
 * - Async params handling
 * - Server Actions for mutations
 * - generateMetadata with dynamic params
 *
 * @module app/(main)/workflows/templates/[id]/page
 */

import { cn } from '@/lib/utils';
import type { WorkflowStep, WorkflowTemplate, WorkflowTemplateStatus } from '@/types/workflow-schemas';
import { STEP_TYPE_LABELS, TEMPLATE_STATUS_LABELS, WORKFLOW_CATEGORIES } from '@/types/workflow-schemas';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  GitBranch,
  Settings,
  Users
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
  getWorkflowTemplate
} from '../../actions';
import { TemplateActions } from './TemplateActions';

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
  const result = await getWorkflowTemplate(resolvedParams.id);

  if (!result.success || !result.data) {
    return {
      title: 'Template Not Found | LexiFlow',
    };
  }

  return {
    title: `${result.data.name} | Workflow Templates | LexiFlow`,
    description: result.data.description || `Workflow template: ${result.data.name}`,
  };
}

// =============================================================================
// Status Badge Component
// =============================================================================

function StatusBadge({ status }: { status: WorkflowTemplateStatus }) {
  const styles: Record<WorkflowTemplateStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    inactive: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize',
        styles[status]
      )}
    >
      {TEMPLATE_STATUS_LABELS[status]}
    </span>
  );
}

// =============================================================================
// Step Icon Component
// =============================================================================

function StepIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    task: <CheckCircle className="h-4 w-4 text-blue-600" />,
    approval: <Users className="h-4 w-4 text-purple-600" />,
    notification: <AlertCircle className="h-4 w-4 text-amber-600" />,
    condition: <GitBranch className="h-4 w-4 text-indigo-600" />,
    delay: <Clock className="h-4 w-4 text-slate-600" />,
    parallel: <Activity className="h-4 w-4 text-orange-600" />,
    default: <Circle className="h-4 w-4 text-slate-400" />,
  };

  return iconMap[type] || iconMap.default;
}

// =============================================================================
// Steps Timeline Component
// =============================================================================

function StepsTimeline({ steps }: { steps: readonly WorkflowStep[] }) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <Circle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm">No steps defined yet.</p>
        <Link
          href="/workflows/builder"
          className="mt-2 inline-flex text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Open Builder to add steps
        </Link>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.id}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                    <StepIcon type={step.type} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {step.name}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                      {STEP_TYPE_LABELS[step.type] || step.type}
                    </span>
                  </div>
                  {step.config?.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {step.config.description as string}
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
// Template Content Component
// =============================================================================

async function TemplateContent({ id }: { id: string }) {
  const result = await getWorkflowTemplate(id);

  // Fallback mock data for development
  const template: WorkflowTemplate =
    result.success && result.data
      ? result.data
      : {
        id,
        name: 'Client Onboarding Workflow',
        description:
          'Standard process for new client intake, document collection, and case setup.',
        category: 'client-intake',
        status: 'active',
        version: 3,
        steps: [
          {
            id: 'step-1',
            name: 'Initial Contact',
            type: 'task',
            config: {
              type: 'task',
              description: 'Record initial client contact details',
              assigneeType: 'role',
              assigneeValue: 'intake_specialist',
            },
            position: { x: 0, y: 0 },
          },
          {
            id: 'step-2',
            name: 'Conflict Check',
            type: 'approval',
            config: {
              type: 'approval',
              description: 'Run conflict check and obtain clearance',
              approverType: 'role',
              approverValue: 'compliance_officer',
              approvalType: 'single',
            },
            position: { x: 0, y: 100 },
          },
          {
            id: 'step-3',
            name: 'Document Collection',
            type: 'task',
            config: {
              type: 'task',
              description: 'Collect required documents from client',
              assigneeType: 'role',
              assigneeValue: 'paralegal',
            },
            position: { x: 0, y: 200 },
          },
          {
            id: 'step-4',
            name: 'Review & Approval',
            type: 'approval',
            config: {
              type: 'approval',
              description: 'Partner review and case approval',
              approverType: 'role',
              approverValue: 'partner',
              approvalType: 'single',
            },
            position: { x: 0, y: 300 },
          },
          {
            id: 'step-5',
            name: 'Send Welcome Package',
            type: 'notification',
            config: {
              type: 'notification',
              description: 'Send welcome email and engagement letter',
              channel: 'email',
              recipientType: 'variable',
              recipientValue: 'client_email',
            },
            position: { x: 0, y: 400 },
          },
        ],
        variables: [
          {
            id: 'var-1',
            key: 'client_name',
            name: 'Client Name',
            type: 'string',
            required: true,
          },
          {
            id: 'var-2',
            key: 'client_email',
            name: 'Client Email',
            type: 'string',
            required: true,
          },
          {
            id: 'var-3',
            key: 'matter_type',
            name: 'Matter Type',
            type: 'string',
            required: true,
          },
        ],
        triggers: [{ type: 'manual', config: {} }],
        estimatedDuration: 120,
        tags: ['intake', 'clients', 'onboarding'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

  if (!template) {
    notFound();
  }

  const categoryLabel =
    WORKFLOW_CATEGORIES.find((c) => c.value === template.category)?.label || template.category;

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/workflows/templates"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {template.name}
              </h1>
              <StatusBadge status={template.status} />
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              {template.description || 'No description provided'}
            </p>
            {template.tags && template.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <TemplateActions template={template} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Steps</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {template.steps.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Est. Duration</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {template.estimatedDuration ? `${template.estimatedDuration} min` : '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Variables</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {template.variables.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <GitBranch className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Version</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                v{template.version}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Workflow Steps
              </h2>
            </div>
            <div className="p-6">
              <StepsTimeline steps={template.steps} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Details</h2>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white capitalize">
                    {categoryLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Trigger</dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white capitalize">
                    {template.triggers[0]?.type || 'Manual'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Created</dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                    {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                    {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Variables Card */}
          {template.variables.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Variables</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {template.variables.map((variable) => (
                    <li
                      key={variable.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-900 dark:text-white font-medium">
                        {variable.name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 capitalize">
                        {variable.type}
                        {variable.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
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
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function WorkflowTemplateDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <div className="px-6 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <TemplateContent id={resolvedParams.id} />
        </Suspense>
      </div>
    </div>
  );
}
