/**
 * Case Filings Route
 *
 * Displays court filings and docket entries for a case.
 * - Server-side data loading via loader
 * - Type-safe params via Route types
 * - Filing management with deadlines
 * - Status tracking and warnings
 *
 * @module routes/cases/filings
 */

import { CaseHeader } from '@/routes/cases/ui/components/CaseHeader';
import { FilingsTable, type Filing } from '@/routes/cases/ui/components/FilingsTable';
import { DataService } from '@/services/data/dataService';
import type { DocketEntry } from '@/types';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// ============================================================================
// Types
// ============================================================================

type LoaderData = Awaited<ReturnType<typeof loader>>;

interface RouteErrorBoundaryProps {
  error: unknown;
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: LoaderData }) {
  const caseTitle = data?.caseData?.title || 'Case Filings';
  return [
    { title: `Filings - ${caseTitle} | LexiFlow` },
    { name: 'description', content: `View court filings and docket entries for ${caseTitle}` },
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

  // Fetch case and docket entries
  const [caseData, docketEntries] = await Promise.all([
    DataService.cases.get(caseId),
    DataService.docket.getByCaseId(caseId).catch(() => []),
  ]);

  if (!caseData) {
    throw new Response("Case Not Found", { status: 404 });
  }

  // Transform docket entries to filings format
  const filings: Filing[] = docketEntries.map((entry: DocketEntry) => ({
    id: entry.id,
    title: entry.title || entry.description || 'Untitled Filing',
    type: entry.type || 'Document',
    filingDate: entry.dateFiled || entry.createdAt,
    deadline: undefined, // DocketEntry does not have deadline
    status: 'filed', // DocketEntry does not have status
    filedBy: entry.filedBy || 'Unknown',
    docketNumber: entry.docketNumber,
    documentUrl: entry.documentUrl,
    notes: entry.notes || entry.description,
  }));

  return { caseData, filings };
}

// ============================================================================
// Component
// ============================================================================

export default function CaseFilingsRoute() {
  const { caseData, filings } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  // Count filings by status
  const draftCount = filings.filter((f: Filing) => f.status === 'draft').length;
  console.log('draft count:', draftCount);
  const pendingCount = filings.filter((f: Filing) => f.status === 'pending').length;
  const filedCount = filings.filter((f: Filing) => f.status === 'filed').length;

  // Count upcoming deadlines
  const upcomingDeadlines = filings.filter((f: Filing) => {
    if (!f.deadline) return false;
    const deadline = new Date(f.deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 30;
  }).length;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Case Header */}
      <CaseHeader case={caseData} showBreadcrumbs />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Court Filings</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filings.length} filings • {upcomingDeadlines} upcoming deadlines
            </p>
          </div>

          {/* New Filing Button */}
          <button
            onClick={() => {
              // Handle new filing
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Filing</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {/* Total Filings */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{filings.length}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filed */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filed</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{filedCount}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{pendingCount}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deadlines (30d)</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{upcomingDeadlines}</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filings Table */}
        <FilingsTable
          filings={filings}
          onSelectFiling={(filing) => {
            // Handle filing selection
            console.log('Selected filing:', filing);
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: RouteErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Filings"
      message="We couldn't load the filings for this case."
      backTo="/cases"
      backLabel="Back to Cases"
      onRetry={() => window.location.reload()}
    />
  );
}
