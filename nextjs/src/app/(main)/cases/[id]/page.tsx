/**
 * Case Detail Page - Server Component with Dynamic Route
 * Displays detailed information about a specific case
 */

import { CaseDocuments } from '@/components/cases/CaseDocuments';
import { CaseHeader } from '@/components/cases/CaseHeader';
import { CaseOverview } from '@/components/cases/CaseOverview';
import { CaseTimeline } from '@/components/cases/CaseTimeline';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type { Case } from '@/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface CasePageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: CasePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const caseData = await apiFetch<Case>(API_ENDPOINTS.CASES.DETAIL(id));
    return {
      title: `${caseData.caseNumber} - ${caseData.title}`,
      description: caseData.description || 'Case details',
    };
  } catch (error) {
    return {
      title: 'Case Not Found',
    };
  }
}

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;

  // Fetch case data on the server
  let caseData: Case;
  try {
    caseData = await apiFetch<Case>(API_ENDPOINTS.CASES.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Case Header */}
      <CaseHeader caseData={caseData} />

      {/* Tabs Navigation */}
      <div className="mt-8 border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-8">
          <a href="#overview" className="border-b-2 border-blue-600 pb-4 font-medium text-blue-600">
            Overview
          </a>
          <a href="#documents" className="pb-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
            Documents
          </a>
          <a href="#timeline" className="pb-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50">
            Timeline
          </a>
        </nav>
      </div>

      {/* Content Sections */}
      <div className="mt-8 space-y-8">
        <Suspense fallback={<div>Loading overview...</div>}>
          <CaseOverview caseData={caseData} />
        </Suspense>

        <Suspense fallback={<div>Loading documents...</div>}>
          <CaseDocuments caseId={id} />
        </Suspense>

        <Suspense fallback={<div>Loading timeline...</div>}>
          <CaseTimeline caseId={id} />
        </Suspense>
      </div>
    </div>
  );
}
