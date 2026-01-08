'use client';

/**
 * Saved Searches List Component
 * Displays and manages saved searches
 *
 * @module research/saved/_components/SavedSearchesList
 */

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  BellOff,
  Play,
  Trash2,
  Edit2,
  MoreHorizontal,
  Clock,
  Filter,
  Calendar,
} from 'lucide-react';
import type { SavedSearch } from '@/types/research';
import {
  executeSavedSearch,
  deleteSavedSearch,
  toggleSearchAlert,
  updateSavedSearch,
} from '../../actions';

interface SavedSearchesListProps {
  savedSearches: SavedSearch[];
  executeSearchId?: string;
}

export function SavedSearchesList({
  savedSearches,
  executeSearchId,
}: SavedSearchesListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);

  // Auto-execute search if requested via URL
  useEffect(() => {
    if (executeSearchId) {
      handleExecute(executeSearchId);
    }
  }, [executeSearchId]);

  const handleExecute = async (id: string) => {
    setExecutingId(id);
    startTransition(async () => {
      const result = await executeSavedSearch(id);
      if (result.success) {
        // Navigate to search results
        const search = savedSearches.find((s) => s.id === id);
        if (search) {
          router.push(`/research?q=${encodeURIComponent(search.query)}`);
        }
      }
      setExecutingId(null);
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this saved search?')) return;

    startTransition(async () => {
      await deleteSavedSearch(id);
      router.refresh();
    });
  };

  const handleToggleAlert = async (id: string, enabled: boolean) => {
    startTransition(async () => {
      await toggleSearchAlert(id, enabled, enabled ? 'daily' : undefined);
      router.refresh();
    });
  };

  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-16">
        <Search className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No saved searches
        </h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Save your searches to quickly run them again later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedSearches.map((search) => (
        <div
          key={search.id}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div
                className={`p-3 rounded-lg ${
                  search.alertEnabled
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                {search.alertEnabled ? (
                  <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Search className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {search.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono truncate">
                  {search.query}
                </p>

                {/* Meta Info */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Play className="h-3.5 w-3.5" />
                    Run {search.executionCount} times
                  </span>
                  {search.lastExecuted && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Last: {new Date(search.lastExecuted).toLocaleDateString()}
                    </span>
                  )}
                  {search.filters && Object.keys(search.filters).length > 0 && (
                    <span className="flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      {Object.keys(search.filters).length} filters
                    </span>
                  )}
                  {search.alertEnabled && search.alertFrequency && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Bell className="h-3.5 w-3.5" />
                      {search.alertFrequency} alerts
                    </span>
                  )}
                </div>

                {/* Tags */}
                {search.tags && search.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {search.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleExecute(search.id)}
                disabled={isPending || executingId === search.id}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Play className="h-4 w-4" />
                {executingId === search.id ? 'Running...' : 'Run'}
              </button>

              <button
                onClick={() =>
                  handleToggleAlert(search.id, !search.alertEnabled)
                }
                disabled={isPending}
                className={`p-2 rounded-lg transition-colors ${
                  search.alertEnabled
                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
                }`}
                title={search.alertEnabled ? 'Disable alerts' : 'Enable alerts'}
              >
                {search.alertEnabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() =>
                    setActiveMenuId(activeMenuId === search.id ? null : search.id)
                  }
                  className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {activeMenuId === search.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        // Edit functionality would open a modal
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                    <button
                      onClick={() => {
                        handleDelete(search.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
