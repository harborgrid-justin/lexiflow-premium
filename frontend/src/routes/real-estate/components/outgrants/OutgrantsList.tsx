import type {
  OutgrantStatus
} from '@/services/domain/RealEstateDomain';
import { FileKey, FileText, Plus, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Form, Link, useNavigate } from 'react-router';
import type { OutgrantsLoaderData } from './types';

export function OutgrantsList({ data, stats }: OutgrantsLoaderData) {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status: OutgrantStatus): string => {
    switch (status) {
      case 'Active':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
      case 'Expired':
        return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20';
      case 'Pending Renewal':
        return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
      case 'Terminated':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const formatCurrency = (value?: number): string => {
    if (!value) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <Link
          to="/real_estate/portfolio_summary"
          className="hover:text-gray-700 dark:hover:text-gray-200"
        >
          Real Estate
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">Outgrants</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Outgrants
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage outgrant agreements authorizing third-party use of real
            property.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Outgrant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
              <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Outgrants
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <FileKey className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Renewal
              </p>
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {stats.pendingRenewal}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table or Empty State */}
      {data.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <FileKey className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No Outgrant Records
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No outgrant agreements have been created yet.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create First Outgrant
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
                  Grantee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Monthly Rent
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {data.map((outgrant) => (
                <tr
                  key={outgrant.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {outgrant.propertyName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {outgrant.startDate} - {outgrant.endDate || 'Ongoing'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {outgrant.grantType}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {outgrant.grantee}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                        outgrant.status
                      )}`}
                    >
                      {outgrant.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(outgrant.monthlyRent)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() =>
                        navigate(`/real_estate/outgrants/${outgrant.id}`)
                      }
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
              Create New Outgrant
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
                  Grant Type
                </label>
                <select
                  name="grantType"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Lease">Lease</option>
                  <option value="License">License</option>
                  <option value="Permit">Permit</option>
                  <option value="Easement">Easement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grantee
                </label>
                <input
                  type="text"
                  name="grantee"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly Rent
                </label>
                <input
                  type="number"
                  name="monthlyRent"
                  min="0"
                  step="0.01"
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
