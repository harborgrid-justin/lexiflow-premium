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

import type { Report } from '@/lib/frontend-api';
import { analyticsApi } from '@/lib/frontend-api';
import { DataService } from '@/services/data/data-service.service';
import type { ReportCategory } from '@/types/analytics-enterprise';
import {
  Calendar,
  Edit,
  FileText,
  MoreVertical,
  Play,
  Plus,
  Search
} from 'lucide-react';
import { Form, Link, useLoaderData, useSubmit, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Types
// ============================================================================

type LoaderData = Awaited<ReturnType<typeof clientLoader>>;

interface RouteErrorBoundaryProps {
  error: unknown;
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: LoaderData }) {
  return createListMeta({
    entityType: 'Reports',
    count: data?.reports?.length,
    description: 'Create, manage, and schedule custom reports',
  });
}

// ============================================================================
// Client Loader
// ============================================================================

/**
 * Fetches reports on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "all";

  try {
    // Fetch reports using new enterprise API
    const result = await analyticsApi.getAllReports({
      reportType: category !== 'all' ? (category as string) : undefined,
      search: search || undefined,
      page: 1,
      limit: 100,
    });

    const reports = result.ok ? result.data.data : [];

    return {
      reports,
      search,
      category,
    };
  } catch (error) {
    console.error("Failed to load reports", error);
    return {
      reports: [],
      search,
      category,
    };
  }
}

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id") as string;

  try {
    switch (intent) {
      case "delete": {
        if (id) await DataService.reports.delete(id);
        return { success: true, message: "Report deleted" };
      }
      case "run-now": {
        if (id) {
          const report = await DataService.reports.getById(id);
          await DataService.reports.generate({
            reportType: report.reportType,
            format: report.format,
            filters: report.filters
          });
        }
        return { success: true, message: "Report generation started" };
      }
      case "duplicate": {
        // Duplicate not directly supported, maybe just re-run logic or create template
        // For now, treat as run-now or ignore
        return { success: false, error: "Duplicate not supported yet" };
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

export default function ReportsIndexRoute() {
  const { reports, search, category } = useLoaderData() as LoaderData;
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
    <div style={{ backgroundColor: 'var(--color-background)' }} className="flex h-full flex-col">
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: 'var(--color-text)' }} className="text-2xl font-bold">Reports</h1>
            <p style={{ color: 'var(--color-textMuted)' }} className="mt-1 text-sm">
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
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              className={cn('w-full rounded-lg border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1', theme.surface.default, theme.text.primary, theme.border.default, theme.border.focus)}
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
          <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
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
  const description = (report.metadata?.description as string) || '';
  const schedule = (report.metadata?.schedule as { frequency: string }) || null;

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="group relative flex flex-col justify-between rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-2 ${report.reportType === 'billing' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
            report.reportType === 'case_status' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
              report.reportType === 'compliance' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
            <FileText className="h-6 w-6" />
          </div>
          <div className="relative">
            <button style={{ color: 'var(--color-textMuted)', backgroundColor: 'transparent' }} className="rounded-full p-1 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700">
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
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-text)' }} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
            {report.reportType.replace('_', ' ')}
          </span>
          {schedule && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              <Calendar className="h-3 w-3" />
              {schedule.frequency}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {report.generatedAt ? (
            <>Last run: {new Date(report.generatedAt).toLocaleDateString()}</>
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
            style={{ color: 'var(--color-textMuted)', backgroundColor: 'transparent' }}
            className="rounded p-1.5 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
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

export function ErrorBoundary({ error }: RouteErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Reports"
      message="We couldn't load your reports. Please try again."
    />
  );
}
