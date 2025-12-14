/**
 * @module hooks/useDiscoveryPlatform
 * @category Hooks - Discovery
 * @description Discovery platform state management hook with tab navigation, request tracking, deadline
 * syncing, and deep linking support. Manages activeTab with session storage persistence, contextId for
 * detail views, and parent tab derivation for hierarchical navigation. Provides handlers for tab changes,
 * navigation, back navigation, and response saving with cache invalidation.
 * 
 * NO THEME USAGE: Business logic hook for discovery platform state
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useMemo, useCallback, useEffect } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../services/dataService';
import { useQuery, useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';

// Hooks & Context
import { useSessionStorage } from './useSessionStorage';
import { useNotify } from './useNotify';

// Utils & Constants
import { getParentTabForView, getFirstTabOfParent } from '../components/discovery/layout/DiscoveryNavigation';

// Types
import { DiscoveryRequest } from '../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type DiscoveryView = 'dashboard' | 'requests' | 'privilege' | 'holds' | 'plan' | 'doc_viewer' | 'response' | 'production_wizard' | 'productions' | 'depositions' | 'esi' | 'interviews';

// ============================================================================
// HOOK
// ============================================================================
export const useDiscoveryPlatform = (initialTab?: DiscoveryView, caseId?: string) => {
  const notify = useNotify();
  
  // State Management
  const [activeTab, setActiveTab] = useSessionStorage<DiscoveryView>(
      caseId ? `discovery_active_tab_${caseId}` : 'discovery_active_tab', 
      initialTab || 'dashboard'
  );
  const [contextId, setContextId] = useState<string | null>(null);

  // Data Fetching
  const { data: requests = [] } = useQuery<DiscoveryRequest[]>(
      [STORES.REQUESTS, caseId || 'all'], 
      () => DataService.discovery.getRequests(caseId) 
  );

  const { mutate: syncDeadlines, isLoading: isSyncing } = useMutation(
      DataService.discovery.syncDeadlines,
      {
          onSuccess: () => notify.success("Synced discovery deadlines with court calendar.")
      }
  );

  // Deep Linking Effect
  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  // Derived State
  const activeParentTab = useMemo(() => 
    getParentTabForView(activeTab),
  [activeTab]);

  // Handlers
  const handleParentTabChange = useCallback((parentId: string) => {
    setActiveTab(getFirstTabOfParent(parentId));
  }, [setActiveTab]);
  
  const handleNavigate = useCallback((targetView: DiscoveryView, id?: string) => {
    if (id) setContextId(id);
    setActiveTab(targetView);
  }, [setActiveTab]);
  
  const handleBack = useCallback(() => {
    if (['doc_viewer', 'response', 'production_wizard'].includes(activeTab)) {
        const parent = getParentTabForView(activeTab);
        setActiveTab(parent.subTabs[0].id as DiscoveryView);
    } else {
        setActiveTab('dashboard');
    }
    setContextId(null);
  }, [activeTab, setActiveTab]);

  const handleSaveResponse = useCallback(async (reqId: string, text: string) => {
      await DataService.discovery.updateRequestStatus(reqId, 'Responded');
      queryClient.invalidate([STORES.REQUESTS, caseId || 'all']);
      notify.success(`Response saved for ${reqId}.`);
      setActiveTab('requests');
  }, [caseId, notify, setActiveTab]);

  return {
    activeTab,
    contextId,
    requests,
    isSyncing,
    activeParentTab,
    syncDeadlines,
    handleParentTabChange,
    handleNavigate,
    handleBack,
    handleSaveResponse,
    setActiveTab // Exposing this for direct tab changes from nav
  };
};
