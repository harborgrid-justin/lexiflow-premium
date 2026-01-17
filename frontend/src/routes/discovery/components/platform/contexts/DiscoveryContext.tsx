/**
 * @module features/litigation/discovery/contexts/DiscoveryContext
 * @description Context definitions for Discovery feature.
 * Implements React v18 Concurrency Guidelines.
 *
 * Guidelines Applied:
 * - Guideline 22: Immutable context values
 * - Guideline 25: startTransition for non-urgent updates
 * - Guideline 33: Explicit transitional states (isPending)
 * - Guideline 38: Concurrent-safe defaults
 */

import React, { createContext, useContext, useMemo, useState, useTransition } from 'react';

import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { QUERY_KEYS } from '@/services/data/queryKeys';
import { type DiscoveryRequest } from '@/types/discovery';
import { type DiscoveryView } from '@/utils/discoveryNavigation';
import { queryKeys } from '@/utils/queryKeys';

import { getFirstTabOfParent, getParentTabForView } from '../layout/DiscoveryNavigation';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DiscoveryState {
    readonly activeTab: DiscoveryView;
    readonly activeParentTabId: string;
    readonly caseId?: string;
    readonly requests: readonly DiscoveryRequest[];
    readonly isPending: boolean; // For transition UI
    readonly isLoadingRequests: boolean;
    readonly isSyncing: boolean;
    readonly contextId: string | null;
    readonly viewMode: string;
}

export interface DiscoveryActions {
    setActiveTab: (tab: DiscoveryView) => void;
    handleParentTabChange: (parentId: string) => void;
    syncDeadlines: () => Promise<void>; // Returns void promise
    setContextId: (id: string | null) => void;
    setViewMode: (mode: string) => void;
}

// ============================================================================
// CONTEXTS
// ============================================================================

// Guideline 38: ENSURE CONTEXT DEFAULTS ARE CONCURRENT-SAFE
const DEFAULT_STATE: DiscoveryState = Object.freeze({
    activeTab: 'dashboard' as DiscoveryView,
    activeParentTabId: 'home',
    requests: Object.freeze([]),
    isPending: false,
    isLoadingRequests: false,
    isSyncing: false,
    contextId: null,
    viewMode: 'list'
});

const DEFAULT_ACTIONS: DiscoveryActions = Object.freeze({
    setActiveTab: () => { throw new Error('DiscoveryProvider not mounted'); },
    handleParentTabChange: () => { throw new Error('DiscoveryProvider not mounted'); },
    syncDeadlines: () => { throw new Error('DiscoveryProvider not mounted'); },
    setContextId: () => { throw new Error('DiscoveryProvider not mounted'); },
    setViewMode: () => { throw new Error('DiscoveryProvider not mounted'); },
});

const DiscoveryStateContext = createContext<DiscoveryState>(DEFAULT_STATE);
const DiscoveryActionsContext = createContext<DiscoveryActions>(DEFAULT_ACTIONS);

// ============================================================================
// HOOKS
// ============================================================================

// Guideline 34: ASSUME CONTEXT READS MAY BE REPEATED OR DISCARDED
export const useDiscoveryState = () => {
    const context = useContext(DiscoveryStateContext);
    if (context === DEFAULT_STATE) {
        throw new Error('useDiscoveryState must be used within a DiscoveryProvider');
    }
    return context;
};

export const useDiscoveryActions = () => {
    const context = useContext(DiscoveryActionsContext);
    if (context === DEFAULT_ACTIONS) {
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
    // Guideline 28: Stable function references
    const setActiveTab = React.useCallback((tab: DiscoveryView) => {
        startTransition(() => {
            setUiActiveTab(tab);
        });
    }, []);

    const activeParentTabId = useMemo(() => getParentTabForView(activeTab), [activeTab]);

    // Guideline 28: Stable function references
    const handleParentTabChange = React.useCallback((parentId: string) => {
        const firstTab = getFirstTabOfParent(parentId);
        setActiveTab(firstTab);
    }, [setActiveTab]);

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
    const { mutate: syncDeadlinesMutation, isLoading: isSyncing } = useMutation(
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

    // Wrap mutation to match expected signature
    const syncDeadlines = React.useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            try {
                syncDeadlinesMutation(undefined as never); // Mutation requires a parameter
                resolve();
            } catch (error: unknown) {
                reject(error);
            }
        });
    }, [syncDeadlinesMutation]);

    // Placeholder for other state (lifting from DiscoveryPlatform)
    // In a full refactor, useSessionStorage would be here or in a separate hook
    const [contextId, setContextId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<string>('list');

    // Guideline 22: DESIGN CONTEXT VALUES TO BE CONCURRENT-SAFE
    // Immutable state, frozen in development
    const stateValue = useMemo(() => {
        const value = {
            activeTab,
            activeParentTabId: activeParentTabId.id, // Extract string ID
            caseId,
            requests,
            isPending,
            isLoadingRequests,
            isSyncing,
            contextId,
            viewMode
        };
        return process.env.NODE_ENV === 'development' ? Object.freeze(value) : value;
    }, [activeTab, activeParentTabId, caseId, requests, isPending, isLoadingRequests, isSyncing, contextId, viewMode]);

    // Guideline 28: Stable action references
    const actionsValue = useMemo(() => ({
        setActiveTab,
        handleParentTabChange,
        syncDeadlines,
        setContextId,
        setViewMode
    }), [setActiveTab, handleParentTabChange, syncDeadlines, setContextId, setViewMode]);

    return (
        <DiscoveryActionsContext.Provider value={actionsValue}>
            <DiscoveryStateContext.Provider value={stateValue}>
                {children}
            </DiscoveryStateContext.Provider>
        </DiscoveryActionsContext.Provider>
    );
};
