/**
 * Report Card Component
 *
 * ENTERPRISE ARCHITECTURE:
 * - Pure presentation component
 * - Receives data via props only
 * - No direct data fetching
 * - Emits events upward
 *
 * @module routes/reports/components/ReportCard
 */

import { Calendar } from 'lucide-react';
import type { Report } from './types';

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-white mb-1">
            {report.name}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {report.description}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
          {report.type}
        </span>
        {report.lastRun && (
          <span className="text-slate-600 dark:text-slate-400">
            {new Date(report.lastRun).toLocaleDateString()}
          </span>
        )}
      </div>

      {report.schedule && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
          <Calendar className="w-3 h-3 inline mr-1" />
          {report.schedule}
        </div>
      )}
    </div>
  );
}
