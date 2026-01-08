/**
 * Create New Workflow Template Page
 *
 * Form for creating a new workflow template with basic configuration.
 *
 * Next.js 16 Compliance:
 * - Server Actions for form submission
 * - Client Component for form interactivity
 *
 * @module app/(main)/workflows/templates/new/page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createTemplateFormAction } from '../../actions';
import { WORKFLOW_CATEGORIES } from '@/types/workflow-schemas';
import { NewTemplateForm } from './form';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Create New Workflow | LexiFlow',
  description: 'Create a new workflow template for legal process automation.',
};

// =============================================================================
// Main Page Component
// =============================================================================

export default function NewWorkflowTemplatePage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/workflows/templates"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create New Workflow
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Define the basic information for your workflow template. You can add steps and
            configure details after creation.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Workflow Details
            </h2>
          </div>
          <div className="p-6">
            <NewTemplateForm action={createTemplateFormAction} categories={WORKFLOW_CATEGORIES} />
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Tips for Creating Effective Workflows
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">1.</span>
              <span>Use clear, descriptive names that indicate the workflow purpose</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">2.</span>
              <span>Choose the appropriate category to help organize your templates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">3.</span>
              <span>Add a detailed description to help team members understand when to use it</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">4.</span>
              <span>After creation, use the visual builder to design your workflow steps</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
