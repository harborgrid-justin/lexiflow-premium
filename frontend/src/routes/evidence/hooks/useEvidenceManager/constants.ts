/**
 * Constants for useEvidenceManager hook
 * @module hooks/useEvidenceManager/constants
 */

import type { EvidenceFilters } from "./types";

/**
 * Query keys for evidence vault operations
 */
export const EVIDENCE_VAULT_QUERY_KEYS = {
  all: () => ["evidence-vault"] as const,
  byCase: (caseId: string) => ["evidence-vault", "case", caseId] as const,
  filtered: (filters: Partial<EvidenceFilters>) =>
    ["evidence-vault", "filtered", filters] as const,
} as const;

/**
 * Default filter values
 */
export const DEFAULT_FILTERS: EvidenceFilters = {
  search: "",
  type: "",
  admissibility: "",
  caseId: "",
  custodian: "",
  dateFrom: "",
  dateTo: "",
  location: "",
  tags: "",
  collectedBy: "",
  hasBlockchain: false,
};

/**
 * Default view mode
 */
export const DEFAULT_VIEW_MODE = "dashboard" as const;

/**
 * Default detail tab
 */
export const DEFAULT_DETAIL_TAB = "overview" as const;
