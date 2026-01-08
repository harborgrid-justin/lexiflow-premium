/**
 * Research History Page - Server Component
 * Displays research history and trail
 *
 * Next.js 16 Compliance:
 * - Async Server Component
 * - Async searchParams handling
 * - Suspense boundaries for streaming
 * - generateMetadata for SEO
 *
 * @module research/history/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import type { ResearchSessionEntity, ResearchTrailEntry } from '@/types/research';
import { HistoryTimeline } from './_components/HistoryTimeline';
import { HistoryHeader } from './_components/HistoryHeader';
import { HistorySkeleton } from '../_components/skeletons';

interface HistoryPageProps {
  searchParams: Promise<{
    page?: string;
    filter?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Research History | LexiFlow',
  description: 'View your research history and activity trail',
};

export const dynamic = 'force-dynamic';

/**
 * Fetch research sessions (history)
 */
async function getResearchHistory(
  page: number = 1,
  filter?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{ sessions: ResearchSessionEntity[]; total: number }> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
    });

    if (filter) params.set('filter', filter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    const response = await fetch(
      `${API_BASE_URL}/research/sessions?${params.toString()}`,
      { next: { tags: ['research-sessions', 'research-history'] } }
    );

    if (!response.ok) return { sessions: [], total: 0 };

    const data = await response.json();
    return {
      sessions: Array.isArray(data) ? data : data.data || [],
      total: data.total || (Array.isArray(data) ? data.length : 0),
    };
  } catch {
    return { sessions: [], total: 0 };
  }
}

/**
 * Fetch research trail entries
 */
async function getResearchTrail(limit: number = 50): Promise<ResearchTrailEntry[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/research/trail?limit=${limit}`,
      { next: { tags: ['research-history'] } }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch {
    return [];
  }
}

/**
 * Research History Page Component
 */
export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  // Await searchParams as required by Next.js 16
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const filter = resolvedParams.filter;
  const dateFrom = resolvedParams.dateFrom;
  const dateTo = resolvedParams.dateTo;

  // Fetch history data
  const [historyData, trailEntries] = await Promise.all([
    getResearchHistory(page, filter, dateFrom, dateTo),
    getResearchTrail(),
  ]);

  const { sessions, total } = historyData;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <HistoryHeader
        total={total}
        filter={filter}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-5xl mx-auto">
          <Suspense fallback={<HistorySkeleton />}>
            <HistoryTimeline
              sessions={sessions}
              trailEntries={trailEntries}
              currentPage={page}
              totalPages={totalPages}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
