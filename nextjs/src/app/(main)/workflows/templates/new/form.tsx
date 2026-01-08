'use client';

/**
 * New Template Form Component
 *
 * Client component for the new workflow template form with validation.
 *
 * @module app/(main)/workflows/templates/new/form
 */

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import type { WorkflowTemplate, WorkflowCategory, WorkflowActionResult } from '@/types/workflow-schemas';

// =============================================================================
// Types
// =============================================================================

interface NewTemplateFormProps {
  action: (
    prevState: WorkflowActionResult<WorkflowTemplate> | null,
    formData: FormData
  ) => Promise<WorkflowActionResult<WorkflowTemplate>>;
  categories: readonly { value: WorkflowCategory; label: string }[];
}

// =============================================================================
// Form Component
// =============================================================================

export function NewTemplateForm({ action, categories }: NewTemplateFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {/* Error Display */}
      {state && !state.success && state.error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{state.error}</p>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Workflow Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          placeholder="e.g., Client Onboarding Process"
          className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 sm:text-sm"
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Choose a clear, descriptive name for your workflow
        </p>
      </div>

      {/* Category Field */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          id="category"
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 sm:text-sm"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Categorize your workflow for easier organization
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          placeholder="Describe the purpose and use case for this workflow..."
          className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 sm:text-sm resize-none"
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Help team members understand when and how to use this workflow
        </p>
      </div>

      {/* Tags Field */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Tags
        </label>
        <input
          type="text"
          name="tags"
          id="tags"
          placeholder="e.g., intake, clients, onboarding (comma-separated)"
          className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 sm:text-sm"
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Add tags to help with searching and filtering (comma-separated)
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Link
          href="/workflows/templates"
          className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? 'Creating...' : 'Create Workflow'}
        </button>
      </div>
    </form>
  );
}
