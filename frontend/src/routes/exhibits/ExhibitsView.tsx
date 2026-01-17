/**
 * Exhibits Domain - View Component
 */

import { CheckCircle, Clock, FileText, Image, Mic, Package, Plus, Video } from 'lucide-react';
import React, { useId } from 'react';

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/components/organisms/PageHeader';

import { useExhibits } from './ExhibitsProvider';

export function ExhibitsView() {
  const { exhibits, typeFilter, setTypeFilter, statusFilter, setStatusFilter, searchTerm, setSearchTerm, metrics, isPending } = useExhibits();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Trial Exhibits"
        subtitle="Evidence and exhibit management"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            Add Exhibit
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Exhibits"
          value={metrics.totalExhibits}
        />
        <MetricCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Admitted"
          value={metrics.admitted}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Pending"
          value={metrics.pending}
        />
      </div>

      <div className="px-4 pb-4 space-y-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">Search exhibits</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search exhibits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <FilterButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
              All Types
            </FilterButton>
            <FilterButton active={typeFilter === 'Document'} onClick={() => setTypeFilter('Document')}>
              <FileText className="w-4 h-4" />
              Documents
            </FilterButton>
            <FilterButton active={typeFilter === 'Photo'} onClick={() => setTypeFilter('Photo')}>
              <Image className="w-4 h-4" />
              Photos
            </FilterButton>
            <FilterButton active={typeFilter === 'Video'} onClick={() => setTypeFilter('Video')}>
              <Video className="w-4 h-4" />
              Videos
            </FilterButton>
            <FilterButton active={typeFilter === 'Audio'} onClick={() => setTypeFilter('Audio')}>
              <Mic className="w-4 h-4" />
              Audio
            </FilterButton>
          </div>

          <div className="flex gap-2">
            <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
              All Status
            </FilterButton>
            <FilterButton active={statusFilter === 'Pending'} onClick={() => setStatusFilter('Pending')}>
              Pending
            </FilterButton>
            <FilterButton active={statusFilter === 'Admitted'} onClick={() => setStatusFilter('Admitted')}>
              Admitted
            </FilterButton>
            <FilterButton active={statusFilter === 'Rejected'} onClick={() => setStatusFilter('Rejected')}>
              Rejected
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exhibits.map(exhibit => (
              <ExhibitCard key={exhibit.id} exhibit={exhibit} />
            ))}
            {exhibits.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No exhibits found
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type Exhibit = {
  id: string;
  exhibitNumber: string;
  title: string;
  type: 'Document' | 'Photo' | 'Video' | 'Audio' | 'Physical';
  caseId: string;
  admissionStatus: 'Pending' | 'Admitted' | 'Rejected';
  dateSubmitted: string;
  description: string;
};

const typeIcons = {
  Document: FileText,
  Photo: Image,
  Video: Video,
  Audio: Mic,
  Physical: Package,
};

const statusColors = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Admitted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

function ExhibitCard({ exhibit }: { exhibit: Exhibit }) {
  const Icon = typeIcons[exhibit.type];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">
            {exhibit.exhibitNumber}
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[exhibit.admissionStatus]}`}>
          {exhibit.admissionStatus}
        </span>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
        {exhibit.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
        {exhibit.description}
      </p>
      <div className="text-xs text-slate-500 dark:text-slate-500">
        Submitted: {new Date(exhibit.dateSubmitted).toLocaleDateString()}
      </div>
    </div>
  );
}
