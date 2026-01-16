/**
 * Evidence Manager Hook
 * Enterprise-grade React hook for evidence vault management with backend API integration
 *
 * @module hooks/useEvidenceManager
 * @category Hooks - Evidence Management
 * @description Manages comprehensive evidence vault operations including:
 * - Multi-view routing (dashboard, inventory, custody, intake, detail)
 * - Advanced filtering (search, type, admissibility, custodian, date range, blockchain)
 * - Chain of custody tracking and updates
 * - Evidence intake workflow with validation
 * - Real-time inventory management
 *
 * @example
 * ```typescript
 * const vault = useEvidenceManager('case-123');
 * const items = vault.filteredItems;
 * vault.handleCustodyUpdate(newEvent);
 * ```
 */

import { useEffect } from "react";
import type { UseEvidenceManagerReturn, ViewMode } from "./types";
import { useEvidenceData } from "./useEvidenceData";
import { useEvidenceFilters } from "./useEvidenceFilters";
import { useEvidenceMutations } from "./useEvidenceMutations";
import { useEvidenceNavigation } from "./useEvidenceNavigation";
import { useEvidenceOperations } from "./useEvidenceOperations";

export * from "./constants";
export * from "./types";

/**
 * Evidence manager hook
 * Refactored following the 10-step protocol
 */
export function useEvidenceManager(caseId?: string): UseEvidenceManagerReturn {
  // Data fetching
  const { allEvidenceItems, evidenceItems, isLoading } =
    useEvidenceData(caseId);

  // Mutations
  const { addEvidence, updateEvidence } = useEvidenceMutations();

  // Navigation
  const {
    view,
    setView,
    activeTab,
    setActiveTab,
    selectedItem,
    setSelectedItem,
    handleItemClick,
    handleBack,
  } = useEvidenceNavigation();

  // Filtering
  const { filters, setFilters, filteredItems, updateFilter, clearFilters } =
    useEvidenceFilters({
      evidenceItems,
      caseId,
    });

  // Operations
  const { handleIntakeComplete, handleCustodyUpdate } = useEvidenceOperations({
    caseId,
    selectedItem,
    setSelectedItem,
    addEvidence,
    updateEvidence,
    setView: (view: string) => setView(view as ViewMode),
  });

  // Initialization logging
  useEffect(() => {
    console.log(
      `[useEvidenceManager] Initialized ${
        caseId ? `with case scope: ${caseId}` : "in global mode"
      }`
    );
  }, [caseId]);

  return {
    view,
    setView,
    activeTab,
    setActiveTab,
    selectedItem,
    selectItem: setSelectedItem,
    allItems: allEvidenceItems,
    evidenceItems,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    filteredItems,
    handleItemClick,
    viewDetail: handleItemClick,
    handleBack,
    goBack: handleBack,
    handleIntakeComplete,
    handleCustodyUpdate,
    isLoading,
  };
}
