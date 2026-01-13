/**
 * @module features/litigation/evidence/contexts/EvidenceContext
 * @description Context definitions for Evidence feature.
 * Implements React v18 Concurrency Guidelines.
 */

import React, { createContext, useContext, useMemo, useState, useTransition } from 'react';
import { ViewMode, DetailTab, useEvidenceManager } from '@/hooks/useEvidenceManager';
import { EvidenceItem } from '@/types/evidence'; // Assumed type

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EvidenceState {
    view: ViewMode;
    activeTab: DetailTab;
    selectedItem: EvidenceItem | null;
    evidenceItems: EvidenceItem[];
    filters: Record<string, any>;
    filteredItems: EvidenceItem[];
    isLoading: boolean;
    isPending: boolean; // For concurrent transitions
}

export interface EvidenceActions {
    setView: (view: ViewMode) => void;
    setActiveTab: (tab: DetailTab) => void;
    setFilters: (filters: Record<string, any>) => void;
    handleItemClick: (item: EvidenceItem) => void;
    handleBack: () => void;
    handleIntakeComplete: () => void;
    handleCustodyUpdate: () => void;
}

// ============================================================================
// CONTEXTS
// ============================================================================

const EvidenceStateContext = createContext<EvidenceState>({} as EvidenceState);
const EvidenceActionsContext = createContext<EvidenceActions>({} as EvidenceActions);

// ============================================================================
// HOOKS
// ============================================================================

export const useEvidenceState = () => {
    const context = useContext(EvidenceStateContext);
    if (!context) {
        throw new Error('useEvidenceState must be used within a EvidenceProvider');
    }
    return context;
};

export const useEvidenceActions = () => {
    const context = useContext(EvidenceActionsContext);
    if (!context) {
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
    initialTab
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

    // Construct State Values (Urgent/Render Critical)
    const stateValue = useMemo(() => ({
        view: manager.view,
        activeTab: manager.activeTab,
        selectedItem: manager.selectedItem,
        evidenceItems: manager.evidenceItems,
        filters: manager.filters,
        filteredItems: manager.filteredItems,
        isLoading: manager.isLoading,
        isPending
    }), [
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
        manager.handleCustodyUpdate
    ]);

    return (
        <EvidenceActionsContext.Provider value={actionsValue}>
            <EvidenceStateContext.Provider value={stateValue}>
                {children}
            </EvidenceStateContext.Provider>
        </EvidenceActionsContext.Provider>
    );
};
