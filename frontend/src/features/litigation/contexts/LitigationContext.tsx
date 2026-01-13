/**
 * @module features/litigation/contexts/LitigationContext
 * @description Context definitions for Litigation feature.
 * Implements React v18 Concurrency Guidelines.
 */

import React, { createContext, useContext, useMemo, useState, useTransition } from 'react';
import { UseLitigationBuilderReturn, useLitigationBuilder } from '@/hooks/useLitigationBuilder';
import { WorkflowNode, WorkflowConnection } from '@/types/workflow-types';
import { Case } from '@/types/models';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Rule 26: SEPARATE URGENT AND NON-URGENT CONTEXT PATHS

export interface LitigationState {
  // UI State
  activeTab: string;
  isPending: boolean; // Tracking transition state

  // Builder State
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedCaseId: string | null;
  cases: Case[];
  validationErrors: string[];
  isDeploying: boolean;
}

export type LitigationActions = Omit<UseLitigationBuilderReturn, 
  'nodes' | 'connections' | 'selectedCaseId' | 'cases' | 'validationErrors' | 'isDeploying'> & {
  setActiveTab: (tab: string) => void;
};

// ============================================================================
// CONTEXTS
// ============================================================================

// Rule 38: ENSURE CONTEXT DEFAULTS ARE CONCURRENT-SAFE
const defaultState: LitigationState = {
  activeTab: 'canvas',
  isPending: false,
  nodes: [],
  connections: [],
  selectedCaseId: null,
  cases: [],
  validationErrors: [],
  isDeploying: false,
};

// We cast the default actions safely as they will be provided immediately
const LitigationStateContext = createContext<LitigationState>(defaultState);
const LitigationActionsContext = createContext<LitigationActions>({} as LitigationActions);

// ============================================================================
// HOOKS
// ============================================================================

export const useLitigationState = () => {
  const context = useContext(LitigationStateContext);
  if (!context) {
    throw new Error('useLitigationState must be used within a LitigationProvider');
  }
  return context;
};

export const useLitigationActions = () => {
  const context = useContext(LitigationActionsContext);
  if (!context) {
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

  // Rule 25: USE startTransition FOR NON-URGENT CONTEXT UPDATES
  const setActiveTab = (tab: string) => {
    startTransition(() => {
      setUiActiveTab(tab);
    });
  };

  // Rule 22: DESIGN CONTEXT VALUES TO BE CONCURRENT-SAFE
  const stateValue: LitigationState = useMemo(() => ({
    activeTab,
    isPending,
    nodes: builder.nodes,
    connections: builder.connections,
    selectedCaseId: builder.selectedCaseId,
    cases: builder.cases || [], // Ensure array
    validationErrors: builder.validationErrors,
    isDeploying: builder.isDeploying
  }), [
    activeTab, 
    isPending, 
    builder.nodes, 
    builder.connections, 
    builder.selectedCaseId, 
    builder.cases, 
    builder.validationErrors, 
    builder.isDeploying
  ]);

  const actionsValue: LitigationActions = useMemo(() => ({
    // UI Actions
    setActiveTab,
    
    // Builder Actions
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
