/**
 * Case Parties Route
 *
 * Displays parties involved in the case (plaintiffs, defendants, counsel).
 * - Server-side data loading via loader
 * - Type-safe params via Route types
 * - Party management and editing
 * - Attorney information display
 *
 * @module routes/cases/parties
 */

import { casesApi } from '@/lib/frontend-api';
import { CaseHeader } from '@/routes/cases/ui/components/CaseHeader';
import { PartiesTable } from '@/routes/cases/ui/components/PartiesTable';
import type { Case } from '@/types';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
// import type { Route } from "./+types/parties";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: { caseData: Case } }) {
  const caseTitle = data?.caseData?.title || 'Case Parties';
  return [
    { title: `Parties - ${caseTitle} | LexiFlow` },
    { name: 'description', content: `View and manage parties for ${caseTitle}` },
  ];
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ params }: LoaderFunctionArgs) {
  const { caseId } = params;

  if (!caseId) {
    throw new Response("Case ID is required", { status: 400 });
  }

  // Fetch case and parties using new enterprise API
  const [caseResult, partiesResult] = await Promise.all([
    casesApi.getCaseById(caseId),
    casesApi.getCaseParties(caseId).catch(() => ({ ok: false })),
  ]);

  if (!caseResult.ok) {
    throw new Response("Case Not Found", { status: 404 });
  }

  // Extract parties from result or response
  const parties = partiesResult.ok ? partiesResult.data.data || partiesResult.data : [];

  return { caseData: caseResult.data, parties };
}

// ============================================================================
// Component
// ============================================================================

export default function CasePartiesRoute() {
  const { caseData, parties } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  // Count parties by type
  interface Party { type: string }
  const plaintiffCount = parties.filter((p: Party) =>
    p.type === 'Plaintiff' || p.type === 'Petitioner' || p.type === 'Appellant'
  ).length;

  const defendantCount = parties.filter((p: Party) =>
    p.type === 'Defendant' || p.type === 'Respondent' || p.type === 'Appellee'
  ).length;

  const witnessCount = parties.filter((p: Party) =>
    p.type === 'Witness' || p.type === 'Expert Witness'
  ).length;

  return (
    <div style={{ backgroundColor: 'var(--color-background)' }} className="min-h-full">
      {/* Case Header */}
      <CaseHeader case={caseData} showBreadcrumbs />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 style={{ color: 'var(--color-text)' }} className="text-2xl font-bold">Parties & Counsel</h2>
            <p style={{ color: 'var(--color-textMuted)' }} className="mt-1 text-sm">
              {parties.length} parties involved in this case
            </p>
          </div>

          {/* Add Party Button */}
          <button
            onClick={() => {
              // Handle add party
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Party</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* Plaintiffs/Petitioners */}
          <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--color-textMuted)' }} className="text-sm font-medium">Plaintiffs</p>
                <p style={{ color: 'var(--color-text)' }} className="mt-1 text-2xl font-semibold">{plaintiffCount}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Defendants/Respondents */}
          <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--color-textMuted)' }} className="text-sm font-medium">Defendants</p>
                <p style={{ color: 'var(--color-text)' }} className="mt-1 text-2xl font-semibold">{defendantCount}</p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Witnesses */}
          <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--color-textMuted)' }} className="text-sm font-medium">Witnesses</p>
                <p style={{ color: 'var(--color-text)' }} className="mt-1 text-2xl font-semibold">{witnessCount}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Parties Table */}
        <PartiesTable
          parties={parties}
          onSelectParty={(party) => {
            // Handle party selection
            console.log('Selected party:', party);
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Parties"
      message="We couldn't load the parties for this case."
      backTo="/cases"
      backLabel="Back to Cases"
      onRetry={() => window.location.reload()}
    />
  );
}
