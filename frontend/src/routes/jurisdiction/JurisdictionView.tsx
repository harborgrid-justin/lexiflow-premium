/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Jurisdiction Domain - View Component
 */

import { PageHeader } from '@/components/organisms/PageHeader';
import { Building2, Scale } from 'lucide-react';
import React, { useId } from 'react';
import { useJurisdiction } from './JurisdictionProvider';

export function JurisdictionView() {
  const { jurisdictions, typeFilter, setTypeFilter, searchTerm, setSearchTerm, isPending } = useJurisdiction();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Jurisdictions"
        subtitle="Court jurisdiction rules and requirements"
      />

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search jurisdictions</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search jurisdictions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <FilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={typeFilter === 'Federal'} onClick={() => setTypeFilter('Federal')}>
            Federal
          </FilterButton>
          <FilterButton active={typeFilter === 'State'} onClick={() => setTypeFilter('State')}>
            State
          </FilterButton>
          <FilterButton active={typeFilter === 'Local'} onClick={() => setTypeFilter('Local')}>
            Local
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {jurisdictions.map(jurisdiction => (
              <JurisdictionCard key={jurisdiction.id} jurisdiction={jurisdiction} />
            ))}
            {jurisdictions.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No jurisdictions found
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
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type Jurisdiction = {
  id: string;
  name: string;
  type: 'Federal' | 'State' | 'Local';
  court: string;
  rules: string[];
  filingRequirements: string[];
};

const typeColors = {
  Federal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  State: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Local: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

function JurisdictionCard({ jurisdiction }: { jurisdiction: Jurisdiction }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[jurisdiction.type]}`}>
            {jurisdiction.type}
          </span>
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
        {jurisdiction.name}
      </h3>
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
        <Building2 className="w-4 h-4" />
        {jurisdiction.court}
      </div>
      <div className="space-y-2">
        <div className="text-sm">
          <div className="font-medium text-slate-900 dark:text-white mb-1">Rules:</div>
          <div className="text-slate-600 dark:text-slate-400">
            {jurisdiction.rules.length} rule{jurisdiction.rules.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="text-sm">
          <div className="font-medium text-slate-900 dark:text-white mb-1">Filing Requirements:</div>
          <div className="text-slate-600 dark:text-slate-400">
            {jurisdiction.filingRequirements.length} requirement{jurisdiction.filingRequirements.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
