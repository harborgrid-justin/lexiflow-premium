/**
 * Type definitions for useEvidenceManager hook
 * @module hooks/useEvidenceManager/types
 */

import type { ChainOfCustodyEvent, EvidenceItem } from "@/types";

/**
 * View modes for evidence vault navigation
 */
export type ViewMode =
  | "dashboard"
  | "inventory"
  | "custody"
  | "intake"
  | "detail"
  | "authentication"
  | "relevance"
  | "hearsay"
  | "experts"
  | "originals";

/**
 * Detail view tabs for evidence inspection
 */
export type DetailTab = "overview" | "custody" | "admissibility" | "forensics";

/**
 * Comprehensive filter criteria for evidence search
 */
export interface EvidenceFilters {
  /** Text search across title, description, evidence number, Bates number */
  search: string;
  /** Evidence type filter */
  type: string;
  /** Admissibility status filter */
  admissibility: string;
  /** Case ID filter */
  caseId: string;
  /** Current custodian name filter */
  custodian: string;
  /** Collection date start (ISO date string) */
  dateFrom: string;
  /** Collection date end (ISO date string) */
  dateTo: string;
  /** Physical location filter */
  location: string;
  /** Tag search (comma-separated) */
  tags: string;
  /** Collector name filter */
  collectedBy: string;
  /** Filter for blockchain-verified evidence only */
  hasBlockchain: boolean;
}

/**
 * Return type for useEvidenceManager hook
 */
export interface UseEvidenceManagerReturn {
  /** Current view mode */
  view: ViewMode;
  /** Set view mode */
  setView: (view: ViewMode) => void;
  /** Active detail tab */
  activeTab: DetailTab;
  /** Set active detail tab */
  setActiveTab: (tab: DetailTab) => void;
  /** Selected evidence item */
  selectedItem: EvidenceItem | null;
  /** Select evidence item */
  selectItem: (item: EvidenceItem | null) => void;
  /** All evidence items */
  allItems: EvidenceItem[];
  /** All evidence items (alias) */
  evidenceItems: EvidenceItem[];
  /** Filtered evidence items */
  filteredItems: EvidenceItem[];
  /** Active filters */
  filters: EvidenceFilters;
  /** Set filters */
  setFilters: React.Dispatch<React.SetStateAction<EvidenceFilters>>;
  /** Update filter */
  updateFilter: <K extends keyof EvidenceFilters>(
    key: K,
    value: EvidenceFilters[K]
  ) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Handle custody update */
  handleCustodyUpdate: (event: ChainOfCustodyEvent) => void;
  /** Handle intake complete */
  handleIntakeComplete: (item: EvidenceItem) => void;
  /** Whether items are loading */
  isLoading: boolean;
  /** Navigate to detail view */
  viewDetail: (item: EvidenceItem) => void;
  /** Navigate to detail view (alias) */
  handleItemClick: (item: EvidenceItem) => void;
  /** Go back to list */
  goBack: () => void;
  /** Go back to list (alias) */
  handleBack: () => void;
}
