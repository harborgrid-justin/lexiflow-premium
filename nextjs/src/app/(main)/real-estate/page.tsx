/**
 * Real Estate Module - Main Dashboard Page
 *
 * Provides a comprehensive overview of the organization's real estate portfolio
 * with quick access to all sub-modules and key metrics.
 *
 * Next.js 16 Compliance:
 * - Async Server Component
 * - generateMetadata for SEO
 * - Proper Suspense boundaries
 * - Type-safe data fetching
 *
 * @module app/(main)/real-estate/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Package,
  FileKey,
  MapPin,
  ClipboardCheck,
  FileText,
  Truck,
  Activity,
} from "lucide-react";
import { getPortfolioStats, type PortfolioStats } from "@/lib/dal/real-estate";

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "Real Estate | LexiFlow",
  description:
    "Comprehensive real estate portfolio management including acquisitions, disposals, inventory, and utilization tracking.",
  keywords: [
    "real estate",
    "property management",
    "portfolio",
    "acquisitions",
    "disposals",
  ],
};

// ============================================================================
// Types
// ============================================================================

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// ============================================================================
// Quick Links Configuration
// ============================================================================

const quickLinks: QuickLink[] = [
  {
    title: "Acquisition",
    description: "Property acquisition workflows",
    href: "/real-estate/acquisition",
    icon: ShoppingCart,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    title: "Disposal",
    description: "Property disposal processes",
    href: "/real-estate/disposal",
    icon: Package,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    title: "Inventory",
    description: "Property inventory management",
    href: "/real-estate/inventory",
    icon: Building2,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    title: "Portfolio Summary",
    description: "Portfolio overview",
    href: "/real-estate/portfolio-summary",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    title: "Cost Share",
    description: "Cost sharing calculations",
    href: "/real-estate/cost-share",
    icon: DollarSign,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  },
  {
    title: "Encroachment",
    description: "Encroachment handling",
    href: "/real-estate/encroachment",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
  {
    title: "Relocation",
    description: "Relocation tracking",
    href: "/real-estate/relocation",
    icon: Truck,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  {
    title: "Audit Readiness",
    description: "Compliance audits",
    href: "/real-estate/audit-readiness",
    icon: ClipboardCheck,
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  {
    title: "Outgrants",
    description: "Outgrant management",
    href: "/real-estate/outgrants",
    icon: FileKey,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  },
  {
    title: "Solicitations",
    description: "Solicitation tracking",
    href: "/real-estate/solicitations",
    icon: FileText,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    title: "Utilization",
    description: "Utilization metrics",
    href: "/real-estate/utilization",
    icon: Activity,
    color: "bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400",
  },
];

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
// Stats Card Component
// ============================================================================

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stats Section Component
// ============================================================================

async function StatsSection() {
  const stats = await getPortfolioStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Properties"
        value={formatNumber(stats.totalProperties)}
        subtitle={`${stats.activeProperties} active`}
        icon={Building2}
        color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <StatsCard
        title="Portfolio Value"
        value={formatCurrency(stats.totalValue)}
        icon={DollarSign}
        color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
      />
      <StatsCard
        title="Avg Utilization"
        value={`${stats.avgUtilizationRate.toFixed(1)}%`}
        icon={Activity}
        color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      />
      <StatsCard
        title="Pending Activity"
        value={formatNumber(stats.pendingAcquisitions + stats.pendingDisposals)}
        subtitle={`${stats.pendingAcquisitions} acq / ${stats.pendingDisposals} disp`}
        icon={TrendingUp}
        color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      />
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Quick Links Grid
// ============================================================================

function QuickLinksGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {quickLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600"
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 ${link.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ============================================================================
// Alert Section Component
// ============================================================================

async function AlertSection() {
  const stats = await getPortfolioStats();

  if (stats.activeEncroachments === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <div>
          <h3 className="font-medium text-amber-800 dark:text-amber-200">
            Attention Required
          </h3>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            There {stats.activeEncroachments === 1 ? "is" : "are"}{" "}
            {stats.activeEncroachments} active encroachment
            {stats.activeEncroachments !== 1 ? "s" : ""} that require attention.
          </p>
          <Link
            href="/real-estate/encroachment"
            className="mt-2 inline-block text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
          >
            View Encroachments
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function RealEstateDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Real Estate
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Comprehensive real estate portfolio management and property
            operations.
          </p>
        </div>

        {/* Key Metrics */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Portfolio Overview
          </h2>
          <Suspense fallback={<StatsSkeleton />}>
            <StatsSection />
          </Suspense>
        </section>

        {/* Alert Section */}
        <section className="mb-8">
          <Suspense fallback={null}>
            <AlertSection />
          </Suspense>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Modules
          </h2>
          <QuickLinksGrid />
        </section>
      </div>
    </div>
  );
}
