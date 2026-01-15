/**
 * Clauses Domain - View Component
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { FileText, Plus, Tag } from 'lucide-react';
import React, { useId } from 'react';
import { useClauses } from './ClausesProvider';

export function ClausesView() {
  const { clauses, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories, isPending } = useClauses();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Clause Library"
        subtitle="Standard clauses and contract language"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            Add Clause
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search clauses</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search clauses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <CategoryButton
            active={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </CategoryButton>
          {categories.map(category => (
            <CategoryButton
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </CategoryButton>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && (
          <div className="space-y-3">
            {clauses.map(clause => (
              <ClauseCard key={clause.id} clause={clause} />
            ))}
            {clauses.length === 0 && (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                No clauses found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryButton({ active, onClick, children }: {
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

type Clause = {
  id: string;
  title: string;
  category: string;
  text: string;
  language: string;
  tags: string[];
  useCount: number;
  lastUsed?: string;
};

function ClauseCard({ clause }: { clause: Clause }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {clause.category}
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500">
          Used {clause.useCount} times
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
        {clause.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
        {clause.text}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {clause.tags.map(tag => (
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
