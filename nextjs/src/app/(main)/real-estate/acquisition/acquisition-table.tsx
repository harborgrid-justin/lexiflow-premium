"use client";

/**
 * Acquisition Table Component
 *
 * Client component for displaying and interacting with acquisition data.
 *
 * @module app/(main)/real-estate/acquisition/acquisition-table
 */

import { useState } from "react";
import { ShoppingCart, Plus } from "lucide-react";
import type {
  RealEstateAcquisition,
  AcquisitionStatus,
} from "@/lib/dal/real-estate";

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: AcquisitionStatus): string {
  switch (status) {
    case "Prospecting":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
    case "Under Contract":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    case "Due Diligence":
      return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20";
    case "Closed":
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ============================================================================
// Component
// ============================================================================

interface AcquisitionTableProps {
  acquisitions: RealEstateAcquisition[];
}

export function AcquisitionTable({ acquisitions }: AcquisitionTableProps) {
  if (acquisitions.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <ShoppingCart className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No Acquisitions
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No property acquisitions have been initiated yet.
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
              Asking Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Close
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
          {acquisitions.map((acquisition) => (
            <tr
              key={acquisition.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {acquisition.propertyName}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {acquisition.address}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {acquisition.propertyType}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                    acquisition.status
                  )}`}
                >
                  {acquisition.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatCurrency(acquisition.askingPrice)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {formatDate(acquisition.targetCloseDate)}
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
