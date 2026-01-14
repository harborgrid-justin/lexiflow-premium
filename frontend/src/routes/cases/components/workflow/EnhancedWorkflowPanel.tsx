/**
 * EnhancedWorkflowPanel.tsx
 *
 * Comprehensive workflow management panel with tabs for tasks, dependencies,
 * approvals, and history. Includes SLA monitoring and time tracking.
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with tabbed navigation
 * - Guideline 28: Theme usage is pure function for panel styling
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for panel transitions
 */

import { cn } from '@/shared/lib/cn';
import { Tabs } from '@/shared/ui/molecules/Tabs/Tabs';
import { useTheme } from '@/theme';
import { useState } from 'react';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import { AuditTrailViewer } from './AuditTrailViewer';
import { ENHANCED_WORKFLOW_TABS, type EnhancedWorkflowTab } from './constants';
import { ParallelTasksManager } from './ParallelTasksManager';
import { SLAMonitor } from './SLAMonitor';
import { TaskDependencyManager } from './TaskDependencyManager';
import { TimeTrackingPanel } from './TimeTrackingPanel';

// ============================================================================
// TYPES
// ============================================================================

interface KPIDashboardProps {
  // No props needed
}

interface WorkflowContentProps {
  activeTab: EnhancedWorkflowTab;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

const TAB_COMPONENTS: Record<EnhancedWorkflowTab, React.ComponentType<Record<string, unknown>>> = {
  tasks: ParallelTasksManager as unknown as React.ComponentType<Record<string, unknown>>,
  dependencies: TaskDependencyManager as unknown as React.ComponentType<Record<string, unknown>>,
  approvals: ApprovalWorkflow as unknown as React.ComponentType<Record<string, unknown>>,
  history: AuditTrailViewer as unknown as React.ComponentType<Record<string, unknown>>
};

// ============================================================================
// PRESENTATION COMPONENTS
// ============================================================================

/**
 * KPIDashboard - Monitoring widgets for SLA and time tracking
 */
function KPIDashboard(_props: KPIDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SLAMonitor />
      </div>
      <div>
        <TimeTrackingPanel />
      </div>
    </div>
  );
}

KPIDashboard.displayName = 'KPIDashboard';

/**
 * WorkflowContent - Dynamic content based on active tab using composition
 */
function WorkflowContent({ activeTab, onApprove, onReject }: WorkflowContentProps) {
  const ContentComponent = TAB_COMPONENTS[activeTab];

  // Special handling for approvals which needs callbacks
  if (activeTab === 'approvals') {
    return <ContentComponent onApprove={onApprove} onReject={onReject} />;
  }

  return <ContentComponent />;
}

WorkflowContent.displayName = 'WorkflowContent';

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

/**
 * EnhancedWorkflowPanel - Main workflow management interface
 *
 * Uses composition pattern instead of conditional rendering
 * Separated KPI dashboard and tabbed content into focused components
 */
export function EnhancedWorkflowPanel() {
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<EnhancedWorkflowTab>('tasks');

  const handleApprove = (id: string) => alert(`Approved ${id}`);
  const handleReject = (id: string) => alert(`Rejected ${id}`);
  const handleTabChange = (tab: string) => setActiveTab(tab as EnhancedWorkflowTab);

  return (
    <div className="h-full flex flex-col space-y-6">
      <KPIDashboard />

      <div className={cn("rounded-lg border shadow-sm flex flex-col flex-1 overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b", theme.border.default)}>
          <Tabs
            tabs={ENHANCED_WORKFLOW_TABS}
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
}

EnhancedWorkflowPanel.displayName = 'EnhancedWorkflowPanel';
