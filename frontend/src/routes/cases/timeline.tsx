/**
 * Case Timeline Route
 *
 * Displays chronological timeline of case events and milestones.
 * - Server-side data loading via loader
 * - Type-safe params via Route types
 * - Event filtering and search
 * - Add event functionality
 *
 * @module routes/cases/timeline
 */

import { casesApi, docketApi, documentsApi } from '@/lib/frontend-api';
import { CaseHeader } from '@/routes/cases/ui/components/CaseHeader';
import { CaseTimeline, type TimelineEvent } from '@/routes/cases/ui/components/CaseTimeline';
import type { Case } from '@/types';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: { caseData: Case } }) {
  const caseTitle = data?.caseData?.title || 'Case Timeline';
  return [
    { title: `Timeline - ${caseTitle} | LexiFlow` },
    { name: 'description', content: `View timeline and events for ${caseTitle}` },
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

  // Fetch case and related timeline data using new enterprise API
  const [caseResult, docketResult, docsResult] = await Promise.all([
    casesApi.getCaseById(caseId),
    docketApi.getEntriesByCase(caseId).catch(() => ({ ok: false })),
    documentsApi.getDocumentsByCase(caseId).catch(() => ({ ok: false })),
  ]);

  if (!caseResult.ok) {
    throw new Response("Case Not Found", { status: 404 });
  }

  const caseData = caseResult.data;
  const docketEntries = docketResult.ok ? docketResult.data.data : [];
  const documents = docsResult.ok ? docsResult.data.data : [];

  // Construct timeline events from various sources
  const events: TimelineEvent[] = [
    // Case filing event
    {
      id: `case-filed-${caseId}`,
      type: 'filing',
      title: 'Case Filed',
      description: caseData.title,
      date: caseData.filingDate,
      user: caseData.leadAttorneyId || 'System',
    },
    // Docket entries as events
    ...docketEntries.map((entry: { id: string; title?: string; description: string; filingDate?: string; createdAt: string; filedBy: string; docketNumber?: string }) => ({
      id: entry.id,
      type: 'filing' as const,
      title: entry.title || entry.description,
      description: entry.description,
      date: entry.filingDate || entry.createdAt,
      user: entry.filedBy,
      metadata: {
        docketNumber: entry.docketNumber,
      },
    })),
    // Document events
    ...documents.slice(0, 10).map((doc: { id: string; title: string; description: string; createdAt: string; createdBy: string; type: string }) => ({
      id: doc.id,
      type: 'document' as const,
      title: `Document Added: ${doc.title}`,
      description: doc.description,
      date: doc.createdAt,
      user: doc.createdBy,
      metadata: {
        type: doc.type,
      },
    })),
  ];

  // Add trial date if exists
  if (caseData.trialDate) {
    events.push({
      id: `trial-${caseId}`,
      type: 'hearing',
      title: 'Trial Date Scheduled',
      description: `Trial scheduled at ${caseData.court || 'court'}`,
      date: caseData.trialDate,
      user: 'Court',
    });
  }

  return { caseData, events };
}

// ============================================================================
// Component
// ============================================================================

export default function CaseTimelineRoute() {
  const { caseData, events } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <div style={{ backgroundColor: 'var(--color-background)' }} className="min-h-full">
      {/* Case Header */}
      <CaseHeader case={caseData} showBreadcrumbs />

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 style={{ color: 'var(--color-text)' }} className="text-2xl font-bold">Case Timeline</h2>
            <p style={{ color: 'var(--color-textMuted)' }} className="mt-1 text-sm">
              Chronological view of case events and milestones
            </p>
          </div>

          {/* Add Event Button */}
          <button
            onClick={() => {
              // Handle add event
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Event</span>
          </button>
        </div>

        {/* Timeline */}
        <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-6">
          <CaseTimeline events={events} showFilters />
        </div>
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
      title="Failed to Load Timeline"
      message="We couldn't load the timeline for this case."
      backTo="/cases"
      backLabel="Back to Cases"
      onRetry={() => window.location.reload()}
    />
  );
}
