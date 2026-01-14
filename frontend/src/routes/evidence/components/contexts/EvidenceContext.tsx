/**
 * @module features/litigation/evidence/contexts/EvidenceContext
 * @description Context definitions for Evidence feature.
 * Implements React v18 Concurrency Guidelines.
 *
 * Guidelines Applied:
 * - Guideline 22: Immutable context values
 * - Guideline 25: startTransition for non-urgent updates
 * - Guideline 33: Explicit transitional states (isPending)
 * - Guideline 38: Concurrent-safe defaults
 */

import { DetailTab, useEvidenceManager, ViewMode } from '@/hooks/useEvidenceManager';
import { EvidenceItem } from '@/types/evidence'; // Assumed type
import React, { createContext, useContext, useMemo, useTransition } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EvidenceState {
    readonly view: ViewMode;
    readonly activeTab: DetailTab;
    readonly selectedItem: EvidenceItem | null;
    readonly evidenceItems: readonly EvidenceItem[];
    readonly filters: Readonly<Record<string, unknown>>;
    readonly filteredItems: readonly EvidenceItem[];
    readonly isLoading: boolean;
    readonly isPending: boolean; // For concurrent transitions
}

export interface EvidenceActions {
    setView: (view: ViewMode) => void;
    setActiveTab: (tab: DetailTab) => void;
    setFilters: (filters: Record<string, unknown>) => void;
    handleItemClick: (item: EvidenceItem) => void;
    handleBack: () => void;
    handleIntakeComplete: () => void;
    handleCustodyUpdate: () => void;
}

// ============================================================================
// CONTEXTS
// ============================================================================

// Guideline 38: ENSURE CONTEXT DEFAULTS ARE CONCURRENT-SAFE
const DEFAULT_STATE: EvidenceState = Object.freeze({
    view: 'list' as ViewMode,
    activeTab: 'details' as DetailTab,
    selectedItem: null,
    evidenceItems: Object.freeze([]),
    filters: Object.freeze({}),
    filteredItems: Object.freeze([]),
    isLoading: false,
    isPending: false,
});

const DEFAULT_ACTIONS: EvidenceActions = Object.freeze({
    setView: () => { throw new Error('EvidenceProvider not mounted'); },
    setActiveTab: () => { throw new Error('EvidenceProvider not mounted'); },
    setFilters: () => { throw new Error('EvidenceProvider not mounted'); },
    handleItemClick: () => { throw new Error('EvidenceProvider not mounted'); },
    handleBack: () => { throw new Error('EvidenceProvider not mounted'); },
    handleIntakeComplete: () => { throw new Error('EvidenceProvider not mounted'); },
    handleCustodyUpdate: () => { throw new Error('EvidenceProvider not mounted'); },
});

const EvidenceStateContext = createContext<EvidenceState>(DEFAULT_STATE);
const EvidenceActionsContext = createContext<EvidenceActions>(DEFAULT_ACTIONS);

// ============================================================================
// HOOKS
// ============================================================================

// Guideline 34: ASSUME CONTEXT READS MAY BE REPEATED OR DISCARDED
export const useEvidenceState = () => {
    const context = useContext(EvidenceStateContext);
    if (context === DEFAULT_STATE) {
        throw new Error('useEvidenceState must be used within a EvidenceProvider');
    }
    return context;
};

export const useEvidenceActions = () => {
    const context = useContext(EvidenceActionsContext);
    if (context === DEFAULT_ACTIONS) {
        throw new Error('useEvidenceActions must be used within a EvidenceProvider');
    }
    return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface EvidenceProviderProps {
    children: React.ReactNode;
    caseId?: string;
    initialTab?: ViewMode;
}

export const EvidenceProvider: React.FC<EvidenceProviderProps> = ({
    children,
    caseId,
    initialTab: _initialTab
}) => {
    const [isPending, startTransition] = useTransition();

    // Use the existing hook as the logic engine
    // We wrap its state setters in startTransition where appropriate
    const manager = useEvidenceManager(caseId);

    // Concurrent-safe view setter
    const setView = (view: ViewMode) => {
        startTransition(() => {
            manager.setView(view);
        });
    };

    // Guideline 22: DESIGN CONTEXT VALUES TO BE CONCURRENT-SAFE
    // Construct State Values - immutable, frozen in development
    const stateValue = useMemo(() => {
        const value = {
            view: manager.view,
            activeTab: manager.activeTab,
            selectedItem: manager.selectedItem,
            evidenceItems: manager.evidenceItems,
            filters: manager.filters,
            filteredItems: manager.filteredItems,
            isLoading: manager.isLoading,
            isPending
        };
        return process.env.NODE_ENV === 'development' ? Object.freeze(value) : value;
    }, [
        manager.view,
        manager.activeTab,
        manager.selectedItem,
        manager.evidenceItems,
        manager.filters,
        manager.filteredItems,
        manager.isLoading,
        isPending
    ]);

    // Construct Action Values (Non-Urgent/Stable)
    const actionsValue = useMemo(() => ({
        setView,
        setActiveTab: manager.setActiveTab,
        setFilters: manager.setFilters,
        handleItemClick: manager.handleItemClick,
        handleBack: manager.handleBack,
        handleIntakeComplete: manager.handleIntakeComplete,
        handleCustodyUpdate: manager.handleCustodyUpdate
    }), [
        manager.setActiveTab,
        manager.setFilters,
        manager.handleItemClick,
        manager.handleBack,
        manager.handleIntakeComplete,
        manager.handleCustodyUpdate,
        setView
    ]);

    return (
        <EvidenceActionsContext.Provider value={actionsValue}>
            <EvidenceStateContext.Provider value={stateValue}>
                {children}
            </EvidenceStateContext.Provider>
        </EvidenceActionsContext.Provider>
    );
};
