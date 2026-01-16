import { createContext } from 'react';
import type { Case, Invoice, CaseStatus } from '@/types';

/**
 * Filter configuration
 */
export interface CaseListFilters {
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
export interface CaseMetrics {
  activeCases: number;
  intakePipeline: number;
  upcomingDeadlines: number;
  totalRevenue: number;
}

/**
 * Context value shape (immutable, memoized)
 */
export interface CaseListContextValue {
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
  handleParentTabChange: (parentId: string, defaultSubTabId?: string) => void;
  refreshData: () => void;
}

export const CaseListContext = createContext<CaseListContextValue | null>(null);
