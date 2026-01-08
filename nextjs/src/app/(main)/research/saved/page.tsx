/**
 * Saved Searches Page - Server Component
 * Displays saved searches and bookmarks
 *
 * Next.js 16 Compliance:
 * - Async Server Component
 * - Async searchParams handling
 * - Suspense boundaries for streaming
 * - generateMetadata for SEO
 *
 * @module research/saved/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import type {
  SavedSearch,
  ResearchBookmark,
  ResearchFolder,
} from '@/types/research';
import { SavedSearchesList } from './_components/SavedSearchesList';
import { BookmarksList } from './_components/BookmarksList';
import { SavedPageHeader } from './_components/SavedPageHeader';
import { SavedSearchesSkeleton } from '../_components/skeletons';

interface SavedPageProps {
  searchParams: Promise<{
    tab?: string;
    execute?: string;
    folder?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Saved Searches & Bookmarks | LexiFlow',
  description: 'Manage your saved searches and research bookmarks',
};

export const dynamic = 'force-dynamic';

/**
 * Fetch saved searches
 */
async function getSavedSearches(): Promise<SavedSearch[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/saved-searches`, {
      next: { tags: ['research-saved-searches'] },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch bookmarks
 */
async function getBookmarks(folderId?: string): Promise<ResearchBookmark[]> {
  try {
    const url = folderId
      ? `${API_BASE_URL}/research/bookmarks?folderId=${folderId}`
      : `${API_BASE_URL}/research/bookmarks`;
    const response = await fetch(url, {
      next: { tags: ['research-bookmarks'] },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch {
    return [];
  }
}

/**
 * Fetch folders
 */
async function getFolders(): Promise<ResearchFolder[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/research/folders`, {
      next: { tags: ['research-folders'] },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch {
    return [];
  }
}

/**
 * Saved Searches Page Component
 */
export default async function SavedPage({ searchParams }: SavedPageProps) {
  // Await searchParams as required by Next.js 16
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || 'searches';
  const executeSearchId = resolvedParams.execute;
  const folderId = resolvedParams.folder;

  // Fetch data in parallel
  const [savedSearches, bookmarks, folders] = await Promise.all([
    getSavedSearches(),
    getBookmarks(folderId),
    getFolders(),
  ]);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <SavedPageHeader
        activeTab={activeTab}
        searchCount={savedSearches.length}
        bookmarkCount={bookmarks.length}
      />

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'searches' ? (
            <Suspense fallback={<SavedSearchesSkeleton />}>
              <SavedSearchesList
                savedSearches={savedSearches}
                executeSearchId={executeSearchId}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<SavedSearchesSkeleton />}>
              <BookmarksList
                bookmarks={bookmarks}
                folders={folders}
                activeFolderId={folderId}
              />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}
