/**
 * Real Estate: Disposal Page
 *
 * Manages property disposals including sales, transfers, and demolitions.
 *
 * @module app/(main)/real-estate/disposal/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  Plus,
} from "lucide-react";
import {
  getDisposals,
  type RealEstateDisposal,
  type DisposalStatus,
} from "@/lib/dal/real-estate";

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Disposal | Real Estate | LexiFlow",
    description: "Manage property disposals including sales, transfers, donations, and demolitions.",
    keywords: ["disposal", "real estate", "property sale", "asset disposition"],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: DisposalStatus): string {
  switch (status) {
    case "Pending":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    case "In Progress":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
    case "Completed":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
    case "Cancelled":
      return "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20";
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

// ============================================================================
// Stats Component
// ============================================================================

function StatsCards({ disposals }: { disposals: RealEstateDisposal[] }) {
  const pending = disposals.filter((d) => d.status === "Pending").length;
  const inProgress = disposals.filter((d) => d.status === "In Progress").length;
  const completed = disposals.filter((d) => d.status === "Completed").length;
  const totalValue = disposals.reduce((sum, d) => sum + (d.actualValue || d.estimatedValue || 0), 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {disposals.length}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
              {pending + inProgress}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {completed}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Value</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Component
// ============================================================================

function DisposalTable({ disposals }: { disposals: RealEstateDisposal[] }) {
  if (disposals.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <Package className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No Disposals
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No property disposals have been initiated yet.
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
              Property
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
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
          {disposals.map((disposal) => (
            <tr key={disposal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {disposal.propertyName}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {disposal.reason?.slice(0, 50)}...
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {disposal.disposalType}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(disposal.status)}`}>
                  {disposal.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatCurrency(disposal.estimatedValue)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  View
                </button>
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

async function DisposalDataSection() {
  const disposals = await getDisposals();

  return (
    <>
      <StatsCards disposals={disposals} />
      <div className="mt-8">
        <DisposalTable disposals={disposals} />
      </div>
    </>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function DisposalPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/real-estate" className="hover:text-slate-700 dark:hover:text-slate-200">
            Real Estate
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Disposal</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Disposal</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage property disposals and asset disposition workflows.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            New Disposal
          </button>
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <DisposalDataSection />
        </Suspense>
      </div>
    </div>
  );
}
