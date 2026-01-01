/**
 * Reports Route
 *
 * Report builder and management interface with:
 * - Server-side data loading via loader
 * - Report generation and scheduling
 * - Filtering and search
 * - Export capabilities
 *
 * @module routes/reports/index
 */

import type { Report, ReportCategory } from '@/types/analytics-enterprise';
import {
  Calendar,
  Edit,
  FileText,
  MoreVertical,
  Play,
  Plus,
  Search
} from 'lucide-react';
import { Form, Link, useSubmit } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta(_: Route.MetaArgs) {
  return createMeta({
    title: 'Reports',
    description: 'Create, manage, and schedule custom reports',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "all";

  // TODO: Replace with actual API call
  // const reports = await api.reports.getAll({ search, category });

  const mockReports: Report[] = [
    {
      id: '1',
      name: 'Monthly Billing Summary',
      description: 'Comprehensive monthly billing and revenue report',
      type: 'billing-summary',
      category: 'financial',
      format: ['pdf', 'excel'],
      parameters: {
        dateRange: { type: 'relative', period: 'last-month' },
      },
      status: 'active',
      schedule: {
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '09:00',
      },
      lastRun: '2024-01-01T09:00:00Z',
      nextRun: '2024-02-01T09:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      userId: 'user-1',
    },
    {
      id: '2',
      name: 'Case Outcomes Report',
      description: 'Win/loss analysis by attorney and practice area',
      type: 'case-summary',
      category: 'operational',
      format: ['pdf'],
      parameters: {
        dateRange: { type: 'relative', period: 'last-quarter' },
      },
      status: 'active',
      schedule: {
        frequency: 'quarterly',
        dayOfMonth: 1,
        time: '08:00',
      },
      lastRun: '2024-01-01T08:00:00Z',
      nextRun: '2024-04-01T08:00:00Z',
      createdAt: '2023-02-15T00:00:00Z',
      updatedAt: '2023-12-20T14:15:00Z',
      userId: 'user-1',
    },
    {
      id: '3',
      name: 'Associate Productivity',
      description: 'Billable hours and realization rates by associate',
      type: 'productivity',
      category: 'performance',
      format: ['excel', 'csv'],
      parameters: {
        dateRange: { type: 'relative', period: 'this-month' },
      },
      status: 'draft',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T16:45:00Z',
      userId: 'user-1',
    },
    {
      id: '4',
      name: 'Compliance Audit Log',
      description: 'System access and data modification logs',
      type: 'custom',
      category: 'compliance',
      format: ['csv'],
      parameters: {
        dateRange: { type: 'relative', period: 'last-week' },
      },
      status: 'active',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '06:00',
      },
      lastRun: '2024-01-22T06:00:00Z',
      nextRun: '2024-01-29T06:00:00Z',
      createdAt: '2023-11-05T00:00:00Z',
      updatedAt: '2023-11-05T09:20:00Z',
      userId: 'user-1',
    },
  ];

  let filteredReports = mockReports;

  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredReports = filteredReports.filter(r =>
      r.name.toLowerCase().includes(lowerSearch) ||
      r.description?.toLowerCase().includes(lowerSearch)
    );
  }

  if (category !== 'all') {
    filteredReports = filteredReports.filter(r => r.category === category);
  }

  return {
    reports: filteredReports,
    search,
    category,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const _id = formData.get("id");

  try {
    switch (intent) {
      case "delete": {
        // await api.reports.delete(id as string);
        return { success: true, message: "Report deleted" };
      }
      case "run-now": {
        // await api.reports.run(id as string);
        return { success: true, message: "Report generation started" };
      }
      case "duplicate": {
        // await api.reports.duplicate(id as string);
        return { success: true, message: "Report duplicated" };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Action failed:", error);
    return { success: false, error: "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ReportsIndexRoute({ loaderData }: Route.ComponentProps) {
  const { reports, search, category } = loaderData;
  const submit = useSubmit();

  const categories: { value: ReportCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Reports' },
    { value: 'financial', label: 'Financial' },
    { value: 'operational', label: 'Operational' },
    { value: 'performance', label: 'Performance' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'executive', label: 'Executive' },
  ];

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Generate and schedule insights across your firm
            </p>
          </div>
          <Link
            to="new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            New Report
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to={`?category=${cat.value}${search ? `&q=${search}` : ''}`}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category === cat.value
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <Form method="get" className="relative w-full sm:w-64">
            <input type="hidden" name="category" value={category} />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search reports..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              onChange={(e) => {
                const isFirstSearch = search === null;
                submit(e.currentTarget.form, {
                  replace: !isFirstSearch,
                });
              }}
            />
          </Form>
        </div>
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-auto p-6">
        {reports.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <FileText className="h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {search || category !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating a new report'}
            </p>
            {!(search || category !== 'all') && (
              <Link
                to="new"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Report
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report: Report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const submit = useSubmit();

  return (
    <div className="group relative flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div>
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-2 ${report.category === 'financial' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
            report.category === 'operational' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
              report.category === 'compliance' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
            <FileText className="h-6 w-6" />
          </div>
          <div className="relative">
            <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700">
              <MoreVertical className="h-5 w-5" />
            </button>
            {/* Dropdown menu would go here */}
          </div>
        </div>

        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          <Link to={report.id} className="hover:underline focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {report.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
          {report.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {report.type.replace('-', ' ')}
          </span>
          {report.schedule && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              <Calendar className="h-3 w-3" />
              {report.schedule.frequency}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {report.lastRun ? (
            <>Last run: {new Date(report.lastRun).toLocaleDateString()}</>
          ) : (
            <>Never run</>
          )}
        </div>
        <div className="flex gap-2 relative z-10">
          <button
            onClick={() => {
              const formData = new FormData();
              formData.append("intent", "run-now");
              formData.append("id", report.id);
              submit(formData, { method: "post" });
            }}
            className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            title="Run Now"
          >
            <Play className="h-4 w-4" />
          </button>
          <Link
            to={`${report.id}/edit`}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Reports"
      message="We couldn't load your reports. Please try again."
    />
  );
}
