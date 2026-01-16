import { useState, useCallback, useEffect, useMemo, useTransition } from 'react';
import { useQuery, useMutation } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { useNotify } from '@/hooks/useNotify';
import { getTodayString } from '@/lib/dateUtils';
import { TaskStatusBackend, WorkflowTask, WorkflowTemplateData, Case } from '@/types';
import { Process, WorkflowView } from '../components/workflow/types';
import { WORKFLOW_TABS } from '../components/workflow/WorkflowTabs';

export interface WorkflowMetrics {
  activeWorkflows: number;
  tasksDueToday: number;
  automationsRan: number;
  efficiencyGain: number;
  completionRate?: number;
  bottlenecks?: number;
  efficiency?: { trend: string; value: string };
}

const calculateMetrics = (
  cases: Case[],
  processes: Process[],
  tasks: WorkflowTask[]
): WorkflowMetrics => {
  const today = getTodayString();

  const activeWorkflows = cases.length + processes.filter(p => p.status === 'Active').length;

  const tasksDueToday = tasks.filter(
    t => t.dueDate === today &&
      t.status !== TaskStatusBackend.COMPLETED &&
      t.status !== TaskStatusBackend.CANCELLED
  ).length;

  const completedTasks = tasks.filter(t => t.status === TaskStatusBackend.COMPLETED);

  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const bottlenecks = tasks.filter(t =>
    (t.priority === 'Critical' || t.priority === 'High') &&
    t.status !== TaskStatusBackend.COMPLETED &&
    (t.dueDate ? new Date(t.dueDate) < new Date() : false)
  ).length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const automationsRan = tasks.filter(t => {
    if (t.status !== TaskStatusBackend.COMPLETED) return false;
    const dateStr = t.updatedAt || t.createdAt;
    if (!dateStr) return false;
    return new Date(dateStr) >= thirtyDaysAgo;
  }).length;

  const tasksWithDueDate = completedTasks.filter(t => t.dueDate);
  const onTimeTasks = tasksWithDueDate.filter(t => {
    if (!t.updatedAt || !t.dueDate) return true;
    return new Date(t.updatedAt) <= new Date(t.dueDate);
  });
  const efficiencyGain = tasksWithDueDate.length > 0
    ? Math.round((onTimeTasks.length / tasksWithDueDate.length) * 100) - 78
    : 0;

  return {
    activeWorkflows,
    tasksDueToday,
    automationsRan,
    efficiencyGain: Math.max(0, efficiencyGain),
    completionRate,
    bottlenecks,
    efficiency: {
      trend: efficiencyGain > 0 ? 'up' : efficiencyGain < 0 ? 'down' : 'stable',
      value: `${efficiencyGain > 0 ? '+' : ''}${efficiencyGain}%`
    }
  };
};

export function useMasterWorkflow(initialTab?: WorkflowView) {
  const notify = useNotify();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabState] = useState<WorkflowView>('templates');
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'builder'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'case' | 'process'>('case');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateData | null>(null);

  const setActiveTab = useCallback((tab: WorkflowView) => {
    startTransition(() => {
      setActiveTabState(tab);
    });
  }, []);

  const {
    data: cases = [],
    isLoading: casesLoading,
    status: casesStatus,
    refetch: refetchCases
  } = useQuery<Case[]>(
    ['cases', 'all'],
    DataService.cases.getAll
  );

  const {
    data: firmProcesses = [],
    isLoading: procsLoading,
    status: procsStatus,
    refetch: refetchProcesses
  } = useQuery<Process[]>(
    ['processes', 'all'],
    async () => {
      try {
        const templates = await DataService.workflow.getTemplates();
        return (templates || []).map((t: Record<string, unknown>) => {
          const trigger = t.trigger as Record<string, unknown> | undefined;
          const steps = (t.steps || []) as unknown[];
          const metadata = t.metadata as Record<string, unknown> | undefined;

          return {
            id: t.id as string,
            name: t.name as string,
            status: (t.status === 'active' ? 'Active' : t.status === 'draft' ? 'Pending' : 'Idle'),
            triggers: trigger?.type && typeof trigger.type === 'string'
              ? `${trigger.type.charAt(0).toUpperCase() + trigger.type.slice(1)}`
              : ((t.triggers as string) || 'Manual'),
            tasks: steps?.length || (t.tasks as number) || 0,
            completed: (t.completed as number) || 0,
            owner: (metadata?.owner as string) || (t.owner as string) || 'System'
          } as Process;
        });
      } catch (error) {
        console.error("Failed to fetch workflow processes:", error);
        return [];
      }
    }
  );

  const {
    data: tasks = [],
    refetch: refetchTasks
  } = useQuery<WorkflowTask[]>(
    ['tasks', 'all'],
    () => DataService.tasks.getAll()
  );

  const casesArray = useMemo(() => Array.isArray(cases) ? cases : [], [cases]);
  const tasksArray = useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks]);
  const firmProcessesArray = useMemo(() => Array.isArray(firmProcesses) ? firmProcesses : [], [firmProcesses]);

  const metrics = useMemo(() => {
    return calculateMetrics(casesArray, firmProcessesArray, tasksArray);
  }, [casesArray, firmProcessesArray, tasksArray]);

  const activeParentTab = useMemo(() =>
    WORKFLOW_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || WORKFLOW_TABS[0],
    [activeTab]
  );

  const isLoading = casesLoading || procsLoading;
  const hasError = casesStatus === 'error' || procsStatus === 'error';

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  const { mutate: runAutomation, isLoading: isRunning } = useMutation(
    DataService.workflow.runAutomation,
    {
      onSuccess: () => {
        notify.success("Automation sequence initiated successfully.");
        refetchTasks();
      },
      onError: (err: Error) => {
        notify.error(`Failed to run automation: ${err.message}`);
      }
    }
  );

  const { mutate: syncEngine, isLoading: isSyncing } = useMutation(
    DataService.workflow.syncEngine,
    {
      onSuccess: () => {
        notify.info("Workflow engine state synchronized.");
        refetchCases();
        refetchProcesses();
        refetchTasks();
      },
      onError: (err: Error) => {
        notify.error(`Failed to sync engine: ${err.message}`);
      }
    }
  );

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = WORKFLOW_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab((parent.subTabs![0]?.id || '') as WorkflowView);
    }
  }, [setActiveTab]);

  const handleManageWorkflow = useCallback((id: string) => {
    setSelectedId(id);
    setSelectedType('case');
    setViewMode('detail');
  }, []);

  const handleSelectProcess = useCallback((id: string) => {
    setSelectedId(id);
    setSelectedType('process');
    setViewMode('detail');
  }, []);

  const handleCreateTemplate = useCallback((template?: WorkflowTemplateData) => {
    setSelectedId(null);
    setSelectedTemplate(template || null);
    setViewMode('builder');
  }, []);

  const handleBack = useCallback(() => {
    setViewMode('list');
    setSelectedId(null);
    setSelectedTemplate(null);
  }, []);

  return {
    // State
    activeTab,
    viewMode,
    selectedId,
    selectedType,
    selectedTemplate,
    
    // Data
    cases: casesArray,
    firmProcesses: firmProcessesArray,
    tasks: tasksArray,
    metrics,
    
    // Status
    isLoading,
    isPending,
    hasError,
    isRunning,
    isSyncing,
    activeParentTab,

    // Actions
    setActiveTab,
    handleParentTabChange,
    handleManageWorkflow,
    handleSelectProcess,
    handleCreateTemplate,
    handleBack,
    runAutomation,
    syncEngine
  };
}
