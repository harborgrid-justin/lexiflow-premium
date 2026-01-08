/**
 * Real Estate: Inventory Page
 *
 * Manages the complete inventory of real estate properties.
 *
 * @module app/(main)/real-estate/inventory/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Building2,
  MapPin,
  DollarSign,
  LayoutGrid,
  Plus,
} from "lucide-react";
import {
  getAllProperties,
  type RealEstateProperty,
  type PropertyStatus,
} from "@/lib/dal/real-estate";

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Inventory | Real Estate | LexiFlow",
    description: "Complete inventory of all real estate properties including buildings, land, and facilities.",
    keywords: ["inventory", "real estate", "property management", "assets"],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: PropertyStatus): string {
  switch (status) {
    case "Active":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
    case "Inactive":
      return "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20";
    case "Pending":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    case "Under Review":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
    case "Archived":
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

function formatNumber(value?: number): string {
  if (!value) return "-";
  return new Intl.NumberFormat("en-US").format(value);
}

// ============================================================================
// Stats Component
// ============================================================================

function StatsCards({ properties }: { properties: RealEstateProperty[] }) {
  const totalValue = properties.reduce((sum, p) => sum + (p.currentValue || 0), 0);
  const totalSqFt = properties.reduce((sum, p) => sum + (p.squareFootage || 0), 0);
  const activeCount = properties.filter((p) => p.status === "Active").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Properties</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {properties.length}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
            <LayoutGrid className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Sq. Ft.</p>
            <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
              {formatNumber(totalSqFt)}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
            <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Value</p>
            <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
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

function InventoryTable({ properties }: { properties: RealEstateProperty[] }) {
  if (properties.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <Building2 className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No Properties
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No properties have been added to the inventory yet.
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
              Sq. Ft.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Value
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
          {properties.map((property) => (
            <tr key={property.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {property.name}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {property.city}, {property.state}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {property.propertyType}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatNumber(property.squareFootage)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatCurrency(property.currentValue)}
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

async function InventoryDataSection() {
  const properties = await getAllProperties();

  return (
    <>
      <StatsCards properties={properties} />
      <div className="mt-8">
        <InventoryTable properties={properties} />
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

export default async function InventoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/real-estate" className="hover:text-slate-700 dark:hover:text-slate-200">
            Real Estate
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Inventory</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Complete inventory of all real estate properties.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Property
          </button>
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <InventoryDataSection />
        </Suspense>
      </div>
    </div>
  );
}
