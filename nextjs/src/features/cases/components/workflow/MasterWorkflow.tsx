import { ErrorBoundary } from '@/components/organisms/ErrorBoundary';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Button } from '@/components/ui/atoms/Button/Button';
import { EmptyState } from '@/components/ui/molecules/EmptyState/EmptyState';
import { DataService } from '@/services/data/dataService';
import { AlertTriangle, Loader2, Play, Plus, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

// Direct Imports to optimize Tree-Shaking and HMR
import { TaskStatusBackend, WorkflowTask, WorkflowTemplateData } from '@/types';
import { CaseWorkflowList } from './CaseWorkflowList';
import { EnhancedWorkflowPanel } from './EnhancedWorkflowPanel';
import { FirmProcessDetail } from './FirmProcessDetail';
import { FirmProcessList } from './FirmProcessList';
import { WorkflowAnalyticsDashboard } from './WorkflowAnalyticsDashboard';
import { WorkflowConfig } from './WorkflowConfig';
import { WorkflowEngineDetail } from './WorkflowEngineDetail';
import { WorkflowLibrary } from './WorkflowLibrary';
import { WorkflowTemplateBuilder } from './WorkflowTemplateBuilder';

// Type derived from BUSINESS_PROCESSES data model
interface FirmProcess {
  id: string;
  name: string;
  status: 'Active' | 'Scheduled' | 'Idle' | 'Pending' | 'Completed';
  triggers: string;
  tasks: number;
  completed: number;
  owner: string;
}

import { useNotify } from '@/hooks/useNotify';
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/providers';
import { WorkflowRepository } from '@/services/data/repositories/WorkflowRepository';
import { Case } from '@/types';
import { cn } from '@/utils/cn';
import { getTodayString } from '@/utils/dateUtils';
import { WORKFLOW_TABS } from './WorkflowTabs';
// ✅ Migrated to backend API (2025-12-21)
import { WorkflowView } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MasterWorkflowProps {
  onSelectCase: (caseId: string) => void;
  initialTab?: WorkflowView;
}

interface WorkflowMetrics {
  activeWorkflows: number;
  tasksDueToday: number;
  automationsRan: number;
  efficiencyGain: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate workflow metrics from real data
 */
const calculateMetrics = (
  cases: Case[],
  processes: FirmProcess[],
  tasks: WorkflowTask[]
): WorkflowMetrics => {
  const today = getTodayString();

  const activeWorkflows = cases.length + processes.filter(p => p.status === 'Active').length;

  const tasksDueToday = tasks.filter(
    t => t.dueDate === today &&
      t.status !== TaskStatusBackend.COMPLETED &&
      t.status !== TaskStatusBackend.CANCELLED
  ).length;

  // Calculate automations ran (completed tasks in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const automationsRan = tasks.filter(t => {
    if (t.status !== TaskStatusBackend.COMPLETED) return false;
    const dateStr = t.updatedAt || t.createdAt;
    if (!dateStr) return false;
    return new Date(dateStr) >= thirtyDaysAgo;
  }).length;

  // Calculate efficiency gain based on completed tasks with due dates
  const completedTasks = tasks.filter(t => t.status === TaskStatusBackend.COMPLETED);
  const tasksWithDueDate = completedTasks.filter(t => t.dueDate);
  const onTimeTasks = tasksWithDueDate.filter(t => {
    // If no updatedAt, assume on time
    if (!t.updatedAt || !t.dueDate) return true;
    return new Date(t.updatedAt) <= new Date(t.dueDate);
  });
  const efficiencyGain = tasksWithDueDate.length > 0
    ? Math.round((onTimeTasks.length / tasksWithDueDate.length) * 100) - 78 // Base efficiency is 78%
    : 0;

  return {
    activeWorkflows,
    tasksDueToday,
    automationsRan,
    efficiencyGain: Math.max(0, efficiencyGain),
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MasterWorkflow: React.FC<MasterWorkflowProps> = ({ onSelectCase, initialTab }) => {
  // ==========================================================================
  // HOOKS - Context & State
  // ==========================================================================
  const { theme } = useTheme();
  const notify = useNotify();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useState<WorkflowView>('templates');
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'builder'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'case' | 'process'>('case');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateData | null>(null);

  const setActiveTab = useCallback((tab: WorkflowView) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  }, []);

  // ==========================================================================
  // HOOKS - Data Fetching
  // ==========================================================================
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
  } = useQuery<FirmProcess[]>(
    ['processes', 'all'],
    async () => {
      const result = await WorkflowRepository.getProcesses();
      return result as FirmProcess[];
    }
  );

  const {
    data: tasks = [],
    refetch: refetchTasks
  } = useQuery<WorkflowTask[]>(
    ['tasks', 'all'],
    () => DataService.tasks.getAll()
  );

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  // Ensure all data is always an array
  const casesArray = useMemo(() => Array.isArray(cases) ? cases : [], [cases]);
  const tasksArray = useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks]);
  const firmProcessesArray = useMemo(() => Array.isArray(firmProcesses) ? firmProcesses : [], [firmProcesses]);

  // Calculate metrics from real data
  const metrics = useMemo(() =>
    calculateMetrics(casesArray, firmProcessesArray, tasksArray),
    [casesArray, firmProcessesArray, tasksArray]
  );

  const activeParentTab = useMemo(() =>
    WORKFLOW_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || WORKFLOW_TABS[0],
    [activeTab]
  );

  const isLoading = casesLoading || procsLoading;
  const hasError = casesStatus === 'error' || procsStatus === 'error';

  // ==========================================================================
  // EFFECTS
  // ==========================================================================
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  // ==========================================================================
  // HOOKS - Mutations
  // ==========================================================================
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

  // ==========================================================================
  // CALLBACKS - Event Handlers
  // ==========================================================================
  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = WORKFLOW_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as WorkflowView);
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

  // ==========================================================================
  // RENDER - Detail/Builder Views
  // ==========================================================================
  if (viewMode === 'detail' && selectedId) {
    if (selectedType === 'case') {
      return <WorkflowEngineDetail id={selectedId} type="case" onBack={handleBack} />;
    } else {
      return <FirmProcessDetail processId={selectedId} onBack={handleBack} />;
    }
  }

  if (viewMode === 'builder') {
    return <WorkflowTemplateBuilder initialTemplate={selectedTemplate} onBack={handleBack} />;
  }

  // ==========================================================================
  // RENDER - Error State
  // ==========================================================================
  if (hasError) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          title="Unable to load workflow data"
          description="There was a problem connecting to the database. Please try refreshing."
          icon={AlertTriangle}
          action={
            <Button onClick={() => window.location.reload()} icon={RefreshCw}>
              Reload Application
            </Button>
          }
        />
      </div>
    );
  }

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  return (
    <ErrorBoundary scope="MasterWorkflow">
      <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
        <div className="px-6 pt-6 shrink-0">
          <PageHeader
            title="Case Workflows"
            subtitle="Orchestrate case lifecycles, automate tasks, and manage firm-wide business process automation."
            actions={
              <div className="flex gap-2">
                {activeTab === 'templates' && <Button variant="primary" icon={Plus} onClick={() => handleCreateTemplate()}>New Template</Button>}
                {activeTab === 'cases' && <Button variant="primary" icon={Play} onClick={() => runAutomation('all')} isLoading={isRunning}>Run Automation</Button>}
                <Button variant="outline" icon={RefreshCw} onClick={() => syncEngine(undefined)} isLoading={isSyncing}>Sync Engine</Button>
              </div>
            }
          />

          {/* Stats Overview - Only show on Execution tabs */}
          {['cases', 'firm'].includes(activeTab) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Active Workflows</p>
                <p className={cn("text-2xl font-bold", theme.primary.text)}>{metrics.activeWorkflows}</p>
              </div>
              <div className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Tasks Due Today</p>
                <p className={cn("text-2xl font-bold", theme.status.warning.text)}>{metrics.tasksDueToday}</p>
              </div>
              <div className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Automations Ran</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.automationsRan.toLocaleString()}</p>
              </div>
              <div className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Efficiency Gain</p>
                <p className={cn("text-2xl font-bold", theme.status.success.text)}>
                  {metrics.efficiencyGain > 0 ? '+' : ''}{metrics.efficiencyGain}%
                </p>
              </div>
            </div>
          )}

          {/* Desktop Parent Navigation */}
          <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {WORKFLOW_TABS.map(parent => (
              <button key={parent.id} onClick={() => handleParentTabChange(parent.id)} className={cn("flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2", activeParentTab.id === parent.id ? cn("border-current", theme.primary.text) : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`))}>
                <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)} />{parent.label}
              </button>
            ))}
          </div>

          {/* Sub-Navigation (Pills) */}
          <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surface.highlight, theme.border.default)}>
            {activeParentTab.subTabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as WorkflowView)} className={cn("flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border", activeTab === tab.id ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`))}>
                <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)} />{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 custom-scrollbar">
          <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            {isLoading && <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>}
            {!isLoading && activeTab === 'templates' && <WorkflowLibrary onCreate={handleCreateTemplate} />}
            {!isLoading && activeTab === 'cases' && <CaseWorkflowList cases={casesArray} tasks={tasksArray} onSelectCase={onSelectCase} onManageWorkflow={handleManageWorkflow} />}
            {!isLoading && activeTab === 'firm' && <FirmProcessList processes={firmProcessesArray} onSelectProcess={handleSelectProcess} />}
            {activeTab === 'ops_center' && <EnhancedWorkflowPanel />}
            {activeTab === 'analytics' && <WorkflowAnalyticsDashboard />}
            {activeTab === 'settings' && <WorkflowConfig />}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MasterWorkflow;
