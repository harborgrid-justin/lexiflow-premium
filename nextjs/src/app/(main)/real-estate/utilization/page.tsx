/**
 * Real Estate: Utilization Page
 *
 * Tracks and analyzes utilization rates of real estate assets.
 *
 * @module app/(main)/real-estate/utilization/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  getUtilization,
  type RealEstateUtilization,
} from "@/lib/dal/real-estate";
import { CreateUtilizationModal } from "./create-modal";

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Utilization | Real Estate | LexiFlow",
    description: "Track and analyze utilization rates of real estate assets including occupancy and space efficiency.",
    keywords: ["utilization", "real estate", "occupancy", "space efficiency"],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getUtilizationColor(rate: number): string {
  if (rate >= 80) return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
  if (rate >= 60) return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
  return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
}

function getUtilizationBarColor(rate: number): string {
  if (rate >= 80) return "bg-emerald-500";
  if (rate >= 60) return "bg-amber-500";
  return "bg-red-500";
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

function StatsCards({ utilization }: { utilization: RealEstateUtilization[] }) {
  const avgRate = utilization.length > 0
    ? utilization.reduce((sum, u) => sum + u.utilizationRate, 0) / utilization.length
    : 0;
  const underutilized = utilization.filter((u) => u.utilizationRate < 70).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <BarChart3 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Properties Tracked</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{utilization.length}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Avg Utilization</p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{avgRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Underutilized (&lt;70%)</p>
            <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{underutilized}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Component
// ============================================================================

function UtilizationTable({ utilization }: { utilization: RealEstateUtilization[] }) {
  if (utilization.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <Activity className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No Utilization Data
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No utilization records have been created yet.
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
              Primary Use
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Utilization
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Occupancy
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Last Assessment
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
          {utilization.map((util) => (
            <tr key={util.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {util.propertyName}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {util.departments?.join(", ") || "No departments assigned"}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {util.primaryUse}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full dark:bg-slate-700">
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
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {util.currentOccupancy} / {util.totalCapacity}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatDate(util.lastAssessmentDate)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <Link
                  href={`/real-estate/utilization/${util.id}`}
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

async function UtilizationDataSection() {
  const utilization = await getUtilization();

  return (
    <>
      <StatsCards utilization={utilization} />
      <div className="mt-8">
        <UtilizationTable utilization={utilization} />
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

export default async function UtilizationPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/real-estate" className="hover:text-slate-700 dark:hover:text-slate-200">
            Real Estate
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Utilization</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Utilization</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Monitor and optimize real estate utilization rates and space efficiency.
            </p>
          </div>
          <CreateUtilizationModal />
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <UtilizationDataSection />
        </Suspense>
      </div>
    </div>
  );
}
