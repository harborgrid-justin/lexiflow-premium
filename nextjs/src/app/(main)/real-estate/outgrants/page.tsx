/**
 * Real Estate: Outgrants Page
 *
 * Manages outgrants including leases, licenses, and permits.
 *
 * @module app/(main)/real-estate/outgrants/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  FileKey,
  Clock,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import {
  getOutgrants,
  type RealEstateOutgrant,
  type OutgrantStatus,
} from "@/lib/dal/real-estate";
import { CreateOutgrantModal } from "./create-modal";

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Outgrants | Real Estate | LexiFlow",
    description: "Manage outgrants including leases, licenses, permits, and easements.",
    keywords: ["outgrants", "real estate", "leases", "permits", "easements"],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: OutgrantStatus): string {
  switch (status) {
    case "Active":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
    case "Expired":
      return "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20";
    case "Pending Renewal":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    case "Terminated":
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

function StatsCards({ outgrants }: { outgrants: RealEstateOutgrant[] }) {
  const active = outgrants.filter((o) => o.status === "Active").length;
  const pendingRenewal = outgrants.filter((o) => o.status === "Pending Renewal").length;
  const totalMonthlyRevenue = outgrants.reduce((sum, o) => sum + (o.monthlyRent || 0), 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <FileKey className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{outgrants.length}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{active}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pending Renewal</p>
            <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{pendingRenewal}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Revenue</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(totalMonthlyRevenue)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Component
// ============================================================================

function OutgrantTable({ outgrants }: { outgrants: RealEstateOutgrant[] }) {
  if (outgrants.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <FileKey className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No Outgrants
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No outgrants have been created yet.
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
              Grantee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Rent
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
          {outgrants.map((outgrant) => (
            <tr key={outgrant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {outgrant.propertyName}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(outgrant.startDate)} - {formatDate(outgrant.endDate)}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {outgrant.grantType}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {outgrant.grantee}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(outgrant.status)}`}>
                  {outgrant.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatCurrency(outgrant.monthlyRent)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <Link
                  href={`/real-estate/outgrants/${outgrant.id}`}
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

async function OutgrantDataSection() {
  const outgrants = await getOutgrants();

  return (
    <>
      <StatsCards outgrants={outgrants} />
      <div className="mt-8">
        <OutgrantTable outgrants={outgrants} />
      </div>
    </>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
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

export default async function OutgrantsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/real-estate" className="hover:text-slate-700 dark:hover:text-slate-200">
            Real Estate
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Outgrants</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Outgrants</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage leases, licenses, permits, and easements.
            </p>
          </div>
          <CreateOutgrantModal />
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <OutgrantDataSection />
        </Suspense>
      </div>
    </div>
  );
}
