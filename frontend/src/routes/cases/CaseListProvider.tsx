/**
 * Case List Provider - Domain Logic Layer
 *
 * ENTERPRISE ARCHITECTURE PATTERN:
 * - Domain context scoped to route (NOT global)
 * - Initialized with loader data
 * - Provides domain state and operations
 * - Memoized selectors for performance
 * - Stable callbacks to prevent re-renders
 *
 * RESPONSIBILITY:
 * - Domain state management
 * - Business logic (filtering, sorting, computations)
 * - Derived state (metrics, aggregations)
 * - State synchronization
 * - NO presentation logic
 * - NO direct rendering
 *
 * @module routes/cases/CaseListProvider
 */

import type { Case, Invoice } from '@/types';
import { CaseStatus } from '@/types';
import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { useRevalidator } from 'react-router';

/**
 * Context value shape (immutable, memoized)
 */
interface CaseListContextValue {
  // State
  readonly cases: readonly Case[];
  readonly invoices: readonly Invoice[];
  readonly activeTab: string;
  readonly filters: CaseListFilters;
  readonly isPending: boolean;

  // Derived state
  readonly metrics: CaseMetrics;
  readonly filteredCases: readonly Case[];
  readonly activeParentTab: string;

  // Actions
  setActiveTab: (tab: string) => void;
  setFilters: (filters: Partial<CaseListFilters>) => void;
  handleParentTabChange: (parentId: string) => void;
  refreshData: () => void;
}

/**
 * Filter configuration
 */
interface CaseListFilters {
  status?: CaseStatus;
  type?: string;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Metrics shape
 */
interface CaseMetrics {
  activeCases: number;
  intakePipeline: number;
  upcomingDeadlines: number;
  totalRevenue: number;
}

/**
 * Provider props
 */
interface CaseListProviderProps {
  initialCases: Case[];
  initialInvoices: Invoice[];
  children: React.ReactNode;
}

// Context creation (split for optimization)
const CaseListContext = createContext<CaseListContextValue | null>(null);

/**
 * Custom hook for consuming context
 * Throws if used outside provider (fail-fast)
 */
export function useCaseList(): CaseListContextValue {
  const context = useContext(CaseListContext);
  if (!context) {
    throw new Error('useCaseList must be used within CaseListProvider');
  }
  return context;
}

/**
 * Provider component - domain logic layer
 *
 * CONCURRENT FEATURES:
 * - useTransition for non-urgent updates (tab changes)
 * - useMemo for expensive computations (metrics, filtering)
 * - useCallback for stable references (prevent child re-renders)
 */
export function CaseListProvider({
  initialCases,
  initialInvoices,
  children
}: CaseListProviderProps) {
  // ROUTER INTEGRATION
  const revalidator = useRevalidator();

  // LOCAL STATE (UI-specific)
  const [activeTab, _setActiveTab] = useState<string>('overview');
  const [filters, setFiltersState] = useState<CaseListFilters>({});
  const [isPending, startTransition] = useTransition();

  // SERVER STATE (from loader - treat as immutable)
  const cases = useMemo(() => initialCases, [initialCases]);
  const invoices = useMemo(() => initialInvoices, [initialInvoices]);

  /**
   * Set active tab with transition (non-urgent)
   */
  const setActiveTab = useCallback((tab: string) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  }, []);

  /**
   * Update filters (immediate for better UX)
   */
  const setFilters = useCallback((newFilters: Partial<CaseListFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Handle parent tab change (navigate to first sub-tab)
   */
  const handleParentTabChange = useCallback((parentId: string) => {
    // This would map to actual tab structure
    // For now, simplified implementation
    startTransition(() => {
      _setActiveTab(parentId);
    });
  }, []);

  /**
   * Refresh data from server
   */
  const refreshData = useCallback(() => {
    revalidator.revalidate();
  }, [revalidator]);

  /**
   * DERIVED STATE: Compute metrics from cases and invoices
   * Memoized to prevent recalculation on every render
   */
  const metrics = useMemo<CaseMetrics>(() => {
    const activeCases = cases.filter(c => c.status === CaseStatus.Active).length;

    const intakePipeline = cases.filter(c =>
      c.status === CaseStatus.Open || c.status === CaseStatus.PreFiling
    ).length;

    const upcomingDeadlines = cases.filter(c => {
      if (!c.closeDate) return false;
      const deadline = new Date(c.closeDate);
      const daysUntil = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 7;
    }).length;

    const totalRevenue = invoices.reduce((sum, inv) => {
      return sum + ((inv as unknown as { totalAmount?: number }).totalAmount || 0);
    }, 0);

    return {
      activeCases,
      intakePipeline,
      upcomingDeadlines,
      totalRevenue,
    };
  }, [cases, invoices]);

  /**
   * DERIVED STATE: Filter cases based on active filters
   */
  const filteredCases = useMemo(() => {
    let result = [...cases];

    if (filters.status) {
      result = result.filter(c => c.status === filters.status);
    }

    if (filters.type && filters.type !== 'All') {
      result = result.filter(c => c.type === filters.type);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.caseNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateRange) {
      result = result.filter(c => {
        if (!c.createdAt) return false;
        const caseDate = new Date(c.createdAt);
        return caseDate >= filters.dateRange!.start &&
          caseDate <= filters.dateRange!.end;
      });
    }

    return result;
  }, [cases, filters]);

  /**
   * DERIVED STATE: Active parent tab (computed from active sub-tab)
   */
  const activeParentTab = useMemo(() => {
    // This would map to actual tab structure
    // For now, simplified
    return activeTab;
  }, [activeTab]);

  /**
   * Memoize context value to prevent unnecessary re-renders
   * Only updates when dependencies change
   */
  const value = useMemo<CaseListContextValue>(() => ({
    // State
    cases,
    invoices,
    activeTab,
    filters,
    isPending,

    // Derived
    metrics,
    filteredCases,
    activeParentTab,

    // Actions
    setActiveTab,
    setFilters,
    handleParentTabChange,
    refreshData,
  }), [
    cases,
    invoices,
    activeTab,
    filters,
    isPending,
    metrics,
    filteredCases,
    activeParentTab,
    setActiveTab,
    setFilters,
    handleParentTabChange,
    refreshData,
  ]);

  return (
    <CaseListContext.Provider value={value}>
      {children}
    </CaseListContext.Provider>
  );
}
