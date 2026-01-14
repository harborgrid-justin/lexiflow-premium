/**
 * Real Estate: Acquisition Route
 *
 * Manages the acquisition of real estate properties including land purchases,
 * building acquisitions, easement procurement, and related transaction workflows.
 *
 * @module routes/real-estate/acquisition
 */

import { DataService } from '@/services/data/dataService';
import type { AcquisitionStatus, RealEstateAcquisition } from '@/services/domain/RealEstateDomain';
import { AcquisitionManager } from '@/features/real-estate/acquisition/AcquisitionManager';
import type { AcquisitionLoaderData } from '@/features/real-estate/acquisition/types';
import { useLoaderData, type ActionFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/acquisition";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Acquisition',
    description: 'Manage real estate acquisitions including land purchases, building acquisitions, and transaction workflows.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<AcquisitionLoaderData> {
  try {
    const acquisitions = await DataService.realEstate.getAcquisitions();
    const pending = acquisitions.filter(
      (a: RealEstateAcquisition) => a.status === 'Prospecting' || a.status === 'Under Contract' || a.status === 'Due Diligence'
    );

    return {
      data: acquisitions,
      stats: {
        total: acquisitions.length,
        pending: pending.length,
        completed: acquisitions.filter((a: RealEstateAcquisition) => a.status === 'Closed').length,
        totalInvestment: acquisitions.reduce((sum: number, a: RealEstateAcquisition) => sum + (a.finalPrice || a.offeredPrice || 0), 0),
      }
    };
  } catch (error) {
    console.error('Failed to fetch acquisition data:', error);
    return {
      data: [],
      stats: { total: 0, pending: 0, completed: 0, totalInvestment: 0 }
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const propertyName = formData.get("propertyName") as string;
      const address = formData.get("address") as string;
      const propertyType = formData.get("propertyType") as RealEstateAcquisition["propertyType"];
      const askingPrice = formData.get("askingPrice") as string;
      const seller = formData.get("seller") as string;
      const targetCloseDate = formData.get("targetCloseDate") as string;

      if (!propertyName || !address) {
        return { success: false, error: "Property name and address are required" };
      }

      await DataService.realEstate.createAcquisition({
        propertyName,
        address,
        propertyType: propertyType || "Building",
        status: "Prospecting",
        askingPrice: askingPrice ? parseFloat(askingPrice) : undefined,
        seller: seller || undefined,
        targetCloseDate: targetCloseDate || undefined,
      });
      return { success: true, message: "Acquisition created" };
    }
    case "update": {
      const id = formData.get("id") as string;
      const status = formData.get("status") as AcquisitionStatus;
      const offeredPrice = formData.get("offeredPrice") as string;

      if (!id) {
        return { success: false, error: "ID is required" };
      }

      const updates: Partial<RealEstateAcquisition> = { status };
      if (offeredPrice) {
        updates.offeredPrice = parseFloat(offeredPrice);
      }
      if (status === "Closed") {
        updates.actualCloseDate = new Date().toISOString();
      }

      await DataService.realEstate.updateAcquisition(id, updates);
      return { success: true, message: "Acquisition updated" };
    }
    case "delete":
      return { success: true, message: "Acquisition deleted" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function AcquisitionRoute() {
  const { data, stats } = useLoaderData<typeof loader>();
  return <AcquisitionManager data={data} stats={stats} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
<ShoppingCart className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div >
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p>
  </div>
          </div >
        </div >
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
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
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Investment</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(stats.totalInvestment)}</p>
            </div>
          </div>
        </div>
      </div >

  {/* Data Table or Empty State */ }
{
  data.length === 0 ? (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
        No Acquisitions
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        No property acquisitions have been initiated yet.
      </p>
      <button
        onClick={() => setShowCreateForm(true)}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        Start First Acquisition
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
            Asking Price
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Target Close
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
        {data.map((acquisition) => (
          <tr key={acquisition.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td className="whitespace-nowrap px-6 py-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {acquisition.propertyName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {acquisition.address}
              </div>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {acquisition.propertyType}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(acquisition.status)}`}>
                {acquisition.status}
              </span>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {formatCurrency(acquisition.askingPrice)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {formatDate(acquisition.targetCloseDate)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
              <button
                onClick={() => navigate(`/real_estate/acquisition/${acquisition.id}`)}
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
)
}

{/* Create Form Modal */ }
{
  showCreateForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Create New Acquisition
        </h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="create" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Property Name
            </label>
            <input
              type="text"
              name="propertyName"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address
            </label>
            <input
              type="text"
              name="address"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Property Type
            </label>
            <select
              name="propertyType"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="Building">Building</option>
              <option value="Land">Land</option>
              <option value="Facility">Facility</option>
              <option value="Mixed-Use">Mixed-Use</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Asking Price
              </label>
              <input
                type="number"
                name="askingPrice"
                min="0"
                step="1000"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Close Date
              </label>
              <input
                type="date"
                name="targetCloseDate"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Seller
            </label>
            <input
              type="text"
              name="seller"
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
  )
}
    </div >
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Acquisition"
      message="We couldn't load the acquisition data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
