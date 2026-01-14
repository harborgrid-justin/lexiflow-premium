/**
 * @file AdvancedWorkflowDesigner.tsx
 * @description Elite workflow designer with 10 fully-integrated advanced features
 * @architecture Frontend-backend integration via DataService facade
 * @features Conditional branching, parallel execution, versioning, SLA monitoring,
 *           approval chains, rollback, analytics, AI suggestions, external triggers
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with complex workflow state (memoized)
 * - Guideline 28: Theme usage is pure function for UI styling
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for workflow designer transitions
 * - Guideline 24: Workflow analytics computations are memoized (useMemo)
 */

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/theme';
import type { EnhancedWorkflowInstance } from '@/types/workflow-advanced-types';
import {
  Boxes,
  Clock,
  GitBranch,
  GitCompare,
  Layers,
  LineChart,
  Sparkles,
  Undo2,
  UserCheck,
  Webhook,
} from 'lucide-react';
import { useMemo } from 'react';
import {
  AISuggestionsPanel,
  AnalyticsPanel,
  ApprovalChainsPanel,
  ConditionalBranchingPanel,
  ExternalTriggersPanel,
  ParallelExecutionPanel,
  RollbackPanel,
  SLAMonitoringPanel,
  VersionControlPanel,
  VisualDesignerPanel,
  WorkflowDesignerHeader,
  WorkflowFeatureStats,
  WorkflowFeatureTabs,
} from './components';
import { useAdvancedWorkflowDesigner } from './hooks/useAdvancedWorkflowDesigner';

interface AdvancedWorkflowDesignerProps {
  workflowId?: string;
  onSave?: (workflow: EnhancedWorkflowInstance) => void;
  onClose?: () => void;
}

export function AdvancedWorkflowDesigner({
  workflowId,
  onSave
}: AdvancedWorkflowDesignerProps) {
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();

  const {
    activeTab,
    setActiveTab,
    workflow,
    isLoading,
    analytics,
    aiSuggestions,
    versions,
    snapshots,
    externalTrigger,
    handleAddConditionalBranch,
    handleAddParallelExecution,
    handleCreateVersion,
    handleAddSLA,
    handleAddApprovalChain,
    handleCreateWebhook,
    handleCreateSnapshot,
    handleApplySuggestion,
    handleRollback,
  } = useAdvancedWorkflowDesigner({ workflowId, onSave });

  // ============================================================================
  // FEATURE TABS CONFIGURATION
  // ============================================================================

  const featureTabs = useMemo(() => [
    { id: 'designer', label: 'Visual Designer', icon: Layers },
    { id: 'conditional', label: 'Conditional Branching', icon: GitBranch },
    { id: 'parallel', label: 'Parallel Execution', icon: Boxes },
    { id: 'versions', label: 'Version Control', icon: GitCompare },
    { id: 'sla', label: 'SLA Monitoring', icon: Clock },
    { id: 'approvals', label: 'Approval Chains', icon: UserCheck },
    { id: 'rollback', label: 'Rollback/Snapshots', icon: Undo2 },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'ai', label: 'AI Suggestions', icon: Sparkles },
    { id: 'triggers', label: 'External Triggers', icon: Webhook },
  ], []);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className={cn("text-sm", theme.text.secondary)}>Loading workflow designer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <WorkflowDesignerHeader workflow={workflow} onSave={onSave} />
      <WorkflowFeatureStats workflow={workflow} aiSuggestions={aiSuggestions} />
      <WorkflowFeatureTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={featureTabs}
      />

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'designer' && (
          <VisualDesignerPanel
            onAddConditionalBranch={handleAddConditionalBranch}
            onAddParallelExecution={handleAddParallelExecution}
            onAddSLA={handleAddSLA}
            onAddApprovalChain={handleAddApprovalChain}
            onCreateSnapshot={handleCreateSnapshot}
            onCreateWebhook={handleCreateWebhook}
          />
        )}

        {activeTab === 'conditional' && <ConditionalBranchingPanel />}

        {activeTab === 'parallel' && <ParallelExecutionPanel />}

        {activeTab === 'versions' && (
          <VersionControlPanel
            versions={versions}
            onCreateVersion={handleCreateVersion}
          />
        )}

        {activeTab === 'sla' && <SLAMonitoringPanel />}

        {activeTab === 'approvals' && (
          <ApprovalChainsPanel onAddApprovalChain={handleAddApprovalChain} />
        )}

        {activeTab === 'rollback' && (
          <RollbackPanel
            snapshots={snapshots}
            onCreateSnapshot={handleCreateSnapshot}
            onRollback={handleRollback}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsPanel analytics={analytics} />}

        {activeTab === 'ai' && (
          <AISuggestionsPanel
            suggestions={aiSuggestions}
            onApplySuggestion={handleApplySuggestion}
          />
        )}

        {activeTab === 'triggers' && (
          <ExternalTriggersPanel
            externalTrigger={externalTrigger}
            onCreateWebhook={handleCreateWebhook}
          />
        )}
      </div>
    </div>
  );
}

AdvancedWorkflowDesigner.displayName = 'AdvancedWorkflowDesigner';
