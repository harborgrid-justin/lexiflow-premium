/**
 * @module features/dashboard/contexts/DashboardContext
 * @description Context definitions for Dashboard feature.
 * Implements React v18 Concurrency Guidelines.
 */

import type { User } from '@/types';
import React, { createContext, useContext, useMemo } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DashboardState {
  activeTab: string;
  currentUser: User;
  isPending: boolean; // Tracking transition state
}

export interface DashboardActions {
  setActiveTab: (tab: string) => void;
  onSelectCase: (caseId: string) => void;
}

// ============================================================================
// CONTEXTS
// ============================================================================

// Guideline 38: ENSURE CONTEXT DEFAULTS ARE CONCURRENT-SAFE
// We provide safe immutable defaults with explicit errors to avoid null checks or tearing
const DEFAULT_STATE: DashboardState = Object.freeze({
  activeTab: 'overview',
  currentUser: Object.freeze({ id: '', name: 'Guest', email: '', role: 'Associate' } as User),
  isPending: false,
});

const DEFAULT_ACTIONS: DashboardActions = Object.freeze({
  setActiveTab: () => { throw new Error('DashboardProvider not mounted'); },
  onSelectCase: () => { throw new Error('DashboardProvider not mounted'); },
});

// Guideline 26: SEPARATE URGENT AND NON-URGENT CONTEXT PATHS
// We split State (data) and Actions (functions) to optimize re-renders
const DashboardStateContext = createContext<DashboardState>(DEFAULT_STATE);
const DashboardActionsContext = createContext<DashboardActions>(DEFAULT_ACTIONS);

// ============================================================================
// HOOKS
// ============================================================================

// Guideline 34: ASSUME CONTEXT READS MAY BE REPEATED OR DISCARDED
export const useDashboardState = () => {
  const context = useContext(DashboardStateContext);
  if (context === DEFAULT_STATE) {
    throw new Error('useDashboardState must be used within a DashboardProvider');
  }
  return context;
};

export const useDashboardActions = () => {
  const context = useContext(DashboardActionsContext);
  if (context === DEFAULT_ACTIONS) {
    throw new Error('useDashboardActions must be used within a DashboardProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface DashboardProviderProps {
  children: React.ReactNode;
  activeTab: string;
  currentUser: User;
  isPending: boolean;
  onSelectCase: (caseId: string) => void;
  onTabChange: (tab: string) => void;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
  activeTab,
  currentUser,
  isPending,
  onSelectCase,
  onTabChange,
}) => {
  // Guideline 22: DESIGN CONTEXT VALUES TO BE CONCURRENT-SAFE
  // Use useMemo to ensure referential equality unless data changes
  // Freeze in development to catch mutations
  const stateValue = useMemo(() => {
    const value = {
      activeTab,
      currentUser,
      isPending
    };
    return process.env.NODE_ENV === 'development' ? Object.freeze(value) : value;
  }, [activeTab, currentUser, isPending]);

  // Guideline 28: Actions are stable and shouldn't trigger re-renders of state consumers
  const actionsValue = useMemo(() => ({
    setActiveTab: onTabChange,
    onSelectCase
  }), [onTabChange, onSelectCase]);

  // Guideline 36: ISOLATE CONTEXT PROVIDERS
  return (
    <DashboardActionsContext.Provider value={actionsValue}>
      <DashboardStateContext.Provider value={stateValue}>
        {children}
      </DashboardStateContext.Provider>
    </DashboardActionsContext.Provider>
  );
};
