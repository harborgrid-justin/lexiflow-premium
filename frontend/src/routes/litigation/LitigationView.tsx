/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Litigation Domain - View Component
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { AlertTriangle, Gavel, Plus, TrendingUp } from 'lucide-react';
import React, { useId } from 'react';
import { useLitigation } from './LitigationProvider';

export function LitigationView() {
  const { matters, stageFilter, setStageFilter, riskFilter, setRiskFilter, searchTerm, setSearchTerm, metrics, isPending } = useLitigation();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Litigation Management"
        subtitle="Track cases, strategies, and risk assessment"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            New Matter
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<Gavel className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Matters"
          value={metrics.totalMatters}
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Active"
          value={metrics.activeMatters}
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          label="High Risk"
          value={metrics.highRiskCount}
        />
      </div>

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search litigation matters</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search litigation matters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <FilterButton active={stageFilter === 'all'} onClick={() => setStageFilter('all')}>
              All Stages
            </FilterButton>
            <FilterButton active={stageFilter === 'Discovery'} onClick={() => setStageFilter('Discovery')}>
              Discovery
            </FilterButton>
            <FilterButton active={stageFilter === 'Pre-Trial'} onClick={() => setStageFilter('Pre-Trial')}>
              Pre-Trial
            </FilterButton>
            <FilterButton active={stageFilter === 'Trial'} onClick={() => setStageFilter('Trial')}>
              Trial
            </FilterButton>
            <FilterButton active={stageFilter === 'Appeal'} onClick={() => setStageFilter('Appeal')}>
              Appeal
            </FilterButton>
          </div>

          <div className="flex gap-2">
            <FilterButton active={riskFilter === 'all'} onClick={() => setRiskFilter('all')}>
              All Risk Levels
            </FilterButton>
            <FilterButton active={riskFilter === 'Low'} onClick={() => setRiskFilter('Low')}>
              Low Risk
            </FilterButton>
            <FilterButton active={riskFilter === 'Medium'} onClick={() => setRiskFilter('Medium')}>
              Medium Risk
            </FilterButton>
            <FilterButton active={riskFilter === 'High'} onClick={() => setRiskFilter('High')}>
              High Risk
            </FilterButton>
          </div>
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
            {matters.map(matter => (
              <LitigationCard key={matter.id} matter={matter} />
            ))}
            {matters.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No litigation matters found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
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

type LitigationMatter = {
  id: string;
  caseId: string;
  caseName: string;
  stage: 'Discovery' | 'Pre-Trial' | 'Trial' | 'Appeal' | 'Closed';
  nextHearing: string;
  strategy: string;
  riskLevel: 'Low' | 'Medium' | 'High';
};

const riskColors = {
  Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  High: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

function LitigationCard({ matter }: { matter: LitigationMatter }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className={`px-2 py-1 rounded text-xs font-medium ${riskColors[matter.riskLevel]}`}>
            {matter.riskLevel} Risk
          </span>
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
        {matter.caseName}
      </h3>
      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-3">
        <div>Stage: {matter.stage}</div>
        <div>Next Hearing: {new Date(matter.nextHearing).toLocaleDateString()}</div>
      </div>
      <div className="text-sm">
        <div className="font-medium text-slate-900 dark:text-white mb-1">Strategy:</div>
        <div className="text-slate-600 dark:text-slate-400 line-clamp-2">
          {matter.strategy}
        </div>
      </div>
    </div>
  );
}
