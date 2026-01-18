/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * DAF (Document Assembly Framework) Domain - View Component
 */

import { FileStack, Plus } from 'lucide-react';
import React, { useId } from 'react';

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { EmptyState } from '@/routes/_shared/EmptyState';

import { useDAF } from './DAFProvider';

export function DAFView() {
  const { templates, complexityFilter, setComplexityFilter, searchTerm, setSearchTerm, isPending } = useDAF();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Document Assembly"
        subtitle="Automated document generation templates"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            New Template
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search templates</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <FilterButton active={complexityFilter === 'all'} onClick={() => setComplexityFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={complexityFilter === 'Simple'} onClick={() => setComplexityFilter('Simple')}>
            Simple
          </FilterButton>
          <FilterButton active={complexityFilter === 'Moderate'} onClick={() => setComplexityFilter('Moderate')}>
            Moderate
          </FilterButton>
          <FilterButton active={complexityFilter === 'Complex'} onClick={() => setComplexityFilter('Complex')}>
            Complex
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
            {templates.length === 0 ? (
              <EmptyState
                icon={FileStack}
                title="No templates found"
                message="Create your first document assembly template to get started"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <TemplateCard key={template.id} template={template} />
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
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type AssemblyTemplate = {
  id: string;
  name: string;
  category: string;
  fields: number;
  complexity: 'Simple' | 'Moderate' | 'Complex';
  usageCount: number;
  lastUsed?: string;
};

const complexityColors = {
  Simple: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Complex: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

function TemplateCard({ template }: { template: AssemblyTemplate }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileStack className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className={`px-2 py-1 rounded text-xs font-medium ${complexityColors[template.complexity]}`}>
            {template.complexity}
          </span>
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
        {template.name}
      </h3>
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        {template.category}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">
          {template.fields} fields
        </span>
        <span className="text-slate-600 dark:text-slate-400">
          Used {template.usageCount}×
        </span>
      </div>
    </div>
  );
}
