
import React, { useState, useMemo, useCallback, useEffect, useTransition } from 'react';
import { Plus, RefreshCw, Play, Loader2 } from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { DataService } from '../services/dataService';

// Direct Imports to optimize Tree-Shaking and HMR
import { CaseWorkflowList } from './workflow/CaseWorkflowList';
import { FirmProcessList } from './workflow/FirmProcessList';
import { EnhancedWorkflowPanel } from './workflow/EnhancedWorkflowPanel';
import { WorkflowTemplateBuilder } from './workflow/WorkflowTemplateBuilder';
import { WorkflowAnalyticsDashboard } from './workflow/WorkflowAnalyticsDashboard';
import { WorkflowConfig } from './workflow/WorkflowConfig';
import { WorkflowEngineDetail } from './workflow/WorkflowEngineDetail';
import { FirmProcessDetail } from './workflow/FirmProcessDetail';
import { WorkflowLibrary } from './workflow/WorkflowLibrary';
import { TemplatePreview } from './workflow/TemplatePreview';
import { WorkflowTemplateData } from '../types';

import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { WORKFLOW_TABS } from './workflow/WorkflowTabs';
import { Case } from '../types';
import { useQuery, useMutation } from '../services/queryClient';
import { useNotify } from '../hooks/useNotify';
import { STORES } from '../services/db';

interface MasterWorkflowProps {
  onSelectCase: (caseId: string) => void;
  initialTab?: WorkflowView;
}

type WorkflowView = 'templates' | 'cases' | 'firm' | 'ops_center' | 'analytics' | 'settings';

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
  const { data: cases = [], isLoading: casesLoading } = useQuery<Case[]>(
      [STORES.CASES, 'all'],
      DataService.cases.getAll
  );

  const { data: firmProcesses = [], isLoading: procsLoading } = useQuery<any[]>(
      [STORES.PROCESSES, 'all'],
      DataService.workflow.getProcesses
  );

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

  const getCaseProgress = (status: string) => {
    switch(status) {
      case 'Discovery': return 45;
      case 'Trial': return 80;
      case 'Settled': return 100;
      default: return 10;
    }
  };

  const getNextTask = (status: string) => {
    switch(status) {
      case 'Discovery': return 'Review Production Set 2';
      case 'Trial': return 'Prepare Witness List';
      case 'Settled': return 'Execute Final Release';
      default: return 'Draft Complaint';
    }
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

  return (
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
                <p className={cn("text-2xl font-bold", theme.status.warning.text)}>14</p>
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
        <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surfaceHighlight, theme.border.default)}>
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
            {!isLoading && activeTab === 'cases' && <CaseWorkflowList cases={cases} onSelectCase={onSelectCase} onManageWorkflow={handleManageWorkflow} getCaseProgress={getCaseProgress} getNextTask={getNextTask} />}
            {!isLoading && activeTab === 'firm' && <FirmProcessList processes={firmProcesses} onSelectProcess={handleSelectProcess} />}
            {activeTab === 'ops_center' && <EnhancedWorkflowPanel />}
            {activeTab === 'analytics' && <WorkflowAnalyticsDashboard />}
            {activeTab === 'settings' && <WorkflowConfig />}
        </div>
      </div>
    </div>
  );
};
