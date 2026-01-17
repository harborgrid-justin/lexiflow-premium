/**
 * Report Table Component
 *
 * ENTERPRISE ARCHITECTURE:
 * - Pure presentation component
 * - Receives data via props only
 * - No direct data fetching
 * - Emits events upward
 *
 * @module routes/reports/components/ReportTable
 */

import { ReportRow } from './ReportRow';

import type { Report } from './types';

interface ReportTableProps {
  reports: Report[];
  isPending?: boolean;
}

export function ReportTable({ reports, isPending = false }: ReportTableProps) {
  if (isPending) {
    return (
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(report => (
          <ReportRow key={report.id} report={report} />
        ))}
        {reports.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
            No reports found
          </div>
        )}
      </div>
    </div>
  );
}
