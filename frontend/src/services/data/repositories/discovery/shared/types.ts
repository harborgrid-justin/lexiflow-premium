/**
 * Shared Type Definitions
 * Common types used across discovery service modules
 *
 * @module types
 */

/**
 * Discovery funnel statistics interface
 * Represents document counts at each stage of the discovery process
 */
export interface FunnelStat {
  /** Stage name (e.g., 'Collection', 'Processing') */
  name: string;
  /** Numeric value for this stage */
  value: number;
  /** Human-readable label with formatting */
  label: string;
}

/**
 * Generic filter type for case-based queries
 */
export interface CaseFilter {
  caseId?: string;
}

/**
 * Common API response wrapper
 * Used when backend returns paginated or wrapped results
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}
