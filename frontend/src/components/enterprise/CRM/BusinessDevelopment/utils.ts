/**
 * @module components/enterprise/CRM/BusinessDevelopment/utils
 * @description Pure utility functions for Business Development module
 */

import type { Lead, WinLossAnalysis } from "./types";

export function calculateActiveLeads(leads: Lead[]): number {
  return leads.filter((l) => !["Won", "Lost"].includes(l.status)).length;
}

export function calculatePipelineValue(leads: Lead[]): number {
  return leads
    .filter((l) => !["Won", "Lost"].includes(l.status))
    .reduce((acc, l) => acc + l.estimatedValue, 0);
}

export function calculateWonValue(leads: Lead[]): number {
  return leads
    .filter((l) => l.status === "Won")
    .reduce((acc, l) => acc + l.estimatedValue, 0);
}

export function calculateWinRate(leads: Lead[]): string {
  const wonCount = leads.filter((l) => l.status === "Won").length;
  const totalDecided = leads.filter((l) =>
    ["Won", "Lost"].includes(l.status)
  ).length;
  return ((wonCount / Math.max(totalDecided, 1)) * 100).toFixed(1);
}

export function calculateAverageSalesCycle(
  analyses: WinLossAnalysis[]
): number {
  if (analyses.length === 0) return 0;
  return Math.round(
    analyses.reduce((acc, w) => acc + w.salesCycle, 0) / analyses.length
  );
}

export function formatCurrency(value: number): string {
  return `$${(value / 1000).toFixed(0)}k`;
}

export function formatCurrencyMillions(value: number): string {
  return `$${(value / 1000000).toFixed(1)}M`;
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    Won: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Proposal:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Negotiation:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Completed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Submitted:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Complete:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "In Progress":
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Scheduled:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  return (
    statusColors[status] ||
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  );
}
