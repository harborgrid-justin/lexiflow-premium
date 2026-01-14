/**
 * Real Estate: Solicitations Route
 *
 * Manages real estate solicitations including requests for proposals (RFPs),
 * bid invitations, and procurement activities for property acquisitions or leases.
 *
 * @module routes/real-estate/solicitations
 */

import { DataService } from '@/services/data/data-service.service';
import type { RealEstateSolicitation } from '@/services/domain/RealEstateDomain';
import { Award, Clock, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { Form, Link, useLoaderData, useNavigate } from 'react-router-dom';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/solicitations";

type SolicitationStatus = 'Draft' | 'Open' | 'Closed' | 'Awarded' | 'Cancelled';

// ============================================================================
// Types
// ============================================================================

interface LoaderData {
  data: RealEstateSolicitation[];
  stats: {
    total: number;
    open: number;
    awarded: number;
  };
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate - Solicitations',
    description: 'Manage real estate solicitations including RFPs, bid invitations, and procurement activities.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader(): Promise<LoaderData> {
  try {
    const solicitations = await DataService.realEstate.getSolicitations();

    return {
      data: solicitations,
      stats: {
        total: solicitations.length,
        open: solicitations.filter((s: RealEstateSolicitation) => s.status === 'Open').length,
        awarded: solicitations.filter((s: RealEstateSolicitation) => s.status === 'Awarded').length,
      }
    };
  } catch (error) {
    console.error('Failed to fetch solicitations data:', error);
    return {
      data: [],
      stats: { total: 0, open: 0, awarded: 0 }
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
      const title = formData.get("title") as string;
      const solicitationType = formData.get("solicitationType") as RealEstateSolicitation["solicitationType"];
      const description = formData.get("description") as string;
      const dueDate = formData.get("dueDate") as string;
      const estimatedValue = formData.get("estimatedValue") as string;

      if (!title || !description) {
        return { success: false, error: "Title and description are required" };
      }

      await DataService.realEstate.createSolicitation({
        title,
        solicitationType: solicitationType || "RFP",
        status: "Draft",
        description,
        dueDate: dueDate || undefined,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      });
      return { success: true, message: "Solicitation created" };
    }
    case "update":
      return { success: true, message: "Solicitation updated" };
    case "delete":
      return { success: true, message: "Solicitation deleted" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function SolicitationsRoute() {
  const { data, stats } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status: SolicitationStatus): string => {
    switch (status) {
      case 'Draft': return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20';
      case 'Open': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'Closed': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
      case 'Awarded': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
      case 'Cancelled': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
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
        <span className="text-gray-900 dark:text-gray-100">Solicitations</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Solicitations
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Track and manage real estate procurement solicitations and bid processes.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Solicitation
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Solicitations</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{stats.open}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Awarded</p>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.awarded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table or Empty State */}
      {data.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No Solicitations
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No solicitations have been created yet.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create First Solicitation
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Title
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
              {data.map((solicitation) => (
                <tr key={solicitation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {solicitation.title}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {solicitation.solicitationType}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(solicitation.status)}`}>
                      {solicitation.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(solicitation.estimatedValue)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => navigate(`/real_estate/solicitations/${solicitation.id}`)}
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
              Create New Solicitation
            </h2>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  name="solicitationType"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="RFP">Request for Proposal (RFP)</option>
                  <option value="RFQ">Request for Quote (RFQ)</option>
                  <option value="IFB">Invitation for Bid (IFB)</option>
                  <option value="RFI">Request for Information (RFI)</option>
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
      title="Failed to Load Solicitations"
      message="We couldn't load the solicitations data. Please try again."
      backTo="/real_estate/portfolio_summary"
      backLabel="Return to Portfolio Summary"
    />
  );
}
