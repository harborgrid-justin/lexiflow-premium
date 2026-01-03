/**
 * @module hooks/useCaseOverview
 * @category Hooks - Case Management
 *
 * Manages case overview operations including time tracking, case linking, and appeal transfers.
 * Provides modal states and handlers for case overview workflows.
 *
 * @example
 * ```typescript
 * const overview = useCaseOverview(caseData, handleTimeAdded, handleNavigate);
 *
 * // Open modals
 * <button onClick={() => overview.openTimeModal()}>Log Time</button>
 * <button onClick={() => overview.openLinkModal()}>Link Cases</button>
 * <button onClick={() => overview.openTransferModal()}>Transfer to Appeal</button>
 *
 * // Handle operations
 * <TimeModal
 *   isOpen={overview.showTimeModal}
 *   onClose={overview.closeTimeModal}
 *   onSave={overview.handleSaveTime}
 * />
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useEffect, useState } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from "@/services/data/dataService";

// Hooks & Context
import { useSync } from "./useSync";

// Types
import {
  Case,
  CaseId,
  CaseStatus,
  MatterType,
  TimeEntry,
  TimeEntryPayload,
  UserId,
  UUID,
} from "@/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useCaseOverview hook
 */
export interface UseCaseOverviewReturn {
  /** Time modal visibility */
  showTimeModal: boolean;
  /** Set time modal visibility */
  setShowTimeModal: (show: boolean) => void;
  /** Open time modal */
  openTimeModal: () => void;
  /** Close time modal */
  closeTimeModal: () => void;
  /** Link modal visibility */
  showLinkModal: boolean;
  /** Set link modal visibility */
  setShowLinkModal: (show: boolean) => void;
  /** Open link modal */
  openLinkModal: () => void;
  /** Close link modal */
  closeLinkModal: () => void;
  /** Transfer modal visibility */
  showTransferModal: boolean;
  /** Set transfer modal visibility */
  setShowTransferModal: (show: boolean) => void;
  /** Open transfer modal */
  openTransferModal: () => void;
  /** Close transfer modal */
  closeTransferModal: () => void;
  /** Linked cases */
  linkedCases: Case[];
  /** Available cases to link */
  availableCases: Case[];
  /** Save time entry */
  handleSaveTime: (entry: TimeEntryPayload) => void;
  /** Link case */
  handleLinkCase: (c: Case) => void;
  /** Transfer to appeal */
  handleTransferToAppeal: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages case overview operations and modal states.
 *
 * @param caseData - Case data object
 * @param onTimeEntryAdded - Callback when time entry is added
 * @param onNavigateToCase - Optional callback for case navigation
 * @returns Object with overview state and handlers
 */
export function useCaseOverview(
  caseData: Case,
  onTimeEntryAdded: (entry: TimeEntry) => void,
  onNavigateToCase?: (c: Case) => void
): UseCaseOverviewReturn {
  const { performMutation } = useSync();
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [linkedCases, setLinkedCases] = useState<Case[]>([]);
  const [availableCases, setAvailableCases] = useState<Case[]>([]);

  useEffect(() => {
    const loadRelated = async () => {
      const allCases = await DataService.cases.getAll();
      const linked = allCases.filter((c: Case) =>
        caseData.linkedCaseIds?.includes(c.id)
      );
      setLinkedCases(linked);
      const available = allCases.filter(
        (c: Case) =>
          c.id !== caseData.id && !caseData.linkedCaseIds?.includes(c.id)
      );
      setAvailableCases(available);
    };
    loadRelated();
  }, [caseData]);

  const handleSaveTime = (rawEntry: TimeEntryPayload) => {
    const newEntry: TimeEntry = {
      ...rawEntry,
      id: `t-${Date.now()}` as UUID,
      userId: "current-user" as UserId,
      billable: true,
      caseId: caseData.id,
    };

    performMutation("BILLING_LOG", newEntry, () =>
      DataService.billing.addTimeEntry(newEntry)
    );

    onTimeEntryAdded(newEntry);
  };

  const handleLinkCase = (c: Case) => {
    if (linkedCases.find((lc) => lc.id === c.id)) return;
    setLinkedCases([...linkedCases, c]);
    // Here you would also call a mutation to update the caseData in the DB
  };

  const handleTransferToAppeal = async () => {
    const appealCase: Case = {
      ...caseData,
      id: `APP-${Date.now()}` as CaseId,
      title: `Appeal: ${caseData.title}`,
      matterType: MatterType.LITIGATION,
      status: CaseStatus.Appeal,
      jurisdiction: "Appellate Court",
      court: "Circuit Court of Appeals",
      filingDate: new Date().toISOString().split("T")[0],
      linkedCaseIds: [caseData.id, ...(caseData.linkedCaseIds || [])],
    };

    try {
      await DataService.cases.add(appealCase);
      setLinkedCases([...linkedCases, appealCase]);
      setShowTransferModal(false);
      if (
        confirm(
          `Appeal case created: ${appealCase.title}. Switch to new matter?`
        )
      ) {
        if (onNavigateToCase) onNavigateToCase(appealCase);
      }
    } catch {
      alert("Failed to create appeal case.");
    }
  };

  return {
    showTimeModal,
    setShowTimeModal,
    openTimeModal: () => setShowTimeModal(true),
    closeTimeModal: () => setShowTimeModal(false),
    showLinkModal,
    setShowLinkModal,
    openLinkModal: () => setShowLinkModal(true),
    closeLinkModal: () => setShowLinkModal(false),
    showTransferModal,
    setShowTransferModal,
    openTransferModal: () => setShowTransferModal(true),
    closeTransferModal: () => setShowTransferModal(false),
    linkedCases,
    availableCases,
    handleSaveTime,
    handleLinkCase,
    handleTransferToAppeal,
  };
}
