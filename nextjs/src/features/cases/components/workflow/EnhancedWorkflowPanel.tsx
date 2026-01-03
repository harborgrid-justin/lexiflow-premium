import React, { useState } from 'react';
import { SLAMonitor } from './SLAMonitor';
import { AuditTrailViewer } from './AuditTrailViewer';
import { ParallelTasksManager } from './ParallelTasksManager';
import { TaskDependencyManager } from './TaskDependencyManager';
import { TimeTrackingPanel } from './TimeTrackingPanel';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import { Tabs } from '@/components/ui/molecules/Tabs/Tabs';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES
// ============================================================================
type WorkflowTab = 'tasks' | 'dependencies' | 'approvals' | 'history';

interface KPIDashboardProps {
  // No props needed
}

interface WorkflowContentProps {
  activeTab: WorkflowTab;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

// ============================================================================
// TAB CONFIGURATION
// ============================================================================
const WORKFLOW_TABS: WorkflowTab[] = ['tasks', 'dependencies', 'approvals', 'history'];

const TAB_COMPONENTS: Record<WorkflowTab, React.FC<Record<string, unknown>>> = {
  tasks: ParallelTasksManager as unknown as React.FC<Record<string, unknown>>,
  dependencies: TaskDependencyManager as unknown as React.FC<Record<string, unknown>>,
  approvals: ApprovalWorkflow as unknown as React.FC<Record<string, unknown>>,
  history: AuditTrailViewer as unknown as React.FC<Record<string, unknown>>
};

// ============================================================================
// PRESENTATION COMPONENTS
// ============================================================================

/**
 * KPIDashboard - Monitoring widgets for SLA and time tracking
 */
const KPIDashboard: React.FC<KPIDashboardProps> = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <SLAMonitor />
    </div>
    <div>
      <TimeTrackingPanel />
    </div>
  </div>
);

/**
 * WorkflowContent - Dynamic content based on active tab using composition
 */
const WorkflowContent: React.FC<WorkflowContentProps> = ({ activeTab, onApprove, onReject }) => {
  const ContentComponent = TAB_COMPONENTS[activeTab];

  // Special handling for approvals which needs callbacks
  if (activeTab === 'approvals') {
    return <ContentComponent onApprove={onApprove} onReject={onReject} />;
  }

  return <ContentComponent />;
};

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

/**
 * EnhancedWorkflowPanel - Main workflow management interface
 *
 * Uses composition pattern instead of conditional rendering
 * Separated KPI dashboard and tabbed content into focused components
 */
export const EnhancedWorkflowPanel: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<WorkflowTab>('tasks');

  const handleApprove = (id: string) => alert(`Approved ${id}`);
  const handleReject = (id: string) => alert(`Rejected ${id}`);
  const handleTabChange = (tab: string) => setActiveTab(tab as WorkflowTab);

  return (
    <div className="h-full flex flex-col space-y-6">
      <KPIDashboard />

      <div className={cn("rounded-lg border shadow-sm flex flex-col flex-1 overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b", theme.border.default)}>
          <Tabs
            tabs={WORKFLOW_TABS}
            activeTab={activeTab}
            onChange={handleTabChange}
          />
        </div>

        <div className={cn("p-6 overflow-y-auto flex-1", theme.surface.highlight)}>
          <WorkflowContent
            activeTab={activeTab}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
};
