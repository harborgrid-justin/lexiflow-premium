/**
 * Real Estate: Acquisition Page
 *
 * Manages property acquisitions including land purchases,
 * building acquisitions, and transaction workflows.
 *
 * Next.js 16 Compliance:
 * - Async Server Component
 * - generateMetadata for SEO
 * - Server Actions for mutations
 * - Proper Suspense boundaries
 *
 * @module app/(main)/real-estate/acquisition/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
  Plus,
} from "lucide-react";
import {
  getAcquisitions,
  type RealEstateAcquisition,
  type AcquisitionStatus,
} from "@/lib/dal/real-estate";
import { AcquisitionTable } from "./acquisition-table";
import { CreateAcquisitionDialog } from "./create-dialog";

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Acquisition | Real Estate | LexiFlow",
    description:
      "Manage real estate acquisitions including land purchases, building acquisitions, and transaction workflows.",
    keywords: ["acquisition", "real estate", "property purchase", "due diligence"],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

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

interface Stats {
  total: number;
  pending: number;
  completed: number;
  totalInvestment: number;
}

function calculateStats(acquisitions: RealEstateAcquisition[]): Stats {
  const pending = acquisitions.filter(
    (a) =>
      a.status === "Prospecting" ||
      a.status === "Under Contract" ||
      a.status === "Due Diligence"
  );

  return {
    total: acquisitions.length,
    pending: pending.length,
    completed: acquisitions.filter((a) => a.status === "Closed").length,
    totalInvestment: acquisitions.reduce(
      (sum, a) => sum + (a.finalPrice || a.offeredPrice || 0),
      0
    ),
  };
}

function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <ShoppingCart className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {stats.total}
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              In Progress
            </p>
            <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
              {stats.pending}
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Completed
            </p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.completed}
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Investment
            </p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(stats.totalInvestment)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Data Section
// ============================================================================

async function AcquisitionDataSection() {
  const acquisitions = await getAcquisitions();
  const stats = calculateStats(acquisitions);

  return (
    <>
      <StatsCards stats={stats} />
      <div className="mt-8">
        <AcquisitionTable acquisitions={acquisitions} />
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
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
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
      <div className="mt-8 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function AcquisitionPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <Link
            href="/real-estate"
            className="hover:text-slate-700 dark:hover:text-slate-200"
          >
            Real Estate
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Acquisition</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Acquisition
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage property acquisitions and related transaction workflows.
            </p>
          </div>
          <CreateAcquisitionDialog />
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <AcquisitionDataSection />
        </Suspense>
      </div>
    </div>
  );
}
