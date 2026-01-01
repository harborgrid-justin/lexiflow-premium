/**
 * Case Overview Component - Server Component
 */

import { Case } from '@/types';

interface CaseOverviewProps {
  caseData: Case;
}

export function CaseOverview({ caseData }: CaseOverviewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
        Overview
      </h2>
      {caseData.description && (
        <p className="text-slate-600 dark:text-slate-400">
          {caseData.description}
        </p>
      )}
    </div>
  );
}
