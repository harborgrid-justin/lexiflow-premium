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

/**
 * Reports Route
 *
 * Enterprise Pattern:
 * - clientLoader owns data fetching (localStorage tokens)
 * - Page owns orchestration and passes initialData into provider
 * - Provider owns derivations/filtering
 * - View renders UI
 *
 * @module routes/reports/index
 */

import { analyticsApi } from '@/lib/frontend-api';
import { DataService } from '@/services/data/data-service.service';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { createListMeta } from '../_shared/meta-utils';
import ReportsPage from './ReportsPage';
import type { ReportsLoaderData } from './loader';

type LoaderData = Awaited<ReturnType<typeof clientLoader>>;

export function meta({ data }: { data: LoaderData }) {
  return createListMeta({
    entityType: 'Reports',
    count: data?.reports?.length,
    description: 'Create, manage, and schedule custom reports',
  });
}

/**
 * Fetches reports on the client side only.
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR).
 */
export async function clientLoader({ request }: LoaderFunctionArgs): Promise<ReportsLoaderData> {
  const url = new URL(request.url);
  const search = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category') || 'all';

  try {
    const result = await analyticsApi.getAllReports({
      reportType: category !== 'all' ? category : undefined,
      search: search || undefined,
      page: 1,
      limit: 100,
    });

    const reports = result.ok ? result.data.data : [];
    return {
      reports,
      recentReports: reports.slice(0, 5),
    };
  } catch (error) {
    console.error('Failed to load reports', error);
    return {
      reports: [],
      recentReports: [],
    };
  }
}

clientLoader.hydrate = true as const;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const id = formData.get('id') as string;

  try {
    switch (intent) {
      case 'delete': {
        if (id) await DataService.reports.delete(id);
        return { success: true, message: 'Report deleted' };
      }
      case 'run-now': {
        if (id) {
          const report = await DataService.reports.getById(id);
          await DataService.reports.generate({
            reportType: report.reportType,
            format: report.format,
            filters: report.filters,
          });
        }
        return { success: true, message: 'Report generation started' };
      }
      default:
        return { success: false, error: 'Invalid action' };
    }
  } catch (error) {
    console.error('Action failed:', error);
    return { success: false, error: 'Operation failed' };
  }
}

export default function ReportsIndexRoute() {
  return <ReportsPage />;
}
