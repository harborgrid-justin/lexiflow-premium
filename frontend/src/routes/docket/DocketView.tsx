import { Gavel } from 'lucide-react';

import { PageHeader } from '@/components/organisms/PageHeader';

import { useDocket } from './DocketProvider';

export function DocketView() {
  const { entries, metrics } = useDocket();

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Docket" subtitle="Case filings and court entries" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Entries" value={metrics.total} />
        <MetricCard title="This Week" value={metrics.thisWeek} />
        <MetricCard title="Pending" value={metrics.pending} />
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {entries.map(entry => (
          <DocketEntryRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function DocketEntryRow({ entry }: { entry: DocketEntry }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start gap-3">
        <Gavel className="w-5 h-5 text-blue-600 mt-1" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-slate-900 dark:text-white">
              Entry #{entry.entryNumber}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {new Date(entry.filingDate).toLocaleDateString()}
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{entry.description}</div>
        </div>
      </div>
    </div>
  );
}
