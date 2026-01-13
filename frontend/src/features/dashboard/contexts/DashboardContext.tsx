/**
 * @module features/dashboard/contexts/DashboardContext
 * @description Context definitions for Dashboard feature.
 * Implements React v18 Concurrency Guidelines.
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { User } from '@/types';

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

// Rule 38: ENSURE CONTEXT DEFAULTS ARE CONCURRENT-SAFE
// We provide safe immutable defaults to avoid null checks or tearing
const defaultState: DashboardState = {
  activeTab: 'overview',
  currentUser: { id: '', name: 'Guest', email: '', role: 'Associate' } as User,
  isPending: false,
};

const defaultActions: DashboardActions = {
  setActiveTab: () => {},
  onSelectCase: () => {},
};

// Rule 26: SEPARATE URGENT AND NON-URGENT CONTEXT PATHS
// We split State (data) and Actions (functions) to optimize re-renders
const DashboardStateContext = createContext<DashboardState>(defaultState);
const DashboardActionsContext = createContext<DashboardActions>(defaultActions);

// ============================================================================
// HOOKS
// ============================================================================

export const useDashboardState = () => {
  const context = useContext(DashboardStateContext);
  if (!context) {
    throw new Error('useDashboardState must be used within a DashboardProvider');
  }
  return context;
};

export const useDashboardActions = () => {
  const context = useContext(DashboardActionsContext);
  if (!context) {
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
  // Rule 22: DESIGN CONTEXT VALUES TO BE CONCURRENT-SAFE
  // Use useMemo to ensure referential equality unless data changes
  const stateValue = useMemo(() => ({
    activeTab,
    currentUser,
    isPending
  }), [activeTab, currentUser, isPending]);

  // Actions are stable and shouldn't trigger re-renders of state consumers
  const actionsValue = useMemo(() => ({
    setActiveTab: onTabChange,
    onSelectCase
  }), [onTabChange, onSelectCase]);

  // Rule 36: ISOLATE CONTEXT PROVIDERS
  return (
    <DashboardActionsContext.Provider value={actionsValue}>
      <DashboardStateContext.Provider value={stateValue}>
        {children}
      </DashboardStateContext.Provider>
    </DashboardActionsContext.Provider>
  );
};
