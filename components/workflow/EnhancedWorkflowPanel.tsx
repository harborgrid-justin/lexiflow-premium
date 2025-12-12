
import React, { useState } from 'react';
import { SLAMonitor } from './SLAMonitor';
import { AuditTrailViewer } from './AuditTrailViewer';
import { ParallelTasksManager } from './ParallelTasksManager';
import { TaskDependencyManager } from './TaskDependencyManager';
import { TimeTrackingPanel } from './TimeTrackingPanel';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import { Tabs } from '../common/Tabs';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

export const EnhancedWorkflowPanel: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'tasks' | 'dependencies' | 'approvals' | 'history'>('tasks');

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* KPI Monitor Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SLAMonitor />
        </div>
        <div>
          <TimeTrackingPanel />
        </div>
      </div>

      <div className={cn("rounded-lg border shadow-sm flex flex-col flex-1 overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b", theme.border.default)}>
          <Tabs 
            tabs={['tasks', 'dependencies', 'approvals', 'history']} 
            activeTab={activeTab} 
            onChange={(t) => setActiveTab(t as any)} 
          />
        </div>
        
        <div className={cn("p-6 overflow-y-auto flex-1", theme.surfaceHighlight)}>
          {activeTab === 'tasks' && <ParallelTasksManager />}
          {activeTab === 'dependencies' && <TaskDependencyManager />}
          {activeTab === 'approvals' && (
            <ApprovalWorkflow 
              onApprove={(id) => alert(`Approved ${id}`)} 
              onReject={(id) => alert(`Rejected ${id}`)} 
            />
          )}
          {activeTab === 'history' && <AuditTrailViewer />}
        </div>
      </div>
    </div>
  );
};
