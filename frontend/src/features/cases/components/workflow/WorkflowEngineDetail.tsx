
import React, { useState } from 'react';
import { ArrowLeft, Settings, Play, Pause, AlertTriangle, CheckCircle, GitBranch, Clock, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/atoms';
import { Card } from '@/components/molecules';
import { Badge } from '@/components/atoms';
import { MetricCard } from '@/components/molecules';
import { TaskDependencyManager } from './TaskDependencyManager';
import { ParallelTasksManager } from './ParallelTasksManager';
import { SLAMonitor } from './SLAMonitor';
import { AuditTrailViewer } from './AuditTrailViewer';
import { Tabs } from '@/components/molecules';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useNotify } from '@/hooks/useNotify';
import { DataService } from '@/services';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { ErrorState } from '@/components/molecules';

interface EngineDetails {
  id: string;
  type: 'case' | 'process';
  status: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  nextDeadline: string;
  automationRate: string;
}

interface WorkflowEngineDetailProps {
  id: string;
  type: 'case' | 'process';
  onBack: () => void;
}

export const WorkflowEngineDetail: React.FC<WorkflowEngineDetailProps> = ({ id, type, onBack }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [activeTab, setActiveTab] = useState<'visualizer' | 'tasks' | 'audit' | 'settings'>('visualizer');
  
  const { data: engineData, isLoading, isError, refetch } = useQuery<EngineDetails>(
    queryKeys.workflows.engineDetail(id),
    () => DataService.workflow.getEngineDetails(id, type)
  );

  const [status, setStatus] = useState('Active');

  const handleRebalance = () => {
      // Simulation
      notify.info("Running resource optimization algorithm...");
      setTimeout(() => {
          notify.success("Resources rebalanced. Bottleneck resolved.");
      }, 1500);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !engineData) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <ErrorState 
          title="Workflow Engine Error" 
          message="Could not load workflow engine details."
          onRetry={refetch}
        />
        <Button variant="ghost" onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in min-h-0">
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={cn("p-2 rounded-full transition-colors border border-transparent", theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.border.default}`)}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className={cn("text-xl font-bold", theme.text.primary)}>{type === 'case' ? `Case Workflow: ${id}` : `Process: ${id}`}</h2>
              <Badge variant={status === 'Active' ? 'success' : 'warning'}>{status}</Badge>
            </div>
            <div className={cn("flex items-center gap-3 mt-1 text-xs", theme.text.secondary)}>
                <span className={cn("font-mono px-1.5 py-0.5 rounded", theme.surface.highlight)}>ID: {id}</span>
                <span>•</span>
                <span>Engine v2.5</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {status === 'Active' ? (
            <Button variant="secondary" icon={Pause} onClick={() => setStatus('Paused')}>Pause</Button>
          ) : (
            <Button variant="primary" icon={Play} onClick={() => setStatus('Active')}>Resume</Button>
          )}
          <Button variant="outline" icon={Settings}>Configure</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <MetricCard label="Current Stage" value="In Progress" icon={GitBranch} className="border-l-4 border-l-blue-500"/>
        <MetricCard label="Next Deadline" value={engineData.nextDeadline} icon={Clock} className="border-l-4 border-l-amber-500" trend="Critical Path"/>
        <MetricCard label="Tasks Complete" value={`${engineData.tasksCompleted} / ${engineData.tasksTotal}`} icon={CheckCircle} className="border-l-4 border-l-green-500" trend={`${engineData.progress}%`}/>
        <MetricCard label="Automation Rate" value={engineData.automationRate} icon={Settings} className="border-l-4 border-l-purple-500" trendUp={true} trend="+5%"/>
      </div>

      {/* Main Content Area */}
      <div className={cn("flex-1 rounded-lg shadow-sm border flex flex-col overflow-hidden min-h-0", theme.surface.default, theme.border.default)}>
        <div className={cn("border-b px-4 pt-2", theme.border.default)}>
          <Tabs 
            tabs={['visualizer', 'tasks', 'audit', 'settings']} 
            activeTab={activeTab} 
            onChange={(t) => setActiveTab(t as any)} 
            variant="underline"
            className="border-none"
          />
        </div>
        
        <div className={cn("flex-1 overflow-y-auto p-6", theme.surface.highlight)}>
          {activeTab === 'visualizer' && (
            <div className="space-y-6">
              <div className={cn("p-6 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                 <h3 className={cn("font-bold mb-4", theme.text.primary)}>Dependency Graph</h3>
                 <TaskDependencyManager />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SLAMonitor />
                <Card title="Bottleneck Analysis">
                  <div className={cn("p-4 text-sm", theme.text.secondary)}>
                    <div className={cn("flex items-center gap-2 mb-2 font-bold p-2 rounded border", theme.status.warning.text, theme.status.warning.bg, theme.status.warning.border)}>
                      <AlertTriangle className="h-4 w-4"/> Potential Bottleneck Detected
                    </div>
                    <p className="leading-relaxed">Stage <strong>"Document Review"</strong> is taking <span className="text-red-600 font-bold">40% longer</span> than average. Consider reallocating resources from "Intake Team".</p>
                    <Button size="sm" variant="outline" className="mt-4 w-full" onClick={handleRebalance}>Auto-Rebalance Resources</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && <ParallelTasksManager />}
          
          {activeTab === 'audit' && <AuditTrailViewer />}

          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <Card title="Workflow Configuration">
                <div className={cn("divide-y", theme.border.default)}>
                  <div className={cn("flex items-center justify-between p-4 transition-colors", `hover:${theme.surface.highlight}`)}>
                    <div>
                      <p className={cn("font-bold text-sm", theme.text.primary)}>Strict Dependency Enforcement</p>
                      <p className={cn("text-xs", theme.text.secondary)}>Prevents starting tasks before prerequisites are met.</p>
                    </div>
                    <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div></div>
                  </div>
                  <div className={cn("flex items-center justify-between p-4 transition-colors", `hover:${theme.surface.highlight}`)}>
                    <div>
                      <p className={cn("font-bold text-sm", theme.text.primary)}>Auto-Assign Reviewers</p>
                      <p className={cn("text-xs", theme.text.secondary)}>Based on current team load balancing algorithm.</p>
                    </div>
                    <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div></div>
                  </div>
                  <div className={cn("flex items-center justify-between p-4 transition-colors", `hover:${theme.surface.highlight}`)}>
                    <div>
                      <p className={cn("font-bold text-sm", theme.text.primary)}>SLA Breach Notifications</p>
                      <p className={cn("text-xs", theme.text.secondary)}>Email partners immediately when critical path is delayed.</p>
                    </div>
                    <div className={cn("h-6 w-11 rounded-full relative cursor-pointer", theme.border.default, theme.surface.highlight)}><div className={cn("absolute left-1 top-1 h-4 w-4 rounded-full shadow-sm", theme.surface.default)}></div></div>
                  </div>
                </div>
              </Card>
              <div className={cn("flex justify-end p-4 rounded-lg border items-center justify-between", theme.status.error.bg, theme.status.error.border)}>
                <span className={cn("text-xs font-bold uppercase", theme.status.error.text)}>Danger Zone</span>
                <Button variant="danger" size="sm">Terminate Workflow</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

