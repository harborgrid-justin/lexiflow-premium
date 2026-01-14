/**
 * @module hooks/useDiscoveryPlatform
 * @category Hooks - Discovery
 *
 * Discovery platform state management with tab navigation and request tracking.
 * Manages session-persisted tabs and deep linking support.
 *
 * @example
 * ```typescript
 * const discovery = useDiscoveryPlatform('dashboard', caseId);
 *
 * // Tab navigation
 * <ParentTabs onChange={discovery.handleParentTabChange} />
 * <SubTabs active={discovery.activeTab} />
 *
 * // Navigate to detail
 * discovery.handleNavigate('requestDetail', requestId);
 *
 * // Save response
 * await discovery.handleSaveResponse(reqId, responseText);
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useCallback, useEffect, useMemo, useState } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from "@/services/data/data-service.service";
import { queryKeys } from "@/utils/query-keys.service";
import { queryClient, useMutation, useQuery } from "./useQueryHooks";

// Hooks & Context
import { useNotify } from "./useNotify";
import { useSessionStorage } from "./useSessionStorage";

// Utils & Constants
import {
  getFirstTabOfParent,
  getParentTabForView,
  isDetailView,
} from "@/utils/discoveryNavigation";

// Types
import { DiscoveryRequest } from "@/types";
import type { DiscoveryView } from "@/utils/discoveryNavigation";

// ============================================================================
// RE-EXPORTS (for backwards compatibility)
// ============================================================================
export type { DiscoveryView } from "@/utils/discoveryNavigation";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useDiscoveryPlatform hook
 */
export interface UseDiscoveryPlatformReturn {
  /** Active tab/view */
  activeTab: DiscoveryView;
  /** Set active tab */
  setActiveTab: (tab: DiscoveryView) => void;
  /** Context ID for detail views */
  contextId: string | null;
  /** All discovery requests */
  requests: DiscoveryRequest[];
  /** Active parent tab */
  activeParentTab: unknown;
  /** Handle parent tab change */
  handleParentTabChange: (parentId: string) => void;
  /** Navigate to view */
  handleNavigate: (targetView: DiscoveryView, id?: string) => void;
  /** Go back to list view */
  handleBack: () => void;
  /** Save response */
  handleSaveResponse: (reqId: string, text: string) => Promise<void>;
  /** Sync deadlines mutation */
  syncDeadlines: () => void;
  /** Whether syncing is in progress */
  isSyncing: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Discovery platform state management.
 *
 * @param initialTab - Initial tab to display
 * @param caseId - Optional case ID for scoping
 * @returns Object with discovery platform state and handlers
 */
export function useDiscoveryPlatform(
  initialTab?: DiscoveryView,
  caseId?: string
): UseDiscoveryPlatformReturn {
  const notify = useNotify();

  // State Management
  const [activeTab, setActiveTab] = useSessionStorage<DiscoveryView>(
    caseId ? `discovery_active_tab_${caseId}` : "discovery_active_tab",
    initialTab || "dashboard"
  );
  const [contextId, setContextId] = useState<string | null>(null);

  // Data Fetching
  const { data: requests = [] } = useQuery<DiscoveryRequest[]>(
    queryKeys.discovery.byCaseId(caseId || "all"),
    () => DataService.discovery.getRequests(caseId)
  );

  const { mutate: syncDeadlines, isLoading: isSyncing } = useMutation(
    DataService.discovery.syncDeadlines,
    {
      onSuccess: () =>
        notify.success("Synced discovery deadlines with court calendar."),
    }
  );

  // Deep Linking Effect
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  // Derived State
  const activeParentTab = useMemo(
    () => getParentTabForView(activeTab),
    [activeTab]
  );

  // Handlers
  const handleParentTabChange = useCallback(
    (parentId: string) => {
      setActiveTab(getFirstTabOfParent(parentId));
    },
    [setActiveTab]
  );

  const handleNavigate = useCallback(
    (targetView: DiscoveryView, id?: string) => {
      if (id) setContextId(id);
      setActiveTab(targetView);
    },
    [setActiveTab]
  );

  const handleBack = useCallback(() => {
    if (isDetailView(activeTab)) {
      const parent = getParentTabForView(activeTab);
      setActiveTab(parent.subTabs[0].id as DiscoveryView);
    } else {
      setActiveTab("dashboard");
    }
    setContextId(null);
  }, [activeTab, setActiveTab]);

  const handleSaveResponse = useCallback(
    async (reqId: string, _text: string) => {
      await DataService.discovery.updateRequestStatus(reqId, "Responded");
      queryClient.invalidate(queryKeys.discovery.byCaseId(caseId || "all"));
      notify.success(`Response saved for ${reqId}.`);
      setActiveTab("requests");
    },
    [caseId, notify, setActiveTab]
  );

  return {
    activeTab,
    contextId,
    requests,
    isSyncing,
    activeParentTab,
    syncDeadlines: () => syncDeadlines(undefined),
    handleParentTabChange,
    handleNavigate,
    handleBack,
    handleSaveResponse,
    setActiveTab, // Exposing this for direct tab changes from nav
  };
}
