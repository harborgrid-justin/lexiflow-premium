/**
 * Real Estate: Disposal Route
 *
 * Manages the disposal and divestiture of real estate assets, including
 * surplus property identification, valuation, and sale or transfer processes.
 *
 * @module routes/real-estate/disposal
 */

import { DataService } from '@/services/data/dataService';
import type { DisposalStatus, RealEstateDisposal } from '@/services/domain/RealEstateDomain';
import { CheckCircle, Clock, Package, Plus } from 'lucide-react';
import { useState } from 'react';
import { Form, Link, useLoaderData, useNavigate } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/disposal";

// ============================================================================
// Types
// ============================================================================

interface LoaderData {
  data: RealEstateDisposal[];
  stats: {
    total: number;
    pending: number;
    completed: number;
  };
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Disposal',
    description: 'Manage disposal and divestiture of surplus real estate assets including valuation and transfer processes.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<LoaderData> {
  try {
    const disposals = await DataService.realEstate.getDisposals();
    const pendingDisposals = disposals.filter(
      (d: RealEstateDisposal) => d.status === 'Pending' || d.status === 'In Progress'
    );

    return {
      data: disposals,
      stats: {
        total: disposals.length,
        pending: pendingDisposals.length,
        completed: disposals.filter((d: RealEstateDisposal) => d.status === 'Completed').length,
      }
    };
  } catch (error) {
    console.error('Failed to fetch disposal data:', error);
    return {
      data: [],
      stats: { total: 0, pending: 0, completed: 0 }
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
    case "create": {
      const propertyId = formData.get("propertyId") as string;
      const propertyName = formData.get("propertyName") as string;
      const disposalType = formData.get("disposalType") as RealEstateDisposal["disposalType"];
      const reason = formData.get("reason") as string;
      const estimatedValue = formData.get("estimatedValue") as string;

      if (!propertyId || !reason) {
        return { success: false, error: "Property and reason are required" };
      }

      await DataService.realEstate.createDisposal({
        propertyId,
        propertyName: propertyName || "Unknown Property",
        disposalType: disposalType || "Sale",
        status: "Pending",
        reason,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      });
      return { success: true, message: "Disposal record created" };
    }
    case "update": {
      const id = formData.get("id") as string;
      const status = formData.get("status") as DisposalStatus;

      if (!id) {
        return { success: false, error: "ID is required" };
      }

      const updates: Partial<RealEstateDisposal> = { status };
      if (status === "Completed") {
        updates.completionDate = new Date().toISOString();
      }

      await DataService.realEstate.updateDisposal(id, updates);
      return { success: true, message: "Disposal updated" };
    }
    case "delete": {
      const id = formData.get("id") as string;
      if (!id) {
        return { success: false, error: "ID is required" };
      }
      await DataService.realEstate.deleteDisposal(id);
      return { success: true, message: "Disposal deleted" };
    }
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DisposalRoute() {
  const { data, stats } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status: DisposalStatus): string => {
    switch (status) {
      case 'Pending': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
      case 'In Progress': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'Completed': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
      case 'Cancelled': return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const formatCurrency = (value?: number): string => {
    if (!value) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/real_estate/portfolio_summary" className="hover:text-gray-700 dark:hover:text-gray-200">
          Real Estate
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">Disposal</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Disposal
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage the disposal and divestiture of surplus real estate assets.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Disposal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
              <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Disposals</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table or Empty State */}
      {data.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No Disposal Records
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No property disposals have been initiated yet.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create First Disposal
          </button>
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
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Est. Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {data.map((disposal) => (
                <tr key={disposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {disposal.propertyName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {disposal.reason?.slice(0, 40)}...
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {disposal.disposalType}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(disposal.status)}`}>
                      {disposal.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(disposal.estimatedValue)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => navigate(`/real_estate/disposal/${disposal.id}`)}
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

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Create New Disposal
            </h2>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property ID
                </label>
                <input
                  type="text"
                  name="propertyId"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property Name
                </label>
                <input
                  type="text"
                  name="propertyName"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Disposal Type
                </label>
                <select
                  name="disposalType"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Sale">Sale</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Donation">Donation</option>
                  <option value="Demolition">Demolition</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estimated Value
                </label>
                <input
                  type="number"
                  name="estimatedValue"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason
                </label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </Form>
          </div>
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
      title="Failed to Load Disposal"
      message="We couldn't load the disposal data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
