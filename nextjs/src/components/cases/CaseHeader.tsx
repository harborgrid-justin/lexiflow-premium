/**
 * Case Header Component - Server Component
 * Displays case header information
 */

import { formatDate } from '@/lib/utils';
import { Case } from '@/types';
import { Calendar, MapPin, User } from 'lucide-react';

interface CaseHeaderProps {
  caseData: Case;
}

export function CaseHeader({ caseData }: CaseHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {caseData.title}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {caseData.caseNumber}
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Edit Case
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {caseData.court && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">
              {caseData.court}
            </span>
          </div>
        )}
        {caseData.filingDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">
              Filed: {formatDate(caseData.filingDate)}
            </span>
          </div>
        )}
        {caseData.assignedTo && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">
              Assigned to: {caseData.assignedTo}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
