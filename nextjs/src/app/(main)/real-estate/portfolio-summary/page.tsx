/**
 * Real Estate: Portfolio Summary Page
 *
 * Provides comprehensive portfolio overview with analytics and insights.
 *
 * @module app/(main)/real-estate/portfolio-summary/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  MapPin,
  LayoutGrid,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  getPortfolioStats,
  getAllProperties,
  getUtilization,
} from "@/lib/dal/real-estate";

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Portfolio Summary | Real Estate | LexiFlow",
    description: "Comprehensive portfolio overview with analytics, metrics, and insights for all real estate assets.",
    keywords: ["portfolio", "real estate", "analytics", "metrics", "overview"],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

// ============================================================================
// Stats Section Component
// ============================================================================

async function PortfolioStats() {
  const stats = await getPortfolioStats();
  const properties = await getAllProperties();
  const utilization = await getUtilization();

  const propertyTypeBreakdown = properties.reduce((acc, p) => {
    acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stateBreakdown = properties.reduce((acc, p) => {
    acc[p.state] = (acc[p.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">+5%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Properties</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatNumber(stats.totalProperties)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">+12%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Value</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(stats.totalValue)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            {stats.avgUtilizationRate >= 70 ? (
              <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-xs font-medium">Good</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600 dark:text-amber-400">
                <ArrowDownRight className="h-4 w-4" />
                <span className="text-xs font-medium">Low</span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Avg Utilization</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stats.avgUtilizationRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <LayoutGrid className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Sq. Ft.</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatNumber(stats.totalSquareFootage)}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Property Type Breakdown */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Property Types
          </h3>
          <div className="space-y-3">
            {Object.entries(propertyTypeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full dark:bg-slate-700">
                    <div
                      className="h-2 bg-blue-600 rounded-full dark:bg-blue-400"
                      style={{ width: `${(count / properties.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stateBreakdown).map(([state, count]) => (
              <div key={state} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">{state}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full dark:bg-slate-700">
                    <div
                      className="h-2 bg-emerald-600 rounded-full dark:bg-emerald-400"
                      style={{ width: `${(count / properties.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Activity Summary
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-600 dark:text-blue-400">Pending Acquisitions</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.pendingAcquisitions}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <p className="text-sm text-amber-600 dark:text-amber-400">Pending Disposals</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {stats.pendingDisposals}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">Active Encroachments</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats.activeEncroachments}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Active Properties</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.activeProperties}
            </p>
          </div>
        </div>
      </div>

      {/* Utilization Overview */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Utilization Overview
        </h3>
        {utilization.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No utilization data available.</p>
        ) : (
          <div className="space-y-4">
            {utilization.map((util) => (
              <div key={util.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {util.propertyName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {util.primaryUse}
                  </p>
                </div>
                <div className="w-32">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full dark:bg-slate-700">
                      <div
                        className={`h-2 rounded-full ${
                          util.utilizationRate >= 80
                            ? "bg-emerald-500"
                            : util.utilizationRate >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(util.utilizationRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-900 dark:text-white">
                      {util.utilizationRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="h-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function PortfolioSummaryPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/real-estate" className="hover:text-slate-700 dark:hover:text-slate-200">
            Real Estate
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Portfolio Summary</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Summary</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Comprehensive overview of your real estate portfolio with key metrics and insights.
          </p>
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <PortfolioStats />
        </Suspense>
      </div>
    </div>
  );
}
