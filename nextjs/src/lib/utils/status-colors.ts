/**
 * Enterprise Status Color Utilities
 * Provides consistent status colors across the application using CSS variables
 *
 * Usage:
 *   import { getStatusColor, StatusType } from '@/lib/utils/status-colors';
 *   <Badge className={getStatusColor('success')}>Approved</Badge>
 */

export type StatusType = "success" | "warning" | "error" | "info" | "default";

export interface StatusConfig {
  bg: string;
  text: string;
  border: string;
}

/**
 * Get Tailwind classes for status colors
 */
export function getStatusColor(status: StatusType): string {
  const configs: Record<StatusType, string> = {
    success: "bg-success text-success-foreground border-success",
    warning: "bg-warning text-warning-foreground border-warning",
    error: "bg-destructive text-destructive-foreground border-destructive",
    info: "bg-info text-info-foreground border-info",
    default: "bg-secondary text-secondary-foreground border-border",
  };

  return configs[status];
}

/**
 * Get status color for legal compliance states
 */
export function getComplianceStatusColor(
  status: "cleared" | "pending" | "conflicts_found" | "needs_review"
): string {
  const map: Record<string, StatusType> = {
    cleared: "success",
    pending: "warning",
    conflicts_found: "error",
    needs_review: "info",
  };

  return getStatusColor(map[status] || "default");
}

/**
 * Get status color for deadline urgency
 */
export function getDeadlineStatusColor(daysUntilDue: number): string {
  if (daysUntilDue < 0) return getStatusColor("error"); // Overdue
  if (daysUntilDue <= 3) return getStatusColor("error"); // Critical
  if (daysUntilDue <= 7) return getStatusColor("warning"); // Urgent
  if (daysUntilDue <= 14) return getStatusColor("info"); // Upcoming
  return getStatusColor("default"); // Future
}

/**
 * Get status color for case stages
 */
export function getCaseStageColor(
  stage: "intake" | "discovery" | "litigation" | "trial" | "closed"
): string {
  const map: Record<string, StatusType> = {
    intake: "info",
    discovery: "warning",
    litigation: "warning",
    trial: "error",
    closed: "success",
  };

  return getStatusColor(map[stage] || "default");
}

/**
 * Get status color for document processing
 */
export function getDocumentStatusColor(
  status: "pending" | "processing" | "complete" | "failed"
): string {
  const map: Record<string, StatusType> = {
    pending: "info",
    processing: "warning",
    complete: "success",
    failed: "error",
  };

  return getStatusColor(map[status] || "default");
}
