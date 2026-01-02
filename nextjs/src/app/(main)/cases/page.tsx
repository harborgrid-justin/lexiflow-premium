/**
 * Cases Page - Server Component
 * Fetches and displays all cases with filtering and search
 */

import { CaseFilters } from '@/components/cases/CaseFilters';
import { CaseList } from '@/components/cases/CaseList';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Cases',
  description: 'Manage all legal cases',
};

export default function CasesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Cases
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage and track all legal cases
          </p>
        </div>
        <Link
          href="/cases/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Case
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<div>Loading filters...</div>}>
            <CaseFilters />
          </Suspense>
        </aside>

        {/* Cases List */}
        <main className="lg:col-span-3">
          <Suspense fallback={<div>Loading cases...</div>}>
            <CaseList />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
