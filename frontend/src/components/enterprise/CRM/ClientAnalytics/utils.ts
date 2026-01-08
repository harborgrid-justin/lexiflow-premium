/**
 * @module components/enterprise/CRM/ClientAnalytics/utils
 * @description Pure utility functions for Client Analytics module
 */

import type {
  ClientLifetimeValue,
  ClientProfitability,
  ClientRiskAssessment,
  ClientSatisfaction,
} from "./types";

export function calculateTotalProfit(data: ClientProfitability[]): number {
  return data.reduce((acc, p) => acc + p.profit, 0);
}

export function calculateAvgProfitMargin(data: ClientProfitability[]): number {
  if (data.length === 0) return 0;
  return data.reduce((acc, p) => acc + p.profitMargin, 0) / data.length;
}

export function calculateTotalLTV(data: ClientLifetimeValue[]): number {
  return data.reduce((acc, l) => acc + l.ltv, 0);
}

export function calculateAvgNPS(data: ClientSatisfaction[]): number {
  if (data.length === 0) return 0;
  return data.reduce((acc, s) => acc + s.nps, 0) / data.length;
}

export function countHighRiskClients(data: ClientRiskAssessment[]): number {
  return data.filter(
    (r) => r.overallRisk === "High" || r.overallRisk === "Critical"
  ).length;
}

export function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
  return colors[risk] ?? colors.Medium;
}

export function getRiskBarColor(score: number): string {
  if (score >= 70) return "bg-red-600";
  if (score >= 40) return "bg-yellow-600";
  return "bg-green-600";
}

export function formatFactorName(factor: string): string {
  return factor
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace("Risk", "");
}

export function getDaysOutstandingColor(days: number): string {
  if (days > 60) return "text-red-600";
  if (days > 30) return "text-yellow-600";
  return "";
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function formatCurrencyMillions(value: number): string {
  return `$${(value / 1000000).toFixed(1)}M`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
