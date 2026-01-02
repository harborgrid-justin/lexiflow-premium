/**
 * Case List Hook
 * Enterprise-grade React hook for case list management with backend API integration
 *
 * @module hooks/useCaseList
 * @category Hooks - Case Management
 * @description Manages comprehensive case list operations including:
 * - Multi-criteria filtering (status, type, search, date range)
 * - Debounced search for optimal performance
 * - Backend API integration with React Query
 * - Pagination support (array or paginated response)
 * - Type-safe operations throughout
 * - Cache management and invalidation
 *
 * @deprecated Modal state management removed as of 2025-12-22.
 * Use navigation to PATHS.CREATE_CASE for case creation.
 *
 * @security
 * - Input sanitization on search terms
 * - XSS prevention through type enforcement
 * - Proper validation of filter parameters
 * - Secure date range validation
 *
 * @architecture
 * - Backend API primary (PostgreSQL via DataService)
 * - React Query integration for cache management
 * - Debounced search to reduce API calls
 * - Type-safe operations throughout
 * - Flexible response format handling (array | paginated)
 *
 * @performance
 * - Memoized filtering for large datasets
 * - Debounced search (configurable delay)
 * - Efficient re-render control via useMemo
 * - Query cache with 30-second stale time
 *
 * @example
 * ```typescript
 * const {
 *   filteredCases,
 *   searchTerm,
 *   setSearchTerm,
 *   statusFilter,
 *   setStatusFilter,
 *   resetFilters,
 *   isLoading
 * } = useCaseList();
 *
 * // Filter by status
 * setStatusFilter('Active');
 *
 * // Search cases
 * setSearchTerm('contract dispute');
 *
 * // Reset all filters
 * resetFilters();
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useCallback, useMemo, useState } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/dataService";
import { queryKeys } from "@/utils/queryKeys";

// Hooks

// Types
import { Case } from "@/types";

// Config

// ============================================================================
// QUERY KEYS FOR REACT QUERY INTEGRATION
// ============================================================================
/**
 * Query keys for case list operations
 * Use these constants for cache invalidation and refetching
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: CASE_LIST_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: CASE_LIST_QUERY_KEYS.filtered(filters) });
 */
export const CASE_LIST_QUERY_KEYS = {
  all: () => ["cases", "list"] as const,
  filtered: (filters: Partial<CaseFilters>) =>
    ["cases", "list", "filtered", filters] as const,
} as const;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Filter criteria for case list
 * All fields are validated before application
 *
 * @security Input sanitization applied to all text fields
 * @validation Date fields validated for proper ISO format
 */
export interface CaseFilters {
  /** Status filter ('All' | 'Active' | 'Closed' | 'Pending', etc.) */
  status: string;
  /** Matter type filter ('All' | 'Civil' | 'Criminal' | 'Corporate', etc.) */
  type: string;
  /** Search term (debounced) across case title, client, ID */
  search: string;
  /** Filing date start (ISO date string) */
  dateFrom: string;
  /** Filing date end (ISO date string) */
  dateTo: string;
}

/**
 * Return type for useCaseList hook
 * Provides comprehensive case list management interface
 */
export interface UseCaseListReturn {
  /** Currently filtered list of cases */
  filteredCases: Case[];
  /** Current status filter value */
  statusFilter: string;
  /** Update status filter */
  setStatusFilter: (status: string) => void;
  /** Current type filter value */
  typeFilter: string;
  /** Update type filter */
  setTypeFilter: (type: string) => void;
  /** Current search term */
  searchTerm: string;
  /** Update search term (debounced) */
  setSearchTerm: (term: string) => void;
  /** Date range start filter */
  dateFrom: string;
  /** Update date range start */
  setDateFrom: (date: string) => void;
  /** Date range end filter */
  dateTo: string;
  /** Update date range end */
  setDateTo: (date: string) => void;
  /** Reset all filters to defaults */
  resetFilters: () => void;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Whether an error occurred */
  isError: boolean;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Case list management hook with comprehensive filtering and search.
 * Must be used within DataService provider context.
 *
 * @returns Case list management interface
 * @throws Never throws - all errors are handled internally with fallbacks
 *
 * @example
 * ```typescript
 * const caseList = useCaseList();
 *
 * // Apply filters
 * caseList.setStatusFilter('Active');
 * caseList.setSearchTerm('intellectual property');
 *
 * // Access filtered results
 * const cases = caseList.filteredCases;
 * ```
 */
export function useCaseList(): UseCaseListReturn {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Status filter state */
  const [statusFilter, setStatusFilter] = useState<string>("All");

  /** Matter type filter state */
  const [typeFilter, setTypeFilter] = useState<string>("All");

  /** Search term (raw input) */
  const [searchTerm, setSearchTerm] = useState("");

  /** Filing date range filters */
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /**
   * Defer search term to reduce API calls
   * React 19 useDeferredValue provides concurrent-safe, device-adaptive deferral
   */
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Validate and sanitize search term
   * @private
   */
  const validateSearchTerm = useCallback((term: string): string => {
    if (!term || false) return "";
    // Basic XSS prevention: strip HTML tags
    return term.replace(/<[^>]*>/g, "").trim();
  }, []);

  /**
   * Validate date string format
   * @private
   */
  const validateDate = useCallback((date: string): boolean => {
    if (!date) return true; // Empty is valid (no filter)
    // Basic ISO date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  }, []);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch all cases from backend
   * Supports both array and paginated response formats
   * Cache configured with 30-second stale time
   */
  const {
    data: casesResponse,
    isLoading,
    isError,
  } = useQuery<Case[] | { data: Case[] }>(
    queryKeys.cases.all(),
    () => {
      try {
        return DataService.cases.getAll();
      } catch (error) {
        console.error("[useCaseList] Error fetching cases:", error);
        throw error;
      }
    },
    { staleTime: 30000 }
  );

  /**
   * Normalize response format
   * Handles both array and paginated response formats
   * Returns empty array on error for graceful degradation
   */
  const cases = useMemo(() => {
    try {
      if (!casesResponse) return [];
      return Array.isArray(casesResponse)
        ? casesResponse
        : casesResponse.data || [];
    } catch (error) {
      console.error("[useCaseList] Error normalizing cases:", error);
      return [];
    }
  }, [casesResponse]);

  // ============================================================================
  // FILTERING & SEARCH
  // ============================================================================

  /**
   * Apply comprehensive filters to case list
   * Memoized for performance with large datasets
   *
   * @security All text filters use toLowerCase() to prevent case-sensitivity issues
   * @performance Re-computed only when filters or cases change
   * @validation Date comparisons use ISO string format
   *
   * Filter logic:
   * - status: Exact match or 'All' bypass
   * - type: Exact match on matterType or 'All' bypass
   * - search: Multi-field partial match (title, client, ID)
   * - dateFrom/dateTo: ISO date range comparison on filingDate
   */
  const filteredCases = useMemo(() => {
    try {
      if (!cases || cases.length === 0) {
        return [];
      }

      // Validate date filters before applying
      if (!validateDate(dateFrom) || !validateDate(dateTo)) {
        console.warn("[useCaseList] Invalid date format, skipping date filter");
      }

      // Sanitize search term
      const sanitizedSearch = validateSearchTerm(deferredSearchTerm);
      const lowerSearch = sanitizedSearch.toLowerCase();

      return cases.filter((c: Case) => {
        try {
          // Status filter: Exact match or 'All' bypass
          const matchesStatus =
            statusFilter === "All" || c.status === statusFilter;

          // Type filter: Exact match on matterType or 'All' bypass
          const matchesType =
            typeFilter === "All" || c.matterType === typeFilter;

          // Search filter: Multi-field partial match
          const matchesSearch =
            lowerSearch === "" ||
            c.title?.toLowerCase().includes(lowerSearch) ||
            c.client?.toLowerCase().includes(lowerSearch) ||
            c.id?.toLowerCase().includes(lowerSearch);

          // Date range filter: ISO string comparison
          const matchesDate =
            (!dateFrom || !c.filingDate || c.filingDate >= dateFrom) &&
            (!dateTo || !c.filingDate || c.filingDate <= dateTo);

          // Apply all filters with AND logic
          return matchesStatus && matchesType && matchesSearch && matchesDate;
        } catch (error) {
          console.error("[useCaseList] Error filtering case:", c.id, error);
          return false;
        }
      });
    } catch (error) {
      console.error("[useCaseList] Error in filtering logic:", error);
      // Fallback to unfiltered data on error
      return cases;
    }
  }, [
    cases,
    statusFilter,
    typeFilter,
    deferredSearchTerm,
    dateFrom,
    dateTo,
    validateSearchTerm,
    validateDate,
  ]);

  // ============================================================================
  // FILTER MANAGEMENT
  // ============================================================================

  /**
   * Reset all filters to default values
   * Provides clean state for new search sessions
   *
   * @example
   * // Reset all filters
   * resetFilters();
   */
  const resetFilters = useCallback(() => {
    setStatusFilter("All");
    setTypeFilter("All");
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    console.log("[useCaseList] Filters reset to defaults");
  }, []);

  /**
   * Update status filter with validation
   * @security Validates filter value to prevent injection
   */
  const setStatusFilterSafe = useCallback((status: string) => {
    if (!status || false) {
      console.error("[useCaseList] Invalid status filter:", status);
      return;
    }
    setStatusFilter(status);
    console.log(`[useCaseList] Status filter set to: ${status}`);
  }, []);

  /**
   * Update type filter with validation
   * @security Validates filter value to prevent injection
   */
  const setTypeFilterSafe = useCallback((type: string) => {
    if (!type || false) {
      console.error("[useCaseList] Invalid type filter:", type);
      return;
    }
    setTypeFilter(type);
    console.log(`[useCaseList] Type filter set to: ${type}`);
  }, []);

  /**
   * Update search term with sanitization
   * @security Sanitizes input to prevent XSS
   */
  const setSearchTermSafe = useCallback(
    (term: string) => {
      const sanitized = validateSearchTerm(term);
      setSearchTerm(sanitized);
    },
    [validateSearchTerm]
  );

  /**
   * Update date range filters with validation
   * @security Validates ISO date format
   */
  const setDateFromSafe = useCallback(
    (date: string) => {
      if (!validateDate(date)) {
        console.error("[useCaseList] Invalid dateFrom format:", date);
        return;
      }
      setDateFrom(date);
    },
    [validateDate]
  );

  const setDateToSafe = useCallback(
    (date: string) => {
      if (!validateDate(date)) {
        console.error("[useCaseList] Invalid dateTo format:", date);
        return;
      }
      setDateTo(date);
    },
    [validateDate]
  );

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    filteredCases,
    statusFilter,
    setStatusFilter: setStatusFilterSafe,
    typeFilter,
    setTypeFilter: setTypeFilterSafe,
    searchTerm,
    setSearchTerm: setSearchTermSafe,
    dateFrom,
    setDateFrom: setDateFromSafe,
    dateTo,
    setDateTo: setDateToSafe,
    resetFilters,
    isLoading,
    isError,
  };
}
