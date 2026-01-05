/**
 * Real Estate: Utilization Route
 *
 * Tracks and analyzes the utilization rates of real estate assets,
 * including occupancy levels, space efficiency, and usage patterns.
 *
 * @module routes/real-estate/utilization
 */

import { DataService } from '@/services/data/dataService';
import type { RealEstateUtilization } from '@/services/domain/RealEstateDomain';
import { Activity, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';
import { Link, useLoaderData, useNavigate } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/utilization";

// ============================================================================
// Types
// ============================================================================

interface LoaderData {
  data: RealEstateUtilization[];
  stats: {
    total: number;
    avgUtilization: number;
    underutilized: number;
  };
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Utilization',
    description: 'Track and analyze utilization rates of real estate assets including occupancy and space efficiency.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<LoaderData> {
  try {
    const utilizationData = await DataService.realEstate.getUtilization();

    const avgUtilization = utilizationData.length > 0
      ? utilizationData.reduce((sum: number, u: RealEstateUtilization) => sum + u.utilizationRate, 0) / utilizationData.length
      : 0;

    return {
      data: utilizationData,
      stats: {
        total: utilizationData.length,
        avgUtilization: parseFloat(avgUtilization.toFixed(1)),
        underutilized: utilizationData.filter((u: RealEstateUtilization) => u.utilizationRate < 70).length,
      }
    };
  } catch (error) {
    console.error('Failed to fetch utilization data:', error);
    return {
      data: [],
      stats: { total: 0, avgUtilization: 0, underutilized: 0 }
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update": {
      const id = formData.get("id") as string;
      const currentOccupancy = formData.get("currentOccupancy") as string;
      const recommendations = formData.get("recommendations") as string;

      if (!id) {
        return { success: false, error: "ID is required" };
      }

      await DataService.realEstate.updateUtilization(id, {
        currentOccupancy: currentOccupancy ? parseInt(currentOccupancy, 10) : undefined,
        recommendations: recommendations || undefined,
      });
      return { success: true, message: "Utilization updated" };
    }
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function UtilizationRoute() {
  const { data, stats } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  const getUtilizationColor = (rate: number): string => {
    if (rate >= 80) return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
    if (rate >= 60) return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
    return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
  };

  const getUtilizationBarColor = (rate: number): string => {
    if (rate >= 80) return 'bg-emerald-500';
    if (rate >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/real_estate/portfolio_summary" className="hover:text-gray-700 dark:hover:text-gray-200">
          Real Estate
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">Utilization</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Utilization
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Monitor and optimize real estate utilization rates and space efficiency.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
              <BarChart3 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Properties Tracked</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Utilization</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{stats.avgUtilization}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Underutilized (&lt;70%)</p>
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.underutilized}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table or Empty State */}
      {data.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <Activity className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No Utilization Data
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No utilization records have been created yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Primary Use
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Last Assessment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {data.map((util) => (
                <tr key={util.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {util.propertyName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {util.departments?.join(', ') || 'No departments assigned'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {util.primaryUse}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                        <div
                          className={`h-2 rounded-full ${getUtilizationBarColor(util.utilizationRate)}`}
                          style={{ width: `${Math.min(util.utilizationRate, 100)}%` }}
                        />
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getUtilizationColor(util.utilizationRate)}`}>
                        {util.utilizationRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {util.currentOccupancy} / {util.totalCapacity}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(util.lastAssessmentDate)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => navigate(`/real_estate/utilization/${util.id}`)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
      title="Failed to Load Utilization"
      message="We couldn't load the utilization data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
