/**
 * Cases Provider Types
 * Type definitions for case management context
 *
 * @module lib/cases/types
 */

import type { Case } from "@/types/case";

export interface CasesStateValue {
  cases: Case[];
  activeCaseId: string | null;
  activeCase: Case | null;
  isLoading: boolean;
  error: Error | null;
  lastSync: Date | null;
}

export interface CasesActionsValue {
  loadCases: () => Promise<void>;
  loadCaseById: (id: string) => Promise<Case | null>;
  createCase: (caseData: Partial<Case>) => Promise<Case>;
  updateCase: (id: string, updates: Partial<Case>) => Promise<Case>;
  deleteCase: (id: string) => Promise<void>;
  archiveCase: (id: string) => Promise<void>;
  setActiveCase: (id: string | null) => void;
  searchCases: (query: string) => Promise<Case[]>;
  refreshCases: () => Promise<void>;
}

export interface CasesProviderProps {
  children: React.ReactNode;
  initialCases?: Case[];
  preloadCaseId?: string;
}
