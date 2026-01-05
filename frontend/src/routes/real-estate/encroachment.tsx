/**
 * Real Estate: Encroachment Route
 *
 * Manages encroachment cases involving unauthorized use or occupation of
 * government-owned real property, including investigation and resolution tracking.
 *
 * @module routes/real-estate/encroachment
 */

import { DataService } from '@/services/data/dataService';
import type { EncroachmentStatus, RealEstateEncroachment } from '@/services/domain/RealEstateDomain';
import { Link } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/encroachment";

// ============================================================================
// Types
// ============================================================================

interface LoaderData {
  data: RealEstateEncroachment[];
  stats: {
    total: number;
    active: number;
    resolved: number;
  };
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Encroachment',
    description: 'Manage encroachment cases involving unauthorized property use including investigation and resolution tracking.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<LoaderData> {
  try {
    const encroachments = await DataService.realEstate.getEncroachments();
    const activeEncroachments = encroachments.filter(
      (e: RealEstateEncroachment) => e.status === 'Active' || e.status === 'Under Review'
    );

    return {
      data: encroachments,
      stats: {
        total: encroachments.length,
        active: activeEncroachments.length,
        resolved: encroachments.filter((e: RealEstateEncroachment) => e.status === 'Resolved').length,
      }
    };
  } catch (error) {
    console.error('Failed to fetch encroachment data:', error);
    return {
      data: [],
      stats: { total: 0, active: 0, resolved: 0 }
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
      const encroachmentType = formData.get("encroachmentType") as RealEstateEncroachment["encroachmentType"];
      const description = formData.get("description") as string;

      if (!propertyId || !description) {
        return { success: false, error: "Property and description are required" };
      }

      await DataService.realEstate.createEncroachment({
        propertyId,
        propertyName: propertyName || "Unknown Property",
        encroachmentType: encroachmentType || "Other",
        status: "Active",
        description,
        discoveredDate: new Date().toISOString(),
      });
      return { success: true, message: "Encroachment record created" };
    }
    case "resolve": {
      const id = formData.get("id") as string;
      const method = formData.get("method") as string;
      const notes = formData.get("notes") as string;

      if (!id || !method) {
        return { success: false, error: "ID and resolution method are required" };
      }

      await DataService.realEstate.resolveEncroachment(id, { method, notes });
      return { success: true, message: "Encroachment resolved" };
    }
    case "update": {
      const id = formData.get("id") as string;
      const status = formData.get("status") as EncroachmentStatus;

      if (!id) {
        return { success: false, error: "ID is required" };
      }

      await DataService.realEstate.updateEncroachment(id, { status });
      return { success: true, message: "Encroachment updated" };
    }
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function EncroachmentRoute() {
  const { data, stats } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status: EncroachmentStatus): string => {
    switch (status) {
      case 'Active': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case 'Under Review': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
      case 'Resolved': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
      case 'Dismissed': return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/real_estate/portfolio_summary" className="hover:text-gray-700 dark:hover:text-gray-200">
          Real Estate
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">Encroachment</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Encroachment
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Track and resolve encroachment cases on government-owned properties.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Report Encroachment
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cases</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Cases</p>
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table or Empty State */}
      {data.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No Encroachment Cases
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No encroachment cases have been reported yet.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Report First Encroachment
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
                  Discovered
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {data.map((encroachment) => (
                <tr key={encroachment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {encroachment.propertyName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {encroachment.description?.slice(0, 50)}...
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {encroachment.encroachmentType}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(encroachment.status)}`}>
                      {encroachment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(encroachment.discoveredDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => navigate(`/real_estate/encroachment/${encroachment.id}`)}
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
              Report New Encroachment
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
                  Type
                </label>
                <select
                  name="encroachmentType"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Structural">Structural</option>
                  <option value="Fence">Fence</option>
                  <option value="Vegetation">Vegetation</option>
                  <option value="Utility">Utility</option>
                  <option value="Access">Access</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
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
      title="Failed to Load Encroachment"
      message="We couldn't load the encroachment data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
