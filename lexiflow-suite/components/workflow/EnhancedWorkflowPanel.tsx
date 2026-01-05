
import React, { useState, useTransition } from 'react';
import { SLAMonitor } from './SLAMonitor.tsx';
import { AuditTrailViewer } from './AuditTrailViewer.tsx';
import { ParallelTasksManager } from './ParallelTasksManager.tsx';
import { TaskDependencyManager } from './TaskDependencyManager.tsx';
import { TimeTrackingPanel } from './TimeTrackingPanel.tsx';
import { ApprovalWorkflow } from './ApprovalWorkflow.tsx';
import { Tabs } from '../common/Tabs.tsx';

export const EnhancedWorkflowPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'dependencies' | 'approvals' | 'history'>('tasks');
  // Guideline 3: Transition for tab switching
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (t: string) => {
    startTransition(() => {
        setActiveTab(t as any);
    });
  };

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

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <Tabs 
            tabs={['tasks', 'dependencies', 'approvals', 'history']} 
            activeTab={activeTab} 
            onChange={handleTabChange} 
          />
        </div>
        
        <div className={`p-6 overflow-y-auto flex-1 bg-slate-50 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
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
