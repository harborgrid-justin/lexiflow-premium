/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Legal Research Domain - View Component
 * Enterprise React Architecture Pattern
 */

import { BookOpen, History, Scale, Search } from 'lucide-react';
import React, { useId } from 'react';

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { EmptyState } from '@/routes/_shared/EmptyState';

import { useResearch } from './ResearchProvider';

import type { Citation, ResearchQuery } from '@/types';


export function ResearchView() {
  const {
    recentSearches,
    savedResearch,
    citations,
    metrics,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    isPending
  } = useResearch();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Legal Research"
        subtitle="AI-powered case law search, statutes, and legal analysis"
        actions={
          <Button variant="primary" size="md">
            <BookOpen className="w-4 h-4" />
            Save Research
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Searches"
          value={metrics.totalSearches}
        />
        <MetricCard
          icon={<BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Saved Queries"
          value={metrics.savedQueries}
        />
        <MetricCard
          icon={<Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          label="Citations"
          value={metrics.totalCitations}
        />
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <label htmlFor={searchId} className="sr-only">Search legal cases</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id={searchId}
            type="search"
            placeholder="Search cases, statutes, regulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 border-b border-slate-200 dark:border-slate-700">
        <TabButton
          active={activeView === 'search'}
          onClick={() => setActiveView('search')}
        >
          <Search className="w-4 h-4" />
          Search
        </TabButton>
        <TabButton
          active={activeView === 'history'}
          onClick={() => setActiveView('history')}
        >
          <History className="w-4 h-4" />
          History ({recentSearches.length})
        </TabButton>
        <TabButton
          active={activeView === 'citations'}
          onClick={() => setActiveView('citations')}
        >
          <Scale className="w-4 h-4" />
          Citations ({citations.length})
        </TabButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && activeView === 'search' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Start Your Legal Research
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Search millions of cases, statutes, and regulations with AI-powered analysis
              </p>
            </div>

            {savedResearch.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Saved Research
                </h3>
                <div className="space-y-3">
                  {savedResearch.slice(0, 5).map(query => (
                    <QueryCard key={query.id} query={query} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isPending && activeView === 'history' && (
          <div className="max-w-4xl mx-auto">
            {recentSearches.length === 0 ? (
              <EmptyState
                icon={History}
                title="No search history found"
                message="Your search history will appear here"
              />
            ) : (
              <div className="space-y-3">
                {recentSearches.map(query => (
                  <QueryCard key={query.id} query={query} />
                ))}
              </div>
            )}
          </div>
        )}

        {!isPending && activeView === 'citations' && (
          <div className="max-w-4xl mx-auto">
            {citations.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No citations found"
                message="Add citations from your research to save them here"
              />
            ) : (
              <div className="space-y-3">
                {citations.map(citation => (
                  <CitationCard key={citation.id} citation={citation} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sub-components
 */

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${active
        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
    >
      {children}
    </button>
  );
}

function QueryCard({ query }: { query: ResearchQuery }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-white mb-1">
            {query.query}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {query.jurisdiction} • {new Date(query.timestamp || query.createdAt).toLocaleDateString()}
          </div>
        </div>
        <Button variant="outline" size="sm">
          View Results
        </Button>
      </div>
    </div>
  );
}

function CitationCard({ citation }: { citation: Citation }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="font-medium text-slate-900 dark:text-white mb-2">
        {citation.caseName || citation.title}
      </div>
      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
        {citation.citation}
      </div>
      {citation.summary && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {citation.summary}
        </div>
      )}
    </div>
  );
}
