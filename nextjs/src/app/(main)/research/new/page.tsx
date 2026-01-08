/**
 * New Research Project Page - Server Component
 * Form for creating a new research project
 *
 * Next.js 16 Compliance:
 * - Async Server Component
 * - Server Actions for form submission
 * - generateMetadata for SEO
 *
 * @module research/new/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { NewResearchProjectForm } from './_components/NewResearchProjectForm';

export const metadata: Metadata = {
  title: 'New Research Project | LexiFlow',
  description: 'Create a new legal research project',
};

/**
 * Fetch available cases for linking
 */
async function getAvailableCases(): Promise<Array<{ id: string; title: string; caseNumber: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/cases?limit=100&fields=id,title,caseNumber`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch available matters for linking
 */
async function getAvailableMatters(): Promise<Array<{ id: string; name: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/matters?limit=100&fields=id,name`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch {
    return [];
  }
}

/**
 * New Research Project Page Component
 */
export default async function NewResearchProjectPage() {
  // Fetch available cases and matters in parallel
  const [cases, matters] = await Promise.all([
    getAvailableCases(),
    getAvailableMatters(),
  ]);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            New Research Project
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Create a new legal research project to organize your research
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<FormSkeleton />}>
            <NewResearchProjectForm cases={cases} matters={matters} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}
