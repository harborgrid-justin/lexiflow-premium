/**
 * Utility functions for Data Sources Management
 * 
 * Pure functions with no side effects for status handling,
 * formatting, and UI helper logic.
 */

import type { ConnectionStatus } from './types';

/**
 * Maps connection status to Tailwind CSS classes for visual styling
 * 
 * @param status - Current connection status
 * @returns CSS class string for status badge styling
 */
export function getStatusColor(status: ConnectionStatus): string {
  switch (status) {
    case 'active': 
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'syncing': 
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'degraded': 
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'error': 
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    case 'disconnected': 
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    default: 
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

/**
 * Maps connection status to human-readable label
 * 
 * @param status - Current connection status
 * @returns User-friendly status label
 */
export function getStatusLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'active': 
      return 'Healthy';
    case 'syncing': 
      return 'Syncing';
    case 'degraded': 
      return 'Degraded';
    case 'error': 
      return 'Error';
    case 'disconnected': 
      return 'Not Connected';
    default: 
      return status;
  }
}

/**
 * Formats last sync time for display
 * 
 * @param lastSync - ISO timestamp of last sync or null
 * @returns Formatted time string or 'Never'
 */
export function formatLastSync(lastSync: string | null): string {
  if (!lastSync) return 'Never';
  
  try {
    const date = new Date(lastSync);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ago';
  } catch {
    return 'Never';
  }
}

/**
 * Calculates backend API coverage percentage
 * 
 * @param currentSource - Active data source type
 * @param backendServicesCount - Number of backend-enabled services
 * @param totalServicesCount - Total number of services
 * @returns Coverage object with counts and percentage
 */
export function calculateCoverage(
  currentSource: string,
  backendServicesCount: number,
  totalServicesCount: number
) {
  const coverage = currentSource === 'postgresql' ? backendServicesCount : 0;
  const indexedDbOnly = totalServicesCount - backendServicesCount;
  const percentage = totalServicesCount > 0 
    ? Math.round((coverage / totalServicesCount) * 100) 
    : 0;

  return {
    coverage,
    indexedDbOnly,
    percentage,
    total: totalServicesCount
  };
}
