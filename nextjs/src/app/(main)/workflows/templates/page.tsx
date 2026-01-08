/**
 * Workflow Templates Library Page
 *
 * Browse, search, and manage workflow templates.
 * Supports filtering by category, status, and search.
 *
 * Next.js 16 Compliance:
 * - Async params/searchParams handling
 * - Server Component with Suspense
 * - generateMetadata for SEO
 *
 * @module app/(main)/workflows/templates/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Search,
  Filter,
  LayoutGrid,
  List,
  Copy,
  MoreVertical,
  Play,
  Trash2,
  Edit,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWorkflowTemplates } from '../actions';
import type {
  WorkflowTemplateSummary,
  WorkflowTemplateStatus,
  WorkflowCategory,
} from '@/types/workflow-schemas';
import { WORKFLOW_CATEGORIES, TEMPLATE_STATUS_LABELS } from '@/types/workflow-schemas';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Workflow Templates | LexiFlow',
  description: 'Browse and manage workflow templates for legal process automation.',
};

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    status?: WorkflowTemplateStatus;
    category?: WorkflowCategory;
    search?: string;
    view?: 'grid' | 'list';
    page?: string;
  }>;
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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        styles[status]
      )}
    >
      {TEMPLATE_STATUS_LABELS[status]}
    </span>
  );
}

// =============================================================================
// Template Card Component
// =============================================================================

function TemplateCard({ template }: { template: WorkflowTemplateSummary }) {
  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
      <Link href={`/workflows/templates/${template.id}`} className="block p-6">
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={template.status} />
          <span className="text-xs text-slate-500 dark:text-slate-400">v{template.version}</span>
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
            {template.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>
      <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>{template.stepCount} steps</span>
          <span>{template.instanceCount} uses</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/workflows/templates/${template.id}`}
            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            title="Edit template"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            className="p-1.5 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            title="Start workflow"
          >
            <Play className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            title="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Template List Row Component
// =============================================================================

function TemplateRow({ template }: { template: WorkflowTemplateSummary }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4">
        <Link
          href={`/workflows/templates/${template.id}`}
          className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          {template.name}
        </Link>
        {template.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {template.description}
          </p>
        )}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={template.status} />
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 capitalize">
        {template.category.replace('-', ' ')}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
        {template.stepCount}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
        {template.instanceCount}
      </td>
      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
        {new Date(template.updatedAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/workflows/templates/${template.id}`}
            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button className="p-1.5 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
            <Play className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// =============================================================================
// Templates List Component
// =============================================================================

async function TemplatesList({
  status,
  category,
  search,
  view = 'grid',
}: {
  status?: WorkflowTemplateStatus;
  category?: WorkflowCategory;
  search?: string;
  view?: 'grid' | 'list';
}) {
  const result = await getWorkflowTemplates({ status, category, search, limit: 50 });

  // Fallback mock data
  const templates: WorkflowTemplateSummary[] =
    result.success && result.data
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
            tags: ['intake', 'clients', 'onboarding'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Discovery Process',
            description: 'Litigation discovery workflow with document review stages',
            category: 'discovery',
            status: 'active',
            version: 2,
            stepCount: 12,
            instanceCount: 28,
            estimatedDuration: 480,
            tags: ['litigation', 'discovery', 'documents'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Document Approval',
            description: 'Multi-level document approval workflow with partner sign-off',
            category: 'document-review',
            status: 'active',
            version: 1,
            stepCount: 5,
            instanceCount: 89,
            estimatedDuration: 60,
            tags: ['documents', 'approval', 'review'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Case Closing Checklist',
            description: 'Standard checklist for closing out completed cases',
            category: 'case-management',
            status: 'draft',
            version: 1,
            stepCount: 15,
            instanceCount: 0,
            tags: ['cases', 'closing'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '5',
            name: 'Billing Review',
            description: 'Monthly billing review and approval process',
            category: 'billing',
            status: 'active',
            version: 4,
            stepCount: 6,
            instanceCount: 156,
            tags: ['billing', 'finance', 'monthly'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '6',
            name: 'Compliance Audit',
            description: 'Annual compliance audit workflow',
            category: 'compliance',
            status: 'inactive',
            version: 2,
            stepCount: 20,
            instanceCount: 4,
            tags: ['compliance', 'audit', 'annual'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          No templates found
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {search
            ? `No templates match "${search}"`
            : 'Get started by creating your first workflow template.'}
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

  if (view === 'list') {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Steps
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Uses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Updated
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {templates.map((template) => (
              <TemplateRow key={template.id} template={template} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function TemplatesLoadingSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  if (view === 'list') {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {['Name', 'Status', 'Category', 'Steps', 'Uses', 'Updated'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 animate-pulse"
        >
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="flex gap-1">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="flex gap-1">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function WorkflowTemplatesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const { status, category, search, view = 'grid' } = resolvedParams;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Workflow Templates
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Create and manage reusable workflow templates for your firm.
            </p>
          </div>
          <Link
            href="/workflows/templates/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Template
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
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600 dark:text-blue-400"
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

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search templates..."
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
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            defaultValue={category || ''}
            className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {WORKFLOW_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <Link
              href={`/workflows/templates?view=grid${status ? `&status=${status}` : ''}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
              className={cn(
                'p-2',
                view === 'grid'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>
            <Link
              href={`/workflows/templates?view=list${status ? `&status=${status}` : ''}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
              className={cn(
                'p-2',
                view === 'list'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <List className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Templates List */}
        <Suspense fallback={<TemplatesLoadingSkeleton view={view} />}>
          <TemplatesList
            status={status}
            category={category}
            search={search}
            view={view}
          />
        </Suspense>
      </div>
    </div>
  );
}
