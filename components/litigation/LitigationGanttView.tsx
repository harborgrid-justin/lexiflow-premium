
import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PlanningSidebar } from '../case-detail/planning/PlanningSidebar';
import { GanttTimeline } from '../case-detail/planning/GanttTimeline';
import { WorkflowNode, NodeType, WorkflowConnection, Port } from '../workflow/builder/types';
import { CasePhase, WorkflowTask, TaskId, ProjectId, CaseId } from '../../types';
import { Button } from '../common/Button';
import { Plus, TrendingUp } from 'lucide-react';
import { Pathfinding } from '../../utils/pathfinding';

type ZoomLevel = 'Quarter' | 'Month' | 'Week' | 'Day';

// Define props interface for lifted state
interface LitigationGanttViewProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  addNode: (type: NodeType, x: number, y: number, label?: string) => string;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
}

export const LitigationGanttView: React.FC<LitigationGanttViewProps> = ({ nodes, connections, updateNode, addNode }) => {
  const { theme } = useTheme();
  
  const [zoom, setZoom] = useState<ZoomLevel>('Month');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [viewStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [showCriticalPath, setShowCriticalPath] = useState(true);

  // Memoized transformation logic
  const { phases, tasks } = useMemo(() => {
    const ganttPhases: CasePhase[] = [];
    const ganttTasks: WorkflowTask[] = [];

    if (nodes.length === 0) return { phases: [], tasks: [] };
    
    const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);
    const minX = sortedNodes.length > 0 ? Math.min(...sortedNodes.map(n => n.x)) : 0;
    const today = new Date();

    sortedNodes.forEach(node => {
      if (node.type === 'Phase') {
        ganttPhases.push({
          id: node.id,
          caseId: 'strategy-plan' as CaseId,
          name: node.label,
          startDate: '', // Will be calculated later
          duration: 0,   // Will be calculated later
          status: 'Active',
          color: 'bg-indigo-500'
        });
      } else if (node.type !== 'Comment' && node.type !== 'Start' && node.type !== 'End') {
        const startOffsetDays = Math.max(0, Math.floor((node.x - minX) / 20)); // 20px per day
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + startOffsetDays);
        
        const durationDays = node.type === 'Decision' ? 14 : node.type === 'Event' ? 1 : 7;
        const dueDate = new Date(startDate);
        dueDate.setDate(startDate.getDate() + durationDays);
        
        const dependencies = connections.filter(c => c.to === node.id).map(c => c.from as TaskId);

        ganttTasks.push({
          id: node.id as TaskId,
          caseId: 'strategy-plan' as CaseId,
          title: node.label,
          startDate: startDate.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'Pending',
          assignee: node.config.assignee || 'Unassigned',
          priority: 'Medium',
          dependencies
        });
      }
    });

    return { phases: ganttPhases, tasks: ganttTasks };
  }, [nodes, connections]);

  const pixelsPerDay = useMemo(() => {
    switch(zoom) {
        case 'Day': return 60;
        case 'Week': return 20;
        case 'Month': return 5;
        case 'Quarter': return 2;
        default: return 5;
    }
  }, [zoom]);

  // A* Critical Path Calculation
  const criticalPathIds = useMemo(() => {
      if (!showCriticalPath) return new Set<string>();
      return new Set(Pathfinding.findCriticalPath(tasks));
  }, [tasks, showCriticalPath]);
  
  const handleTaskUpdate = useCallback((taskId: string, start: string, due: string) => {
    const today = new Date();
    const newStartDate = new Date(start);
    const startOffsetDays = (newStartDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    
    const newX = 50 + startOffsetDays * 20;
    
    updateNode(taskId, { x: newX });
  }, [updateNode]);

  const togglePhase = (phaseId: string) => {
    setCollapsedPhases(prev => {
        const newSet = new Set(prev);
        if (newSet.has(phaseId)) newSet.delete(phaseId);
        else newSet.add(phaseId);
        return newSet;
    });
  };

  const handleAddTask = () => {
      addNode('Task', 100, 100, 'New Task');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className={cn("p-4 border-b shrink-0 flex items-center justify-between", theme.surface.default, theme.border.default)}>
        <h3 className="text-lg font-bold">Gantt Timeline View</h3>
        <div className="flex items-center gap-2">
           <button 
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={cn("flex items-center px-3 py-1.5 text-xs font-bold rounded-md border transition-all", showCriticalPath ? "bg-red-50 text-red-600 border-red-200" : cn(theme.surface.default, "text-slate-500"))}
            >
                <TrendingUp className="h-3 w-3 mr-1"/> Critical Path
            </button>
           <div className={cn("flex items-center bg-slate-100 p-1 rounded-lg border", theme.border.default)}>
              {(['Quarter', 'Month', 'Week', 'Day'] as ZoomLevel[]).map(z => (
                  <button key={z} onClick={() => setZoom(z)} className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all", zoom === z ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}>
                      {z}
                  </button>
              ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <PlanningSidebar 
          phases={phases}
          tasks={tasks}
          collapsedPhases={collapsedPhases}
          activeTaskId={activeTaskId}
          onTogglePhase={togglePhase}
          onHoverTask={setActiveTaskId}
          onAddTask={handleAddTask}
        />
        <GanttTimeline
          phases={phases}
          tasks={tasks.map(t => ({ ...t, isCritical: criticalPathIds.has(t.id) } as any))} 
          collapsedPhases={collapsedPhases}
          zoom={zoom}
          viewStartDate={viewStartDate}
          activeTaskId={activeTaskId}
          onHoverTask={setActiveTaskId}
          pixelsPerDay={pixelsPerDay}
          onUpdateTask={handleTaskUpdate}
        />
      </div>
    </div>
  );
};

export default LitigationGanttView;
