/**
 * Research Detail Page - Server Component
 * Displays detailed research session or project information
 *
 * Next.js 16 Compliance:
 * - Async params handling with await
 * - Dynamic metadata generation
 * - Suspense boundaries for streaming
 * - Server-side data fetching
 *
 * @module research/[id]/page
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import type {
  ResearchSessionEntity,
  ResearchProject,
  ResearchSearchResult,
  ResearchNote,
} from '@/types/research';
import { ResearchDetailHeader } from './_components/ResearchDetailHeader';
import { ResearchContent } from './_components/ResearchContent';
import { ResearchSidebar } from './_components/ResearchSidebar';
import { ResearchResults } from './_components/ResearchResults';
import { ResearchDetailSkeleton } from '../_components/skeletons';

interface ResearchDetailPageProps {
  params: Promise<{ id: string }>;
}

// Dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

/**
 * Generate metadata dynamically based on research item
 */
export async function generateMetadata({
  params,
}: ResearchDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    // Try to fetch as session first
    const sessionRes = await fetch(`${API_BASE_URL}/research/sessions/${id}`, {
      next: { revalidate: 60 },
    });

    if (sessionRes.ok) {
      const session: ResearchSessionEntity = await sessionRes.json();
      return {
        title: `${session.query} | Research | LexiFlow`,
        description: `Research session: ${session.query}`,
      };
    }

    // Try to fetch as project
    const projectRes = await fetch(`${API_BASE_URL}/research/projects/${id}`, {
      next: { revalidate: 60 },
    });

    if (projectRes.ok) {
      const project: ResearchProject = await projectRes.json();
      return {
        title: `${project.title} | Research | LexiFlow`,
        description: project.description || 'Research project details',
      };
    }

    return {
      title: 'Research Details | LexiFlow',
      description: 'View research session or project details',
    };
  } catch {
    return {
      title: 'Research Details | LexiFlow',
      description: 'View research session or project details',
    };
  }
}

/**
 * Fetch research data (session or project)
 */
async function getResearchData(id: string): Promise<{
  type: 'session' | 'project';
  data: ResearchSessionEntity | ResearchProject;
  notes: ResearchNote[];
} | null> {
  try {
    // Try to fetch as session first
    const sessionRes = await fetch(`${API_BASE_URL}/research/sessions/${id}`, {
      next: { tags: ['research-sessions', `research-session-${id}`] },
    });

    if (sessionRes.ok) {
      const session: ResearchSessionEntity = await sessionRes.json();

      // Fetch notes for the session
      const notesRes = await fetch(
        `${API_BASE_URL}/research/notes?sessionId=${id}`,
        { next: { tags: ['research-notes'] } }
      );
      const notes: ResearchNote[] = notesRes.ok ? await notesRes.json() : [];

      return { type: 'session', data: session, notes };
    }

    // Try to fetch as project
    const projectRes = await fetch(`${API_BASE_URL}/research/projects/${id}`, {
      next: { tags: ['research-projects', `research-project-${id}`] },
    });

    if (projectRes.ok) {
      const project: ResearchProject = await projectRes.json();

      // Fetch notes for the project
      const notesRes = await fetch(
        `${API_BASE_URL}/research/notes?projectId=${id}`,
        { next: { tags: ['research-notes'] } }
      );
      const notes: ResearchNote[] = notesRes.ok ? await notesRes.json() : [];

      return { type: 'project', data: project, notes };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch research data:', error);
    return null;
  }
}

/**
 * Research Detail Page Component
 */
export default async function ResearchDetailPage({
  params,
}: ResearchDetailPageProps) {
  // Await params as required by Next.js 16
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Fetch research data
  const researchData = await getResearchData(id);

  if (!researchData) {
    notFound();
  }

  const { type, data, notes } = researchData;

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <Suspense fallback={<HeaderSkeleton />}>
        <ResearchDetailHeader type={type} data={data} />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Research Content */}
              <Suspense fallback={<ContentSkeleton />}>
                <ResearchContent type={type} data={data} notes={notes} />
              </Suspense>

              {/* Search Results (for sessions) */}
              {type === 'session' && (
                <Suspense fallback={<ResultsSkeleton />}>
                  <ResearchResults
                    results={(data as ResearchSessionEntity).results || []}
                  />
                </Suspense>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Suspense fallback={<SidebarSkeleton />}>
                <ResearchSidebar type={type} data={data} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Skeleton Components

function HeaderSkeleton() {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </header>
  );
}

function ContentSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="py-4 border-b border-slate-200 dark:border-slate-700 last:border-0"
        >
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
