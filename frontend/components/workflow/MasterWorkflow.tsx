
import React, { useState, useMemo, useCallback, useEffect, useTransition } from 'react';
import { Plus, RefreshCw, Play, Loader2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';
import { DataService } from '../../services/dataService';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { EmptyState } from '../common/EmptyState';

// Direct Imports to optimize Tree-Shaking and HMR
import { CaseWorkflowList } from './CaseWorkflowList';
import { FirmProcessList } from './FirmProcessList';
import { EnhancedWorkflowPanel } from './EnhancedWorkflowPanel';
import { WorkflowTemplateBuilder } from './WorkflowTemplateBuilder';
import { WorkflowAnalyticsDashboard } from './WorkflowAnalyticsDashboard';
import { WorkflowConfig } from './WorkflowConfig';
import { WorkflowEngineDetail } from './WorkflowEngineDetail';
import { FirmProcessDetail } from './FirmProcessDetail';
import { WorkflowLibrary } from './WorkflowLibrary';
import { TemplatePreview } from './TemplatePreview';
import { WorkflowTemplateData, WorkflowTask } from '../../types';

import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { WORKFLOW_TABS } from './WorkflowTabs';
import { Case } from '../../types';
import { useQuery, useMutation } from '../../services/queryClient';
import { useNotify } from '../../hooks/useNotify';
import { STORES } from '../../services/db';
import { WorkflowView } from './types';

interface MasterWorkflowProps {
  onSelectCase: (caseId: string) => void;
  initialTab?: WorkflowView;
}

export const MasterWorkflow: React.FC<MasterWorkflowProps> = ({ onSelectCase, initialTab }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useState<WorkflowView>('templates');
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'builder'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'case' | 'process'>('case');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateData | null>(null);
  
  const setActiveTab = (tab: WorkflowView) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };
  
  // Enterprise Data Access
  const { data: cases = [], isLoading: casesLoading, isError: casesError } = useQuery<Case[]>(
      [STORES.CASES, 'all'],
      DataService.cases.getAll
  );

  const { data: firmProcesses = [], isLoading: procsLoading, isError: procsError } = useQuery<any[]>(
      [STORES.PROCESSES, 'all'],
      DataService.workflow.getProcesses
  );

  const { data: tasks = [] } = useQuery<WorkflowTask[]>(
      [STORES.TASKS, 'all'],
      DataService.workflow.getTasks
  );

  const tasksDueToday = useMemo(() => {
      const today = new Date().toISOString().split('T')[0];
      return tasks.filter(t => t.dueDate === today && t.status !== 'Done' && t.status !== 'Completed').length;
  }, [tasks]);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Mutations
  const { mutate: runAutomation, isLoading: isRunning } = useMutation(
      DataService.workflow.runAutomation,
      { onSuccess: () => notify.success("Automation sequence initiated successfully.") }
  );

  const { mutate: syncEngine, isLoading: isSyncing } = useMutation(
      DataService.workflow.syncEngine,
      { onSuccess: () => notify.info("Workflow engine state synchronized.") }
  );

  const activeParentTab = useMemo(() => 
    WORKFLOW_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || WORKFLOW_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = WORKFLOW_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as WorkflowView);
    }
  }, []);

  const handleManageWorkflow = (id: string) => {
    setSelectedId(id);
    setSelectedType('case');
    setViewMode('detail');
  };

  const handleSelectProcess = (id: string) => {
    setSelectedId(id);
    setSelectedType('process');
    setViewMode('detail');
  };

  const handleCreateTemplate = (template?: WorkflowTemplateData) => {
    setSelectedId(null);
    setSelectedTemplate(template || null);
    setViewMode('builder');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedId(null);
    setSelectedTemplate(null);
  };

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

  const isLoading = casesLoading || procsLoading;
  const hasError = casesError || procsError;

  if (hasError) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState 
          title="Unable to load workflow data" 
          description="There was a problem connecting to the local database. Please try refreshing." 
          icon={AlertTriangle}
          action={<Button onClick={() => window.location.reload()} icon={RefreshCw}>Reload Application</Button>}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary scope="MasterWorkflow">
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Master Workflow Engine" 
          subtitle="Orchestrate case lifecycles, firm-wide business operations, and automation rules."
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
                <p className={cn("text-2xl font-bold", theme.primary.text)}>{cases.length + firmProcesses.filter(p => p.status === 'Active').length}</p>
              </div>
              <div className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Tasks Due Today</p>
                <p className={cn("text-2xl font-bold", theme.status.warning.text)}>{tasksDueToday}</p>
              </div>
              <div className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Automations Ran</p>
                <p className="text-2xl font-bold text-purple-600">1,204</p>
              </div>
              <div className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
                <p className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Efficiency Gain</p>
                <p className={cn("text-2xl font-bold", theme.status.success.text)}>+22%</p>
              </div>
          </div>
        )}

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {WORKFLOW_TABS.map(parent => (
                <button key={parent.id} onClick={() => handleParentTabChange(parent.id)} className={cn("flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2", activeParentTab.id === parent.id ? cn("border-current", theme.primary.text) : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`))}>
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>{parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surface.highlight, theme.border.default)}>
            {activeParentTab.subTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as WorkflowView)} className={cn("flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border", activeTab === tab.id ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`))}>
                    <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>{tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            {isLoading && <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600 h-8 w-8"/></div>}
            {!isLoading && activeTab === 'templates' && <WorkflowLibrary onCreate={handleCreateTemplate} />}
            {!isLoading && activeTab === 'cases' && <CaseWorkflowList cases={cases} tasks={tasks} onSelectCase={onSelectCase} onManageWorkflow={handleManageWorkflow} />}
            {!isLoading && activeTab === 'firm' && <FirmProcessList processes={firmProcesses} onSelectProcess={handleSelectProcess} />}
            {activeTab === 'ops_center' && <EnhancedWorkflowPanel />}
            {activeTab === 'analytics' && <WorkflowAnalyticsDashboard />}
            {activeTab === 'settings' && <WorkflowConfig />}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};
