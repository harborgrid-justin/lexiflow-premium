/**
 * Research Dashboard Page - Server Component
 * Main entry point for Legal Research module
 *
 * Next.js 16 Compliance:
 * - Async Server Component
 * - Suspense boundaries for streaming
 * - generateMetadata for SEO
 * - Server-side data fetching
 *
 * @module research/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { API_BASE_URL, API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type {
  ResearchDashboardData,
  ResearchProject,
  ResearchSessionEntity,
  ResearchBookmark,
  SavedSearch,
  ResearchStatistics,
} from '@/types/research';
import { ResearchDashboard } from './_components/ResearchDashboard';
import { ResearchSearchSection } from './_components/ResearchSearchSection';
import { RecentActivity } from './_components/RecentActivity';
import { QuickActions } from './_components/QuickActions';
import { ResearchStats } from './_components/ResearchStats';
import { ResearchDashboardSkeleton } from './_components/skeletons';

export const metadata: Metadata = {
  title: 'Legal Research | LexiFlow',
  description:
    'AI-powered legal research platform for case law, statutes, citations, and secondary sources',
  keywords: [
    'legal research',
    'case law',
    'statutes',
    'citations',
    'Shepards',
    'KeyCite',
    'legal database',
  ],
  openGraph: {
    title: 'Legal Research | LexiFlow',
    description: 'AI-powered legal research platform',
    type: 'website',
  },
};

// Dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

/**
 * Fetch research dashboard data from API
 */
async function getResearchDashboardData(): Promise<ResearchDashboardData | null> {
  try {
    // Fetch data in parallel for better performance
    const [projectsRes, sessionsRes, bookmarksRes, savedSearchesRes] =
      await Promise.allSettled([
        fetch(`${API_BASE_URL}/research/projects?limit=5&status=in_progress`, {
          next: { tags: ['research-projects'] },
        }),
        fetch(`${API_BASE_URL}/research/sessions?limit=10`, {
          next: { tags: ['research-sessions'] },
        }),
        fetch(`${API_BASE_URL}/research/bookmarks?limit=10`, {
          next: { tags: ['research-bookmarks'] },
        }),
        fetch(`${API_BASE_URL}/research/saved-searches?limit=5&alertEnabled=true`, {
          next: { tags: ['research-saved-searches'] },
        }),
      ]);

    const recentProjects: ResearchProject[] =
      projectsRes.status === 'fulfilled' && projectsRes.value.ok
        ? await projectsRes.value.json()
        : [];

    const recentSessions: ResearchSessionEntity[] =
      sessionsRes.status === 'fulfilled' && sessionsRes.value.ok
        ? await sessionsRes.value.json()
        : [];

    const recentBookmarks: ResearchBookmark[] =
      bookmarksRes.status === 'fulfilled' && bookmarksRes.value.ok
        ? await bookmarksRes.value.json()
        : [];

    const pendingAlerts: SavedSearch[] =
      savedSearchesRes.status === 'fulfilled' && savedSearchesRes.value.ok
        ? await savedSearchesRes.value.json()
        : [];

    // Calculate statistics
    const statistics: ResearchStatistics = {
      totalProjects: Array.isArray(recentProjects) ? recentProjects.length : 0,
      activeProjects: Array.isArray(recentProjects)
        ? recentProjects.filter((p) => p.status === 'in_progress').length
        : 0,
      totalSessions: Array.isArray(recentSessions) ? recentSessions.length : 0,
      sessionsThisWeek: Array.isArray(recentSessions)
        ? recentSessions.filter((s) => {
            const sessionDate = new Date(s.timestamp);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate >= weekAgo;
          }).length
        : 0,
      totalBookmarks: Array.isArray(recentBookmarks) ? recentBookmarks.length : 0,
      totalSavedSearches: Array.isArray(pendingAlerts) ? pendingAlerts.length : 0,
      totalHours: 0,
      topTopics: [],
      topSources: [],
      recentActivityCount: 0,
    };

    return {
      statistics,
      recentProjects: Array.isArray(recentProjects) ? recentProjects : [],
      recentSessions: Array.isArray(recentSessions) ? recentSessions : [],
      recentBookmarks: Array.isArray(recentBookmarks) ? recentBookmarks : [],
      pendingAlerts: Array.isArray(pendingAlerts) ? pendingAlerts : [],
    };
  } catch (error) {
    console.error('Failed to fetch research dashboard data:', error);
    return null;
  }
}

/**
 * Research Dashboard Page Component
 */
export default async function ResearchPage() {
  const dashboardData = await getResearchDashboardData();

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Legal Research
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Search case law, statutes, regulations, and secondary sources
              </p>
            </div>
            <QuickActions />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search Section */}
          <Suspense fallback={<SearchSkeleton />}>
            <ResearchSearchSection />
          </Suspense>

          {/* Statistics Cards */}
          <Suspense fallback={<StatsSkeleton />}>
            <ResearchStats statistics={dashboardData?.statistics} />
          </Suspense>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Dashboard Area */}
            <div className="lg:col-span-2">
              <Suspense fallback={<ResearchDashboardSkeleton />}>
                <ResearchDashboard
                  recentProjects={dashboardData?.recentProjects || []}
                  recentSessions={dashboardData?.recentSessions || []}
                  pendingAlerts={dashboardData?.pendingAlerts || []}
                />
              </Suspense>
            </div>

            {/* Sidebar - Recent Activity */}
            <div className="lg:col-span-1">
              <Suspense fallback={<ActivitySkeleton />}>
                <RecentActivity
                  sessions={dashboardData?.recentSessions || []}
                  bookmarks={dashboardData?.recentBookmarks || []}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Skeleton Components for Suspense

function SearchSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32" />
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
        >
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
