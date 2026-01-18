/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Citations Domain - View Component
 */

import { BookOpen, Plus, Tag } from 'lucide-react';
import React, { useId } from 'react';

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { EmptyState } from '@/routes/_shared/EmptyState';

import { useCitations } from './CitationsProvider';

export function CitationsView() {
  const { citations, relevanceFilter, setRelevanceFilter, searchTerm, setSearchTerm, isPending } = useCitations();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Legal Citations"
        subtitle="Case law and precedents database"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            Add Citation
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search citations</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search citations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <FilterButton active={relevanceFilter === 'all'} onClick={() => setRelevanceFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={relevanceFilter === 'High'} onClick={() => setRelevanceFilter('High')}>
            High Relevance
          </FilterButton>
          <FilterButton active={relevanceFilter === 'Medium'} onClick={() => setRelevanceFilter('Medium')}>
            Medium Relevance
          </FilterButton>
          <FilterButton active={relevanceFilter === 'Low'} onClick={() => setRelevanceFilter('Low')}>
            Low Relevance
          </FilterButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && (
          <>
            {citations.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No citations found"
                message="Add your first citation to get started with your legal research"
              />
            ) : (
              <div className="space-y-3">
                {citations.map(citation => (
                  <CitationCard key={citation.id} citation={citation} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type Citation = {
  id: string;
  caseTitle: string;
  citation: string;
  year: number;
  court: string;
  jurisdiction: string;
  summary: string;
  relevance: 'High' | 'Medium' | 'Low';
  tags: string[];
};

const relevanceColors = {
  High: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

function CitationCard({ citation }: { citation: Citation }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className={`px-2 py-1 rounded text-xs font-medium ${relevanceColors[citation.relevance]}`}>
            {citation.relevance} Relevance
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500">
          {citation.year}
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
        {citation.caseTitle}
      </h3>
      <div className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-2">
        {citation.citation}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
        {citation.court} • {citation.jurisdiction}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
        {citation.summary}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {citation.tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
