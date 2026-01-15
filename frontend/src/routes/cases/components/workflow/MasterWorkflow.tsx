/**
 * MasterWorkflow.tsx
 *
 * Master workflow orchestration panel with case workflows, firm processes,
 * templates, analytics, and configuration management.
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with complex workflow state management
 * - Guideline 28: Theme usage is pure function for workflow styling
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for workflow transitions
 */

import { Button } from '@/components/atoms/Button/Button';
import { EmptyState } from '@/components/molecules/EmptyState/EmptyState';
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary';
import { PageHeader } from '@/components/organisms/PageHeader';
import { AlertTriangle, Loader2, Play, Plus, RefreshCw } from 'lucide-react';

import { CaseWorkflowList } from './CaseWorkflowList';
import { EnhancedWorkflowPanel } from './EnhancedWorkflowPanel';
import { FirmProcessDetail } from './FirmProcessDetail';
import { FirmProcessList } from './FirmProcessList';
import { WorkflowView } from './types';
import { WorkflowAnalyticsDashboard } from './WorkflowAnalyticsDashboard';
import { WorkflowConfig } from './WorkflowConfig';
import { WorkflowEngineDetail } from './WorkflowEngineDetail';
import { WorkflowLibrary } from './WorkflowLibrary';
import { WORKFLOW_TABS } from './WorkflowTabs';
import { WorkflowTemplateBuilder } from './WorkflowTemplateBuilder';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme';
import { useMasterWorkflow } from '../../_hooks/useMasterWorkflow';

interface MasterWorkflowProps {
  onSelectCase: (caseId: string) => void;
  initialTab?: WorkflowView;
}

export function MasterWorkflow({ onSelectCase, initialTab }: MasterWorkflowProps) {
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();

  const {
    activeTab,
    viewMode,
    selectedId,
    selectedType,
    selectedTemplate,
    cases,
    firmProcesses,
    tasks,
    metrics,
    isLoading,
    isPending,
    hasError,
    isRunning,
    isSyncing,
    activeParentTab,
    setActiveTab,
    handleParentTabChange,
    handleManageWorkflow,
    handleSelectProcess,
    handleCreateTemplate,
    handleBack,
    runAutomation,
    syncEngine
  } = useMasterWorkflow(initialTab);

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

          <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {WORKFLOW_TABS.map(parent => (
              <button key={parent.id} onClick={() => handleParentTabChange(parent.id)} className={cn("flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2", activeParentTab?.id === parent.id ? cn("border-current", theme.primary.text) : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`))}>
                <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab?.id === parent.id ? theme.primary.text : theme.text.tertiary)} />{parent.label}
              </button>
            ))}
          </div>

          <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surface.highlight, theme.border.default)}>
            {activeParentTab?.subTabs.map(tab => (
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
            {!isLoading && activeTab === 'cases' && <CaseWorkflowList cases={cases} tasks={tasks} onSelectCase={onSelectCase} onManageWorkflow={handleManageWorkflow} />}
            {!isLoading && activeTab === 'firm' && <FirmProcessList processes={firmProcesses} onSelectProcess={handleSelectProcess} onCreateProcess={() => handleCreateTemplate()} />}
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
