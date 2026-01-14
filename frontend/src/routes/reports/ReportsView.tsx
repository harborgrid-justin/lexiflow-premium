/**
 * Reports & Analytics Domain - View Component
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { Calendar, FileText, Plus, TrendingUp } from 'lucide-react';
import { useId } from 'react';
import { useReports } from './ReportsProvider';

export function ReportsView() {
  const {
    reports,
    recentReports,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    isPending
  } = useReports();

  const searchId = useId();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business intelligence and data visualization"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{reports.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Reports</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{recentReports.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Recent</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {reports.filter(r => r.schedule).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Scheduled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor={searchId} className="sr-only">Search reports</label>
            <input
              id={searchId}
              type="search"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="Financial">Financial</option>
            <option value="Performance">Performance</option>
            <option value="Cases">Cases</option>
            <option value="Time">Time Tracking</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
            {reports.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                No reports found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type Report = {
  id: string;
  name: string;
  type: string;
  description: string;
  lastRun?: string;
  schedule?: string;
  status: string;
};

function ReportCard({ report }: { report: Report }) {
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
