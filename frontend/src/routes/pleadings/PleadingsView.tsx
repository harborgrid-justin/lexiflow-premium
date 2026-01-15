/**
 * Pleadings Domain - View Component
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { FileCheck, FilePenLine, FileText, Plus } from 'lucide-react';
import React, { useId } from 'react';
import { usePleadings } from './PleadingsProvider';

export function PleadingsView() {
  const { pleadings, statusFilter, setStatusFilter, searchTerm, setSearchTerm, metrics, isPending } = usePleadings();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Pleadings"
        subtitle="Legal pleading and motion management"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            New Pleading
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Pleadings"
          value={metrics.totalPleadings}
        />
        <MetricCard
          icon={<FilePenLine className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Drafts"
          value={metrics.draftCount}
        />
        <MetricCard
          icon={<FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Filed"
          value={metrics.filedCount}
        />
      </div>

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search pleadings</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search pleadings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={statusFilter === 'Draft'} onClick={() => setStatusFilter('Draft')}>
            Draft
          </FilterButton>
          <FilterButton active={statusFilter === 'Filed'} onClick={() => setStatusFilter('Filed')}>
            Filed
          </FilterButton>
          <FilterButton active={statusFilter === 'Approved'} onClick={() => setStatusFilter('Approved')}>
            Approved
          </FilterButton>
          <FilterButton active={statusFilter === 'Rejected'} onClick={() => setStatusFilter('Rejected')}>
            Rejected
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pleadings.map(pleading => (
              <PleadingCard key={pleading.id} pleading={pleading} />
            ))}
            {pleadings.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No pleadings found
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

type Pleading = {
  id: string;
  title: string;
  type: string;
  caseId: string;
  filedDate: string;
  status: 'Draft' | 'Filed' | 'Approved' | 'Rejected';
  documentId?: string;
};

const statusColors = {
  Draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Filed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

function PleadingCard({ pleading }: { pleading: Pleading }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[pleading.status]}`}>
            {pleading.status}
          </span>
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
        {pleading.title}
      </h3>
      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
        <div>Type: {pleading.type}</div>
        <div>Filed: {new Date(pleading.filedDate).toLocaleDateString()}</div>
      </div>
    </div>
  );
}
