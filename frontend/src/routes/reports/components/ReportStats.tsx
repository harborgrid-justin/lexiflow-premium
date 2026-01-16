/**
 * Report Stats Component
 *
 * ENTERPRISE ARCHITECTURE:
 * - Pure presentation component
 * - Receives data via props only
 * - No direct data fetching
 * - Emits events upward
 *
 * @module routes/reports/components/ReportStats
 */

import { Calendar, FileText, TrendingUp } from 'lucide-react';

interface ReportStatsProps {
  totalReports: number;
  recentReports: number;
  scheduledReports: number;
}

export function ReportStats({ totalReports, recentReports, scheduledReports }: ReportStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalReports}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Reports</div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{recentReports}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Recent</div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{scheduledReports}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Scheduled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
