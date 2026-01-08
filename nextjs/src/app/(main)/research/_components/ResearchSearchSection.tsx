'use client';

/**
 * Research Search Section Component
 * Main search interface for legal research
 *
 * @module research/_components/ResearchSearchSection
 */

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Scale,
  BookOpen,
  FileText,
  Building2,
  Clock,
  X,
  ChevronDown,
} from 'lucide-react';
import type { ResearchSearchFilters, ResearchItemType, LegalDatabaseSource } from '@/types/research';

const ITEM_TYPES: { value: ResearchItemType; label: string; icon: React.ElementType }[] = [
  { value: 'case_law', label: 'Case Law', icon: Scale },
  { value: 'statute', label: 'Statutes', icon: FileText },
  { value: 'regulation', label: 'Regulations', icon: Building2 },
  { value: 'secondary_source', label: 'Secondary Sources', icon: BookOpen },
  { value: 'treatise', label: 'Treatises', icon: BookOpen },
  { value: 'law_review', label: 'Law Reviews', icon: FileText },
];

const JURISDICTIONS = [
  'Federal (All Circuits)',
  'Supreme Court',
  '1st Circuit',
  '2nd Circuit',
  '3rd Circuit',
  '4th Circuit',
  '5th Circuit',
  '6th Circuit',
  '7th Circuit',
  '8th Circuit',
  '9th Circuit',
  '10th Circuit',
  '11th Circuit',
  'D.C. Circuit',
  'Federal Circuit',
  'California',
  'New York',
  'Texas',
  'Florida',
  'Illinois',
];

const DATABASE_SOURCES: { value: LegalDatabaseSource; label: string }[] = [
  { value: 'westlaw', label: 'Westlaw' },
  { value: 'lexisnexis', label: 'LexisNexis' },
  { value: 'courtlistener', label: 'CourtListener' },
  { value: 'google_scholar', label: 'Google Scholar' },
  { value: 'pacer', label: 'PACER' },
  { value: 'internal', label: 'Internal Database' },
];

export function ResearchSearchSection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ResearchSearchFilters>({});
  const [activeTypes, setActiveTypes] = useState<ResearchItemType[]>([]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      const searchParams = new URLSearchParams();
      searchParams.set('q', query);

      if (activeTypes.length > 0) {
        searchParams.set('types', activeTypes.join(','));
      }
      if (filters.jurisdictions?.length) {
        searchParams.set('jurisdictions', filters.jurisdictions.join(','));
      }
      if (filters.sources?.length) {
        searchParams.set('sources', filters.sources.join(','));
      }
      if (filters.dateFrom) {
        searchParams.set('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        searchParams.set('dateTo', filters.dateTo);
      }
      if (filters.validCitationsOnly) {
        searchParams.set('validOnly', 'true');
      }

      startTransition(() => {
        // Navigate to search results (same page with search params)
        router.push(`/research?${searchParams.toString()}`);
      });
    },
    [query, activeTypes, filters, router]
  );

  const toggleItemType = useCallback((type: ResearchItemType) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleFilterChange = useCallback(
    <K extends keyof ResearchSearchFilters>(
      key: K,
      value: ResearchSearchFilters[K]
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setActiveTypes([]);
  }, []);

  const hasActiveFilters =
    activeTypes.length > 0 ||
    (filters.jurisdictions?.length ?? 0) > 0 ||
    (filters.sources?.length ?? 0) > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.validCitationsOnly;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search case law, statutes, or enter a natural language query..."
            className="w-full pl-12 pr-4 py-3.5 text-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={isPending || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Quick Type Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {ITEM_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = activeTypes.includes(type.value);
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleItemType(type.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </button>
            );
          })}

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {activeTypes.length +
                  (filters.jurisdictions?.length || 0) +
                  (filters.sources?.length || 0) +
                  (filters.dateFrom ? 1 : 0) +
                  (filters.dateTo ? 1 : 0) +
                  (filters.validCitationsOnly ? 1 : 0)}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </form>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Jurisdiction Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Jurisdiction
              </label>
              <select
                multiple
                value={filters.jurisdictions || []}
                onChange={(e) =>
                  handleFilterChange(
                    'jurisdictions',
                    Array.from(e.target.selectedOptions, (opt) => opt.value)
                  )
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {/* Database Source Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Database Source
              </label>
              <select
                multiple
                value={filters.sources || []}
                onChange={(e) =>
                  handleFilterChange(
                    'sources',
                    Array.from(
                      e.target.selectedOptions,
                      (opt) => opt.value as LegalDatabaseSource
                    )
                  )
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DATABASE_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) =>
                    handleFilterChange('dateFrom', e.target.value)
                  }
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.validCitationsOnly || false}
                    onChange={(e) =>
                      handleFilterChange('validCitationsOnly', e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Valid citations only
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.includeSecondary || false}
                    onChange={(e) =>
                      handleFilterChange('includeSecondary', e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Include secondary sources
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
