/**
 * Evidence navigation sub-hook
 * @module hooks/useEvidenceManager/useEvidenceNavigation
 */

import { useCallback, useState } from "react";

import { DEFAULT_DETAIL_TAB, DEFAULT_VIEW_MODE } from "./constants";
import { validateEvidenceItem } from "./utils";

import type { DetailTab, ViewMode } from "./types";
import type { EvidenceItem } from "@/types";

/**
 * Hook for evidence navigation
 */
export function useEvidenceNavigation() {
  const [view, setView] = useState<ViewMode>(DEFAULT_VIEW_MODE);
  const [activeTab, setActiveTab] = useState<DetailTab>(DEFAULT_DETAIL_TAB);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);

  const handleItemClick = useCallback((item: EvidenceItem) => {
    const validation = validateEvidenceItem(item);
    if (!validation.valid) {
      console.error("[useEvidenceManager.handleItemClick] Invalid item:", item);
      return;
    }

    try {
      setSelectedItem(item);
      setView("detail");
      setActiveTab("overview");
      console.log(`[useEvidenceManager] Item selected: ${item.id}`);
    } catch (error) {
      console.error(
        "[useEvidenceManager.handleItemClick] Navigation error:",
        error
      );
    }
  }, []);

  const handleBack = useCallback(() => {
    setSelectedItem(null);
    setView("inventory");
    console.log("[useEvidenceManager] Returned to inventory view");
  }, []);

  return {
    view,
    setView,
    activeTab,
    setActiveTab,
    selectedItem,
    setSelectedItem,
    handleItemClick,
    handleBack,
  };
}
