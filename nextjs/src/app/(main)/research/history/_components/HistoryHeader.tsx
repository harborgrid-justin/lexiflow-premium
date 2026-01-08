'use client';

/**
 * History Header Component
 * Header with filters for research history page
 *
 * @module research/history/_components/HistoryHeader
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { clearResearchHistory } from '../../actions';

interface HistoryHeaderProps {
  total: number;
  filter?: string;
  dateFrom?: string;
  dateTo?: string;
}

const FILTER_OPTIONS = [
  { value: '', label: 'All Activity' },
  { value: 'search', label: 'Searches' },
  { value: 'view', label: 'Views' },
  { value: 'bookmark', label: 'Bookmarks' },
  { value: 'export', label: 'Exports' },
];

export function HistoryHeader({
  total,
  filter,
  dateFrom,
  dateTo,
}: HistoryHeaderProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom || '');
  const [localDateTo, setLocalDateTo] = useState(dateTo || '');
  const [isClearing, setIsClearing] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    if (localDateFrom) params.set('dateFrom', localDateFrom);
    if (localDateTo) params.set('dateTo', localDateTo);

    router.push(`/research/history?${params.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setLocalDateFrom('');
    setLocalDateTo('');
    router.push('/research/history');
    setShowFilters(false);
  };

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear your research history? This action cannot be undone.'
    );
    if (!confirmed) return;

    setIsClearing(true);
    await clearResearchHistory();
    router.refresh();
    setIsClearing(false);
  };

  const hasActiveFilters = filter || dateFrom || dateTo;

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Research
        </Link>

        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Research History
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {total} {total === 1 ? 'entry' : 'entries'} in your research trail
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {[filter, dateFrom, dateTo].filter(Boolean).length}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showFilters ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Clear History */}
            <button
              onClick={handleClearHistory}
              disabled={isClearing || total === 0}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? 'Clearing...' : 'Clear History'}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Activity Type
                </label>
                <select
                  value={filter || ''}
                  onChange={(e) => {
                    const params = new URLSearchParams();
                    if (e.target.value) params.set('filter', e.target.value);
                    if (localDateFrom) params.set('dateFrom', localDateFrom);
                    if (localDateTo) params.set('dateTo', localDateTo);
                    router.push(`/research/history?${params.toString()}`);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  From Date
                </label>
                <input
                  type="date"
                  value={localDateFrom}
                  onChange={(e) => setLocalDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  To Date
                </label>
                <input
                  type="date"
                  value={localDateTo}
                  onChange={(e) => setLocalDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
