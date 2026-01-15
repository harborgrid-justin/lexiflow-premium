/**
 * Evidence operations sub-hook (custody, intake)
 * @module hooks/useEvidenceManager/useEvidenceOperations
 */

import type { CaseId, ChainOfCustodyEvent, EvidenceItem } from "@/types";
import { useCallback } from "react";
import { validateEvidenceItem } from "./utils";

interface UseEvidenceOperationsParams {
  caseId?: string;
  selectedItem: EvidenceItem | null;
  setSelectedItem: (item: EvidenceItem | null) => void;
  addEvidence: (item: EvidenceItem) => void;
  updateEvidence: (item: EvidenceItem) => void;
  setView: (view: string) => void;
}

/**
 * Hook for evidence operations
 */
export function useEvidenceOperations({
  caseId,
  selectedItem,
  setSelectedItem,
  addEvidence,
  updateEvidence,
  setView,
}: UseEvidenceOperationsParams) {
  const handleIntakeComplete = useCallback(
    (newItem: EvidenceItem) => {
      const validation = validateEvidenceItem(newItem);
      if (!validation.valid) {
        console.error(
          "[useEvidenceManager.handleIntakeComplete] Invalid evidence item:",
          newItem
        );
        alert(
          `Error: ${validation.error || "Invalid evidence item"}. Please check all required fields.`
        );
        return;
      }

      try {
        if (caseId && newItem.caseId !== caseId) {
          console.log(`[useEvidenceManager] Applying case scope: ${caseId}`);
          newItem.caseId = caseId as CaseId;
        }

        addEvidence(newItem);
        setView("inventory");

        console.log(
          `[useEvidenceManager] Evidence intake completed: ${newItem.id}`
        );
        alert("Item logged successfully.");
      } catch (error) {
        console.error(
          "[useEvidenceManager.handleIntakeComplete] Error:",
          error
        );
        alert("Error: Failed to save evidence item. Please try again.");
      }
    },
    [caseId, addEvidence, setView]
  );

  const handleCustodyUpdate = useCallback(
    (newEvent: ChainOfCustodyEvent) => {
      if (!selectedItem) {
        console.error(
          "[useEvidenceManager.handleCustodyUpdate] No item selected"
        );
        return;
      }

      if (!newEvent || !newEvent.actor || !newEvent.date) {
        console.error(
          "[useEvidenceManager.handleCustodyUpdate] Invalid custody event:",
          newEvent
        );
        alert(
          "Error: Invalid custody event. Please check all required fields."
        );
        return;
      }

      try {
        const updatedItem: EvidenceItem = {
          ...selectedItem,
          chainOfCustody: [newEvent, ...selectedItem.chainOfCustody],
          custodian: newEvent.actor,
        };

        setSelectedItem(updatedItem);
        updateEvidence(updatedItem);

        console.log(
          `[useEvidenceManager] Custody updated for: ${selectedItem.id}`
        );
      } catch (error) {
        console.error("[useEvidenceManager.handleCustodyUpdate] Error:", error);
        alert("Error: Failed to update custody. Please try again.");
      }
    },
    [selectedItem, setSelectedItem, updateEvidence]
  );

  return {
    handleIntakeComplete,
    handleCustodyUpdate,
  };
}
