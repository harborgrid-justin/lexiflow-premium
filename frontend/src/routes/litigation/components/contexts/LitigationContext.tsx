/**
 * @module features/litigation/contexts/LitigationContext
 * @description Context definitions for Litigation feature.
 * Implements React v18 Concurrency Guidelines.
 *
 * Guidelines Applied:
 * - Guideline 22: Immutable context values
 * - Guideline 25: startTransition for non-urgent updates
 * - Guideline 33: Explicit transitional states (isPending)
 * - Guideline 38: Concurrent-safe defaults
 */

import React, { createContext, useContext, useMemo, useState, useTransition } from 'react';

import { type UseLitigationBuilderReturn, useLitigationBuilder } from '@/hooks/useLitigationBuilder';
import { type Case } from '@/types/models';
import { type WorkflowConnection, type WorkflowNode } from '@/types/workflow-types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Guideline 26: SEPARATE URGENT AND NON-URGENT CONTEXT PATHS

export interface LitigationState {
  // UI State
  readonly activeTab: string;
  readonly isPending: boolean; // Tracking transition state

  // Builder State
  readonly nodes: readonly WorkflowNode[];
  readonly connections: readonly WorkflowConnection[];
  readonly selectedCaseId: string | null;
  readonly cases: readonly Case[];
  readonly validationErrors: readonly string[];
  readonly isDeploying: boolean;
}

export type LitigationActions = Omit<UseLitigationBuilderReturn,
  'nodes' | 'connections' | 'selectedCaseId' | 'cases' | 'validationErrors' | 'isDeploying'> & {
    setActiveTab: (tab: string) => void;
  };

// ============================================================================
// CONTEXTS
// ============================================================================

// Guideline 38: ENSURE CONTEXT DEFAULTS ARE CONCURRENT-SAFE
const DEFAULT_STATE: LitigationState = Object.freeze({
  activeTab: 'canvas',
  isPending: false,
  nodes: Object.freeze([]),
  connections: Object.freeze([]),
  selectedCaseId: null,
  cases: Object.freeze([]),
  validationErrors: Object.freeze([]),
  isDeploying: false,
});

const DEFAULT_ACTIONS: LitigationActions = Object.freeze({
  setActiveTab: () => { throw new Error('LitigationProvider not mounted'); },
  addNode: () => { throw new Error('LitigationProvider not mounted'); },
  updateNode: () => { throw new Error('LitigationProvider not mounted'); },
  removeNode: () => { throw new Error('LitigationProvider not mounted'); },
  addConnection: () => { throw new Error('LitigationProvider not mounted'); },
  removeConnection: () => { throw new Error('LitigationProvider not mounted'); },
  selectCase: () => { throw new Error('LitigationProvider not mounted'); },
  loadWorkflowFromCase: () => { throw new Error('LitigationProvider not mounted'); },
  validateWorkflow: () => { throw new Error('LitigationProvider not mounted'); },
  deployWorkflow: () => { throw new Error('LitigationProvider not mounted'); },
  clearCanvas: () => { throw new Error('LitigationProvider not mounted'); },
} as LitigationActions);

const LitigationStateContext = createContext<LitigationState>(DEFAULT_STATE);
const LitigationActionsContext = createContext<LitigationActions>(DEFAULT_ACTIONS);

// ============================================================================
// HOOKS
// ============================================================================

// Guideline 34: ASSUME CONTEXT READS MAY BE REPEATED OR DISCARDED
export const useLitigationState = () => {
  const context = useContext(LitigationStateContext);
  if (context === DEFAULT_STATE) {
    throw new Error('useLitigationState must be used within a LitigationProvider');
  }
  return context;
};

export const useLitigationActions = () => {
  const context = useContext(LitigationActionsContext);
  if (context === DEFAULT_ACTIONS) {
    throw new Error('useLitigationActions must be used within a LitigationProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface LitigationProviderProps {
  children: React.ReactNode;
  navigateToCaseTab: (caseId: string, tab: string) => void;
}

export const LitigationProvider: React.FC<LitigationProviderProps> = ({
  children,
  navigateToCaseTab
}) => {
  const [activeTab, setUiActiveTab] = useState('canvas');
  const [isPending, startTransition] = useTransition();

  // Initialize the builder logic
  // This hook manages its own state internally.
  // Ideally, the hook itself would be split, but for now we consume it and split the output.
  const builder = useLitigationBuilder({ navigateToCaseTab });

  // Guideline 25: USE startTransition FOR NON-URGENT CONTEXT UPDATES
  // Guideline 28: Stable function references
  const setActiveTab = React.useCallback((tab: string) => {
    startTransition(() => {
      setUiActiveTab(tab);
    });
  }, []);

  // Guideline 22: DESIGN CONTEXT VALUES TO BE CONCURRENT-SAFE
  // Immutable state, frozen in development
  const stateValue: LitigationState = useMemo(() => {
    const value = {
      activeTab,
      isPending,
      nodes: builder.nodes,
      connections: builder.connections,
      selectedCaseId: builder.selectedCaseId,
      cases: builder.cases || [], // Ensure array
      validationErrors: builder.validationErrors,
      isDeploying: builder.isDeploying
    };
    return process.env.NODE_ENV === 'development' ? Object.freeze(value) : value;
  }, [
    activeTab,
    isPending,
    builder.nodes,
    builder.connections,
    builder.selectedCaseId,
    builder.cases,
    builder.validationErrors,
    builder.isDeploying,
  ]);

  const actionsValue = useMemo(() => ({
    setActiveTab,
    setNodes: builder.setNodes,
    setConnections: builder.setConnections,
    setSelectedCaseId: builder.setSelectedCaseId,
    selectCase: builder.selectCase,
    deployToCase: builder.deployToCase,
    loadPlaybook: builder.loadPlaybook,
    updateNode: builder.updateNode,
    addNode: builder.addNode,
    deleteNode: builder.deleteNode,
    addConnection: builder.addConnection,
    updateConnection: builder.updateConnection,
    deleteConnection: builder.deleteConnection,
    clearCanvas: builder.clearCanvas,
  }), [
    setActiveTab,
    builder.setNodes,
    builder.setConnections,
    builder.setSelectedCaseId,
    builder.selectCase,
    builder.deployToCase,
    builder.loadPlaybook,
    builder.updateNode,
    builder.addNode,
    builder.deleteNode,
    builder.addConnection,
    builder.updateConnection,
    builder.deleteConnection,
    builder.clearCanvas,
  ]);

  // Rule 36: ISOLATE CONTEXT PROVIDERS
  return (
    <LitigationActionsContext.Provider value={actionsValue}>
      <LitigationStateContext.Provider value={stateValue}>
        {children}
      </LitigationStateContext.Provider>
    </LitigationActionsContext.Provider>
  );
};
