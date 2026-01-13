/**
 * @module features/litigation/discovery/contexts/DiscoveryContext
 * @description Context definitions for Discovery feature.
 * Implements React v18 Concurrency Guidelines.
 */

import React, { createContext, useContext, useMemo, useState, useTransition } from 'react';
import { DiscoveryView } from '@/utils/discoveryNavigation';
import { DiscoveryRequest } from '@/types/discovery';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { QUERY_KEYS } from '@/services/data/queryKeys';
import { getParentTabForView, getFirstTabOfParent } from '../layout/DiscoveryNavigation';
import { useNotify } from '@/hooks/useNotify';
import { queryKeys } from '@/utils/queryKeys';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DiscoveryState {
    activeTab: DiscoveryView;
    activeParentTabId: string;
    caseId?: string;
    requests: DiscoveryRequest[];
    isPending: boolean; // For transition UI
    isLoadingRequests: boolean;
    isSyncing: boolean;
    contextId: string | null;
    viewMode: string;
}

export interface DiscoveryActions {
    setActiveTab: (tab: DiscoveryView) => void;
    handleParentTabChange: (parentId: string) => void;
    syncDeadlines: () => void;
    setContextId: (id: string | null) => void;
    setViewMode: (mode: string) => void;
}

// ============================================================================
// CONTEXTS
// ============================================================================

const defaultState: DiscoveryState = {
    activeTab: 'dashboard',
    activeParentTabId: 'home',
    requests: [],
    isPending: false,
    isLoadingRequests: false,
    isSyncing: false,
    contextId: null,
    viewMode: 'list'
};

const DiscoveryStateContext = createContext<DiscoveryState>(defaultState);
const DiscoveryActionsContext = createContext<DiscoveryActions>({} as DiscoveryActions);

// ============================================================================
// HOOKS
// ============================================================================

export const useDiscoveryState = () => {
    const context = useContext(DiscoveryStateContext);
    if (!context) {
        throw new Error('useDiscoveryState must be used within a DiscoveryProvider');
    }
    return context;
};

export const useDiscoveryActions = () => {
    const context = useContext(DiscoveryActionsContext);
    if (!context) {
        throw new Error('useDiscoveryActions must be used within a DiscoveryProvider');
    }
    return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface DiscoveryProviderProps {
    children: React.ReactNode;
    caseId?: string;
    initialTab?: DiscoveryView;
}

export const DiscoveryProvider: React.FC<DiscoveryProviderProps> = ({ 
    children, 
    caseId, 
    initialTab = 'dashboard' 
}) => {
    const [activeTab, setUiActiveTab] = useState<DiscoveryView>(initialTab);
    const [isPending, startTransition] = useTransition();
    const notify = useNotify();

    // Active View/Tab State (Concurrent Safe)
    const setActiveTab = (tab: DiscoveryView) => {
        startTransition(() => {
            setUiActiveTab(tab);
        });
    };

    const activeParentTabId = useMemo(() => getParentTabForView(activeTab), [activeTab]);

    const handleParentTabChange = (parentId: string) => {
        const firstTab = getFirstTabOfParent(parentId);
        setActiveTab(firstTab);
    };

    // Data Fetching
    const { data: rawRequests = [], isLoading: isLoadingRequests } = useQuery<DiscoveryRequest[]>(
        caseId ? QUERY_KEYS.REQUESTS.BY_CASE(caseId) : QUERY_KEYS.REQUESTS.ALL,
        async () => {
            // Using DataService directly
            // Note: In real app, verify types match exactly
            const result = await DataService.discovery.getRequests(caseId);
            return Array.isArray(result) ? result : [];
        }
    );

    const requests = useMemo(() => Array.isArray(rawRequests) ? rawRequests : [], [rawRequests]);

    // Data Mutation
    const { mutate: syncDeadlines, isLoading: isSyncing } = useMutation(
        async () => {
            return DataService.discovery.syncDeadlines();
        },
        {
            onSuccess: () => {
                notify.success("Synced discovery deadlines with court calendar.");
                queryClient.invalidate(queryKeys.discovery.all());
                queryClient.invalidate(queryKeys.calendar.events());
            },
            onError: (error: unknown) => {
                notify.error('Failed to sync deadlines. Please try again later.');
                console.error('Sync error:', error);
            }
        }
    );

    // Placeholder for other state (lifting from DiscoveryPlatform)
    // In a full refactor, useSessionStorage would be here or in a separate hook
    const [contextId, setContextId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<string>('list');

    // Rule 22: Concurrent Safe State
    const stateValue = useMemo(() => ({
        activeTab,
        activeParentTabId,
        caseId,
        requests,
        isPending,
        isLoadingRequests,
        isSyncing,
        contextId,
        viewMode
    }), [activeTab, activeParentTabId, caseId, requests, isPending, isLoadingRequests, isSyncing, contextId, viewMode]);

    const actionsValue = useMemo(() => ({
        setActiveTab,
        handleParentTabChange,
        syncDeadlines,
        setContextId,
        setViewMode
    }), [handleParentTabChange, syncDeadlines]);

    return (
        <DiscoveryActionsContext.Provider value={actionsValue}>
            <DiscoveryStateContext.Provider value={stateValue}>
                {children}
            </DiscoveryStateContext.Provider>
        </DiscoveryActionsContext.Provider>
    );
};
