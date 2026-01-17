/**
 * Utility functions for useEvidenceManager hook
 * @module hooks/useEvidenceManager/utils
 */

import type { EvidenceFilters } from "./types";
import type { EvidenceItem } from "@/types";

/**
 * Validate evidence item for completeness
 */
export function validateEvidenceItem(item: EvidenceItem): {
  valid: boolean;
  error?: string;
} {
  if (!item || !item.id) {
    return { valid: false, error: "Invalid evidence item" };
  }
  return { valid: true };
}

/**
 * Normalize API response to evidence items array
 */
export function normalizeEvidenceResponse(data: unknown): EvidenceItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  // Handle paginated response
  if (
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as Record<string, unknown>).data)
  ) {
    return (data as Record<string, unknown>).data as EvidenceItem[];
  }

  // Handle items property
  if (
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as Record<string, unknown>).items)
  ) {
    return (data as Record<string, unknown>).items as EvidenceItem[];
  }

  console.warn("[useEvidenceManager] Data is not an array:", data);
  return [];
}

/**
 * Apply comprehensive filters to evidence items
 */
export function applyEvidenceFilters(
  items: EvidenceItem[],
  filters: EvidenceFilters
): EvidenceItem[] {
  try {
    return items.filter((e: EvidenceItem) => {
      const matchesSearch =
        !filters.search ||
        e.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.description?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = !filters.type || e.type === filters.type;

      const matchesAdmissibility =
        !filters.admissibility || e.admissibility === filters.admissibility;

      const matchesCaseId =
        !filters.caseId ||
        e.caseId?.toLowerCase().includes(filters.caseId.toLowerCase());

      const matchesCustodian =
        !filters.custodian ||
        e.custodian?.toLowerCase().includes(filters.custodian.toLowerCase());

      const matchesDateFrom =
        !filters.dateFrom ||
        (e.collectionDate && e.collectionDate >= filters.dateFrom);

      const matchesDateTo =
        !filters.dateTo ||
        (e.collectionDate && e.collectionDate <= filters.dateTo);

      const matchesLocation =
        !filters.location ||
        e.location?.toLowerCase().includes(filters.location.toLowerCase());

      const matchesTags =
        !filters.tags ||
        e.tags?.some((t: string) =>
          t.toLowerCase().includes(filters.tags.toLowerCase())
        );

      const matchesCollectedBy =
        !filters.collectedBy ||
        e.collectedBy
          ?.toLowerCase()
          .includes(filters.collectedBy.toLowerCase());

      const matchesBlockchain =
        !filters.hasBlockchain ||
        (e.blockchainHash && e.blockchainHash.length > 0);

      return (
        matchesSearch &&
        matchesType &&
        matchesAdmissibility &&
        matchesCaseId &&
        matchesCustodian &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesLocation &&
        matchesTags &&
        matchesCollectedBy &&
        matchesBlockchain
      );
    });
  } catch (error) {
    console.error("[useEvidenceManager] Filtering error:", error);
    return items;
  }
}

/**
 * Filter evidence items by case ID
 */
export function filterByCaseId(
  items: EvidenceItem[],
  caseId?: string
): EvidenceItem[] {
  if (!caseId) return items;
  return items.filter((e) => e.caseId === caseId);
}
