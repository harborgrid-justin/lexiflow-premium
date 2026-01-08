/**
 * Real Estate: Solicitations Page
 *
 * Manages solicitations including RFPs, RFQs, and bids.
 *
 * @module app/(main)/real-estate/solicitations/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  FileText,
  Clock,
  Award,
} from "lucide-react";
import {
  getSolicitations,
  type RealEstateSolicitation,
  type SolicitationStatus,
} from "@/lib/dal/real-estate";
import { CreateSolicitationModal } from "./create-modal";

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Solicitations | Real Estate | LexiFlow",
    description: "Manage real estate solicitations including RFPs, bid invitations, and procurement activities.",
    keywords: ["solicitations", "real estate", "RFP", "procurement"],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: SolicitationStatus): string {
  switch (status) {
    case "Draft":
      return "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20";
    case "Open":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
    case "Closed":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    case "Awarded":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
    case "Cancelled":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    default:
      return "text-slate-600 bg-slate-50";
  }
}

function formatCurrency(value?: number): string {
  if (!value) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ============================================================================
// Stats Component
// ============================================================================

function StatsCards({ solicitations }: { solicitations: RealEstateSolicitation[] }) {
  const open = solicitations.filter((s) => s.status === "Open").length;
  const awarded = solicitations.filter((s) => s.status === "Awarded").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Solicitations</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{solicitations.length}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Open</p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{open}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Awarded</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{awarded}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Component
// ============================================================================

function SolicitationTable({ solicitations }: { solicitations: RealEstateSolicitation[] }) {
  if (solicitations.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No Solicitations
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No solicitations have been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Est. Value
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
          {solicitations.map((solicitation) => (
            <tr key={solicitation.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {solicitation.title}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {solicitation.description?.slice(0, 50)}...
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {solicitation.solicitationType}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(solicitation.status)}`}>
                  {solicitation.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatDate(solicitation.dueDate)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatCurrency(solicitation.estimatedValue)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <Link
                  href={`/real-estate/solicitations/${solicitation.id}`}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Data Section
// ============================================================================

async function SolicitationDataSection() {
  const solicitations = await getSolicitations();

  return (
    <>
      <StatsCards solicitations={solicitations} />
      <div className="mt-8">
        <SolicitationTable solicitations={solicitations} />
      </div>
    </>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function SolicitationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/real-estate" className="hover:text-slate-700 dark:hover:text-slate-200">
            Real Estate
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Solicitations</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Solicitations</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Track and manage procurement solicitations.
            </p>
          </div>
          <CreateSolicitationModal />
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <SolicitationDataSection />
        </Suspense>
      </div>
    </div>
  );
}
