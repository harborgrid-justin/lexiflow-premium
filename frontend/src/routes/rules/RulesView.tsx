/**
 * Rules Domain - View Component
 */

import { PageHeader } from '@/components/organisms/PageHeader';
import { Scale } from 'lucide-react';
import React, { useId } from 'react';
import { useRules } from './RulesProvider';

export function RulesView() {
  const { rules, searchTerm, setSearchTerm, selectedJurisdiction, setSelectedJurisdiction, jurisdictions, isPending } = useRules();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Court Rules"
        subtitle="Procedural rules and regulations"
      />

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search rules</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <FilterButton
            active={selectedJurisdiction === null}
            onClick={() => setSelectedJurisdiction(null)}
          >
            All Jurisdictions
          </FilterButton>
          {jurisdictions.map(jurisdiction => (
            <FilterButton
              key={jurisdiction}
              active={selectedJurisdiction === jurisdiction}
              onClick={() => setSelectedJurisdiction(jurisdiction)}
            >
              {jurisdiction}
            </FilterButton>
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
            {rules.map(rule => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
            {rules.length === 0 && (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                No rules found
              </div>
            )}
          </div>
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

type CourtRule = {
  id: string;
  number: string;
  title: string;
  court: string;
  jurisdiction: string;
  category: string;
  text: string;
  lastUpdated: string;
};

function RuleCard({ rule }: { rule: CourtRule }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
              {rule.number}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {rule.category}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            {rule.title}
          </h3>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {rule.court} • {rule.jurisdiction}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {rule.text}
          </p>
        </div>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-500">
        Updated: {new Date(rule.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  );
}
