import { useState, useCallback } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import type {
  AIWorkflowSuggestion,
  ApprovalChain,
  EnhancedWorkflowInstance,
  ExternalTrigger,
  RollbackOperation,
  SLAConfig,
  WebhookConfig,
  WorkflowAnalytics,
  WorkflowSnapshot,
  WorkflowVersion,
} from '@/types/workflow-advanced-types';
import { FeatureTab } from '../components';

interface UseAdvancedWorkflowDesignerProps {
  workflowId?: string;
  onSave?: (workflow: EnhancedWorkflowInstance) => void;
}

export const useAdvancedWorkflowDesigner = ({ workflowId, onSave: _onSave }: UseAdvancedWorkflowDesignerProps) => {
  const notify = useNotify();
  const [activeTab, setActiveTab] = useState<FeatureTab>('designer');
  const [selectedNodeId] = useState<string | null>(null);
  const [externalTrigger, setExternalTrigger] = useState<ExternalTrigger | null>(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: workflow, isLoading } = useQuery<EnhancedWorkflowInstance>(
    ['workflow', 'enhanced', workflowId],
    async () => {
      const workflowService = DataService.workflow as unknown as { getEnhanced: (id: string) => Promise<EnhancedWorkflowInstance> };
      return workflowService.getEnhanced(workflowId!);
    },
    { enabled: !!workflowId },
  );

  const { data: analytics } = useQuery<WorkflowAnalytics>(
    ['workflow', 'analytics', workflowId],
    async () => {
      const workflowService = DataService.workflow as unknown as { getAnalytics: (id: string, params: { start: string; end: string }) => Promise<WorkflowAnalytics> };
      return workflowService.getAnalytics(workflowId!, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      });
    },
    { enabled: !!workflowId && activeTab === 'analytics' },
  );

  const { data: aiSuggestions = [] } = useQuery<AIWorkflowSuggestion[]>(
    ['workflow', 'ai-suggestions', workflowId],
    async () => {
      const workflowService = DataService.workflow as unknown as { getAISuggestions: (id: string) => Promise<AIWorkflowSuggestion[]> };
      return workflowService.getAISuggestions(workflowId!);
    },
    { enabled: !!workflowId && activeTab === 'ai' },
  );

  const { data: versions = [] } = useQuery<WorkflowVersion[]>(
    ['workflow', 'versions', workflowId],
    async () => {
      const workflowService = DataService.workflow as unknown as { getVersions: (id: string) => Promise<WorkflowVersion[]> };
      return workflowService.getVersions(workflowId!);
    },
    { enabled: !!workflowId && activeTab === 'versions' },
  );

  const { data: snapshots = [] } = useQuery<WorkflowSnapshot[]>(
    ['workflow', 'snapshots', workflowId],
    async () => {
      const workflowService = DataService.workflow as unknown as { getSnapshots: (id: string) => Promise<WorkflowSnapshot[]> };
      return workflowService.getSnapshots(workflowId!);
    },
    { enabled: !!workflowId && activeTab === 'rollback' },
  );

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createVersionMutation = useMutation(
    async (versionData: Partial<WorkflowVersion>) => {
      const workflowService = DataService.workflow as unknown as { createVersion: (id: string, data: Partial<WorkflowVersion>) => Promise<WorkflowVersion> };
      return workflowService.createVersion(workflowId!, versionData);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(['workflow', 'versions', workflowId]);
        notify.success('New version created successfully');
      },
      onError: () => notify.error('Failed to create version'),
    },
  );

  const createSLAMutation = useMutation(
    async (config: Partial<SLAConfig>) => {
      const workflowService = DataService.workflow as unknown as { createSLA: (id: string, config: Partial<SLAConfig>) => Promise<SLAConfig> };
      return workflowService.createSLA(workflowId!, config);
    },
    {
      onSuccess: () => {
        notify.success('SLA monitoring enabled');
        queryClient.invalidate(['workflow', 'sla', workflowId]);
      },
    },
  );

  const createApprovalChainMutation = useMutation(
    async (chain: Partial<ApprovalChain>) => {
      const workflowService = DataService.workflow as unknown as { createApprovalChain: (id: string, chain: Partial<ApprovalChain>) => Promise<ApprovalChain> };
      return workflowService.createApprovalChain(workflowId!, chain);
    },
    {
      onSuccess: () => {
        notify.success('Approval chain created');
        queryClient.invalidate(['workflow', 'approvals', workflowId]);
      },
    },
  );

  const createSnapshotMutation = useMutation(
    async (type: 'manual' | 'milestone') => {
      const workflowService = DataService.workflow as unknown as { createSnapshot: (id: string, data: { type: string; label?: string }) => Promise<WorkflowSnapshot> };
      return workflowService.createSnapshot(workflowId!, { type, label: `${type} snapshot` });
    },
    {
      onSuccess: () => {
        notify.success('Snapshot created');
        queryClient.invalidate(['workflow', 'snapshots', workflowId]);
      },
    },
  );

  const rollbackMutation = useMutation(
    async (snapshotId: string) => {
      const workflowService = DataService.workflow as unknown as { rollback: (id: string, snapshotId: string) => Promise<RollbackOperation> };
      return workflowService.rollback(workflowId!, snapshotId);
    },
    {
      onSuccess: () => {
        notify.success('Workflow rolled back successfully');
        queryClient.invalidate(['workflow', 'enhanced', workflowId]);
      },
      onError: () => notify.error('Rollback failed'),
    },
  );

  const applyAISuggestionMutation = useMutation(
    async (suggestionId: string) => {
      const workflowService = DataService.workflow as unknown as { applyAISuggestion: (id: string, suggestionId: string) => Promise<EnhancedWorkflowInstance> };
      return workflowService.applyAISuggestion(workflowId!, suggestionId);
    },
    {
      onSuccess: () => {
        notify.success('AI suggestion applied');
        queryClient.invalidate(['workflow', 'enhanced', workflowId]);
        queryClient.invalidate(['workflow', 'ai-suggestions', workflowId]);
      },
    },
  );

  const createTriggerMutation = useMutation(
    async (config: Partial<ExternalTrigger>) => {
      const workflowService = DataService.workflow as unknown as { createExternalTrigger: (id: string, config: Partial<ExternalTrigger>) => Promise<ExternalTrigger> };
      return workflowService.createExternalTrigger(workflowId!, config);
    },
    {
      onSuccess: (trigger: ExternalTrigger) => {
        const webhookConfig = trigger.type === 'webhook' && trigger.config.type === 'webhook'
          ? trigger.config
          : null;
        notify.success(`Webhook created: ${webhookConfig?.url || 'URL pending'}`);
        setExternalTrigger(trigger);
        queryClient.invalidate(['workflow', 'triggers', workflowId]);
      },
    },
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddConditionalBranch = useCallback(() => {
    if (!selectedNodeId) {
      notify.warning('Please select a node first');
      return;
    }
    notify.success('Conditional branch added - configure rules');
    setActiveTab('conditional');
  }, [selectedNodeId, notify]);

  const handleAddParallelExecution = useCallback(() => {
    if (!selectedNodeId) {
      notify.warning('Please select a node first');
      return;
    }
    notify.success('Parallel execution configured');
    setActiveTab('parallel');
  }, [selectedNodeId, notify]);

  const handleCreateVersion = useCallback((message: string) => {
    if (!workflow) return;

    const currentVersion = versions[0]?.semanticVersion || '0.0.0';
    const versionParts = typeof currentVersion === 'string' ? currentVersion.split('.').map(Number) : [0, 0, 0];
    const [major = 0, minor = 0, patch = 0] = versionParts;
    const newVersion = `${major}.${minor}.${patch + 1}`;

    createVersionMutation.mutate({
      semanticVersion: newVersion,
      commitMessage: message,
      nodes: workflow.nodes,
      connections: workflow.connections,
      config: workflow.metadata,
    });
  }, [workflow, versions, createVersionMutation]);

  const handleAddSLA = useCallback(() => {
    if (!selectedNodeId) {
      notify.warning('Please select a node first');
      return;
    }

    const config = {
      name: 'Node SLA',
      targetDuration: 86400000,
      warningThreshold: 80,
      criticalThreshold: 100,
      businessHoursOnly: true,
      escalationPolicy: {
        id: `escalation-${Date.now()}`,
        levels: [],
        autoResolve: true,
        notifyOnEscalation: true,
        notifyOnResolution: true,
      },
    } as Partial<SLAConfig>;

    createSLAMutation.mutate(config);
    setActiveTab('sla');
  }, [selectedNodeId, createSLAMutation, notify]);

  const handleAddApprovalChain = useCallback(() => {
    const chain = {
      name: 'New Approval Chain',
      levels: [
        {
          level: 1,
          name: 'Initial Review',
          approvers: [],
          requiredApprovals: 1,
          allowDelegation: true,
          allowComments: true,
          requireComments: false,
          attachmentRequired: false,
        },
      ],
      requireSequential: true,
      allowParallel: false,
      defaultAction: 'none',
      timeoutAction: 'escalate',
      notificationStrategy: 'immediate',
    } as Partial<ApprovalChain>;

    createApprovalChainMutation.mutate(chain);
    setActiveTab('approvals');
  }, [createApprovalChainMutation]);

  const handleCreateWebhook = useCallback(() => {
    const webhookConfig: WebhookConfig = {
      type: 'webhook',
      url: '',
      method: 'POST',
    };

    const trigger: Partial<ExternalTrigger> = {
      name: 'Webhook Trigger',
      type: 'webhook',
      enabled: true,
      config: webhookConfig,
      filters: [],
    };

    createTriggerMutation.mutate(trigger);
    setActiveTab('triggers');
  }, [createTriggerMutation]);

  const handleCreateSnapshot = useCallback(() => {
    createSnapshotMutation.mutate('manual');
  }, [createSnapshotMutation]);

  const handleApplySuggestion = useCallback((id: string) => {
    applyAISuggestionMutation.mutate(id);
  }, [applyAISuggestionMutation]);
  
  const handleRollback = useCallback((id: string) => {
    rollbackMutation.mutate(id);
  }, [rollbackMutation]);

  return {
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
  };
};
