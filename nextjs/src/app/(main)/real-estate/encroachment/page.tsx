/**
 * Real Estate: Encroachment Page
 *
 * Manages encroachment cases involving unauthorized use of property.
 *
 * @module app/(main)/real-estate/encroachment/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Plus,
} from "lucide-react";
import {
  getEncroachments,
  type RealEstateEncroachment,
  type EncroachmentStatus,
} from "@/lib/dal/real-estate";

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Encroachment | Real Estate | LexiFlow",
    description: "Manage encroachment cases involving unauthorized property use including investigation and resolution tracking.",
    keywords: ["encroachment", "real estate", "property boundaries", "trespass"],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: EncroachmentStatus): string {
  switch (status) {
    case "Active":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    case "Under Review":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    case "Resolved":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
    case "Dismissed":
      return "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20";
    default:
      return "text-slate-600 bg-slate-50";
  }
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

function StatsCards({ encroachments }: { encroachments: RealEstateEncroachment[] }) {
  const active = encroachments.filter((e) => e.status === "Active" || e.status === "Under Review").length;
  const resolved = encroachments.filter((e) => e.status === "Resolved").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Cases</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{encroachments.length}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Cases</p>
            <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{active}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Resolved</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{resolved}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Component
// ============================================================================

function EncroachmentTable({ encroachments }: { encroachments: RealEstateEncroachment[] }) {
  if (encroachments.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <AlertTriangle className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No Encroachment Cases
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No encroachment cases have been reported yet.
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
              Discovered
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
          {encroachments.map((encroachment) => (
            <tr key={encroachment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {encroachment.propertyName}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {encroachment.description?.slice(0, 50)}...
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {encroachment.encroachmentType}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(encroachment.status)}`}>
                  {encroachment.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatDate(encroachment.discoveredDate)}
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

async function EncroachmentDataSection() {
  const encroachments = await getEncroachments();

  return (
    <>
      <StatsCards encroachments={encroachments} />
      <div className="mt-8">
        <EncroachmentTable encroachments={encroachments} />
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

export default async function EncroachmentPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/real-estate" className="hover:text-slate-700 dark:hover:text-slate-200">
            Real Estate
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Encroachment</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Encroachment</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Track and resolve encroachment cases on properties.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Report Encroachment
          </button>
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <EncroachmentDataSection />
        </Suspense>
      </div>
    </div>
  );
}
