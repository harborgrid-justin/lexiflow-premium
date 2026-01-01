/**
 * Case Timeline Component - Client Component
 */

'use client';

interface CaseTimelineProps {
  caseId: string;
}

export function CaseTimeline({ caseId }: CaseTimelineProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
        Timeline
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        Timeline for case {caseId}
      </p>
    </div>
  );
}
