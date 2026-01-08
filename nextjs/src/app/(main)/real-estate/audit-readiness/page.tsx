/**
 * Real Estate: Audit Readiness Page
 *
 * Manages audit preparation and compliance tracking.
 *
 * @module app/(main)/real-estate/audit-readiness/page
 */

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  FileSearch,
} from "lucide-react";
import {
  getAuditItems,
  type RealEstateAuditItem,
  type AuditStatus,
} from "@/lib/dal/real-estate";
import { CreateAuditItemModal } from "./create-modal";

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Audit Readiness | Real Estate | LexiFlow",
    description: "Track audit preparation and compliance status for real estate assets.",
    keywords: ["audit", "compliance", "real estate", "readiness"],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: AuditStatus): string {
  switch (status) {
    case "Not Started":
      return "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20";
    case "In Progress":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
    case "Ready":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20";
    case "Needs Attention":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    case "Completed":
      return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20";
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

function StatsCards({ auditItems }: { auditItems: RealEstateAuditItem[] }) {
  const ready = auditItems.filter((a) => a.status === "Ready" || a.status === "Completed").length;
  const needsAttention = auditItems.filter((a) => a.status === "Needs Attention").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
            <ClipboardCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Items</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{auditItems.length}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ready</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{ready}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Needs Attention</p>
            <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{needsAttention}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Table Component
// ============================================================================

function AuditTable({ auditItems }: { auditItems: RealEstateAuditItem[] }) {
  if (auditItems.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <FileSearch className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No Audit Items
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No audit readiness items have been created yet.
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
              Audit Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Next Audit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Score
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
          {auditItems.map((audit) => (
            <tr key={audit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {audit.propertyName}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {audit.checklistItems?.length || 0} checklist items
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {audit.auditType}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(audit.status)}`}>
                  {audit.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatDate(audit.nextAuditDate)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {audit.score !== undefined ? `${audit.score}%` : "-"}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <Link
                  href={`/real-estate/audit-readiness/${audit.id}`}
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

async function AuditDataSection() {
  const auditItems = await getAuditItems();

  return (
    <>
      <StatsCards auditItems={auditItems} />
      <div className="mt-8">
        <AuditTable auditItems={auditItems} />
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

export default async function AuditReadinessPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/real-estate" className="hover:text-slate-700 dark:hover:text-slate-200">
            Real Estate
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 dark:text-white">Audit Readiness</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Readiness</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Prepare for audits and maintain compliance documentation.
            </p>
          </div>
          <CreateAuditItemModal />
        </div>

        {/* Content */}
        <Suspense fallback={<LoadingSkeleton />}>
          <AuditDataSection />
        </Suspense>
      </div>
    </div>
  );
}
