/**
 * Visual Workflow Builder Page
 *
 * Drag-and-drop interface for creating and editing workflow templates.
 * Features node-based workflow design with connection mapping.
 *
 * Next.js 16 Compliance:
 * - Async searchParams handling
 * - Client Component for interactivity
 * - Server Actions for persistence
 *
 * @module app/(main)/workflows/builder/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getWorkflowTemplate } from '../actions';
import { WorkflowBuilderClient } from './client';
import type { WorkflowTemplate } from '@/types/workflow-schemas';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Workflow Builder | LexiFlow',
  description: 'Design and edit workflow templates with a visual drag-and-drop interface.',
};

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    template?: string;
  }>;
}

// =============================================================================
// Builder Wrapper Component
// =============================================================================

async function BuilderWrapper({ templateId }: { templateId?: string }) {
  let template: WorkflowTemplate | null = null;

  if (templateId) {
    const result = await getWorkflowTemplate(templateId);
    if (result.success && result.data) {
      template = result.data;
    }
  }

  return <WorkflowBuilderClient template={template} />;
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function BuilderSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
      {/* Toolbar Skeleton */}
      <div className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4">
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Canvas Skeleton */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-8">
          <div className="h-full w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-4 animate-pulse" />
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-2 animate-pulse" />
              <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function WorkflowBuilderPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const templateId = resolvedParams.template;

  return (
    <Suspense fallback={<BuilderSkeleton />}>
      <BuilderWrapper templateId={templateId} />
    </Suspense>
  );
}
