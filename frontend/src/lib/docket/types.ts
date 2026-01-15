/**
 * Docket Provider Types
 * Type definitions for docket management context
 *
 * @module lib/docket/types
 */

import type { DocketEntry } from "@/types/motion-docket";

export interface DocketStateValue {
  entries: DocketEntry[];
  activeEntryId: string | null;
  activeEntry: DocketEntry | null;
  isLoading: boolean;
  error: Error | null;
  filterByCaseId: string | null;
}

export interface DocketActionsValue {
  loadEntries: (caseId?: string) => Promise<void>;
  loadEntryById: (id: string) => Promise<DocketEntry | null>;
  createEntry: (data: Partial<DocketEntry>) => Promise<DocketEntry>;
  updateEntry: (
    id: string,
    updates: Partial<DocketEntry>
  ) => Promise<DocketEntry>;
  deleteEntry: (id: string) => Promise<void>;
  setActiveEntry: (id: string | null) => void;
  searchEntries: (query: string, caseId?: string) => Promise<DocketEntry[]>;
  filterByCase: (caseId: string | null) => void;
  refreshEntries: () => Promise<void>;
}

export interface DocketProviderProps {
  children: React.ReactNode;
  initialEntries?: DocketEntry[];
  caseId?: string;
}
