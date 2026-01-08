'use client';

/**
 * Saved Page Header Component
 * Tab navigation and actions for saved searches/bookmarks
 *
 * @module research/saved/_components/SavedPageHeader
 */

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Bookmark, Plus } from 'lucide-react';

interface SavedPageHeaderProps {
  activeTab: string;
  searchCount: number;
  bookmarkCount: number;
}

export function SavedPageHeader({
  activeTab,
  searchCount,
  bookmarkCount,
}: SavedPageHeaderProps) {
  const router = useRouter();

  const tabs = [
    { id: 'searches', label: 'Saved Searches', icon: Search, count: searchCount },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: bookmarkCount },
  ];

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Research
        </Link>

        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Saved Research
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Manage your saved searches and bookmarks
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={`/research/saved?tab=${tab.id}`}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
