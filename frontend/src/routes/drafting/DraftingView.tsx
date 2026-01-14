/**
 * Drafting Domain - View Component
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { Eye, FileCheck, FileEdit, PenTool, Plus } from 'lucide-react';
import React, { useId } from 'react';
import { useDrafting } from './DraftingProvider';

export function DraftingView() {
  const { drafts, statusFilter, setStatusFilter, searchTerm, setSearchTerm, metrics, isPending } = useDrafting();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Document Drafting"
        subtitle="Create and manage legal documents"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            New Draft
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Drafts"
          value={metrics.totalDrafts}
        />
        <MetricCard
          icon={<Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="In Review"
          value={metrics.inReview}
        />
        <MetricCard
          icon={<FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Finalized"
          value={metrics.finalizedCount}
        />
      </div>

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search drafts</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search drafts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={statusFilter === 'Draft'} onClick={() => setStatusFilter('Draft')}>
            <FileEdit className="w-4 h-4" />
            Draft
          </FilterButton>
          <FilterButton active={statusFilter === 'Review'} onClick={() => setStatusFilter('Review')}>
            <Eye className="w-4 h-4" />
            Review
          </FilterButton>
          <FilterButton active={statusFilter === 'Final'} onClick={() => setStatusFilter('Final')}>
            <FileCheck className="w-4 h-4" />
            Final
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
            {drafts.map(draft => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
            {drafts.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No drafts found
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type DraftDocument = {
  id: string;
  title: string;
  type: string;
  status: 'Draft' | 'Review' | 'Final';
  caseId?: string;
  author: string;
  wordCount: number;
  lastModified: string;
};

const statusColors = {
  Draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Final: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

function DraftCard({ draft }: { draft: DraftDocument }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[draft.status]}`}>
            {draft.status}
          </span>
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
        {draft.title}
      </h3>
      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-3">
        <div>Type: {draft.type}</div>
        <div>Author: {draft.author}</div>
        <div>Word Count: {draft.wordCount.toLocaleString()}</div>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-500">
        Modified: {new Date(draft.lastModified).toLocaleDateString()}
      </div>
    </div>
  );
}
