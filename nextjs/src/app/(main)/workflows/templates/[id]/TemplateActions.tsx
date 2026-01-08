'use client';

/**
 * Template Actions Component (Client)
 *
 * Interactive buttons for template operations with client-side confirmation dialogs.
 */

import { cn } from '@/lib/utils';
import type { WorkflowTemplate } from '@/types/workflow-schemas';
import { Edit, Pause, Play, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  changeTemplateStatusFormAction,
  deleteTemplateFormAction,
  startWorkflowFormAction,
} from '../../actions';

interface TemplateActionsProps {
  template: WorkflowTemplate;
}

export function TemplateActions({ template }: TemplateActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Status Toggle */}
      <form action={changeTemplateStatusFormAction}>
        <input type="hidden" name="id" value={template.id} />
        <input
          type="hidden"
          name="action"
          value={template.status === 'active' ? 'deactivate' : 'activate'}
        />
        <button
          type="submit"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            template.status === 'active'
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
          )}
        >
          {template.status === 'active' ? (
            <>
              <Pause className="h-4 w-4" />
              Deactivate
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Activate
            </>
          )}
        </button>
      </form>

      {/* Start Workflow */}
      {template.status === 'active' && (
        <form action={startWorkflowFormAction}>
          <input type="hidden" name="templateId" value={template.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            Start Workflow
          </button>
        </form>
      )}

      {/* Edit in Builder */}
      <Link
        href={`/workflows/builder?template=${template.id}`}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <Edit className="h-4 w-4" />
        Edit
      </Link>

      {/* Delete */}
      <form
        action={deleteTemplateFormAction}
        onSubmit={(e) => {
          if (!confirm('Are you sure you want to delete this template?')) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={template.id} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </form>
    </div>
  );
}
