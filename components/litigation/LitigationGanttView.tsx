
import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PlanningSidebar } from '../case-detail/planning/PlanningSidebar';
import { GanttTimeline } from '../case-detail/planning/GanttTimeline';
import { WorkflowNode, NodeType, WorkflowConnection, Port } from '../workflow/builder/types';
import { CasePhase, WorkflowTask, TaskId, ProjectId, CaseId } from '../../types';
import { Button } from '../common/Button';
import { Plus } from 'lucide-react';

type ZoomLevel = 'Quarter' | 'Month' | 'Week' | 'Day';

// Define props interface for lifted state
interface LitigationGanttViewProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  addNode: (type: NodeType, x: number, y: number, label?: string) => string;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
}

export const LitigationGanttView: React.FC<LitigationGanttViewProps> = ({ nodes, updateNode, addNode }) => {
  const { theme } = useTheme();
  
  const [zoom, setZoom] = useState<ZoomLevel>('Month');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [viewStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));

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
      } else {
        const startOffsetDays = Math.max(0, Math.floor((node.x - minX) / 20)); // 20px per day
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + startOffsetDays);
        
        const durationDays = node.type === 'Decision' ? 14 : node.type === 'Event' ? 1 : 7;
        const dueDate = new Date(startDate);
        dueDate.setDate(startDate.getDate() + durationDays);
        
        ganttTasks.push({
          id: node.id as TaskId,
          caseId: 'strategy-plan' as CaseId,
          title: node.label,
          startDate: startDate.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'Pending',
          assignee: node.config.assignee || 'Unassigned',
          priority: 'Medium',
        });
      }
    });

    // Link tasks to phases by checking coordinates
    const phaseNodes = sortedNodes.filter(n => n.type === 'Phase');
    ganttTasks.forEach(task => {
        const node = sortedNodes.find(n => n.id === task.id);
        if (node) {
            const containingPhase = phaseNodes.find(p => 
                node.x >= p.x && node.x < p.x + 600 && // width of phase node
                node.y >= p.y && node.y < p.y + 400   // height of phase node
            );
            if (containingPhase) {
                task.projectId = containingPhase.id as ProjectId;
            }
        }
    });
    
    // Calculate phase start/end dates from tasks within them
    ganttPhases.forEach(phase => {
        const phaseTasks = ganttTasks.filter(t => t.projectId === phase.id);
        if (phaseTasks.length > 0) {
            const startDates = phaseTasks.map(t => new Date(t.startDate!).getTime());
            const endDates = phaseTasks.map(t => new Date(t.dueDate).getTime());
            phase.startDate = new Date(Math.min(...startDates)).toISOString().split('T')[0];
            const endDate = new Date(Math.max(...endDates));
            const duration = (endDate.getTime() - new Date(phase.startDate).getTime()) / (1000 * 3600 * 24);
            phase.duration = Math.max(1, Math.round(duration));
        } else {
            // Default for empty phases
            phase.startDate = new Date().toISOString().split('T')[0];
            phase.duration = 30;
        }
    });

    return { phases: ganttPhases, tasks: ganttTasks };
  }, [nodes]);

  const pixelsPerDay = useMemo(() => {
    switch(zoom) {
        case 'Day': return 60;
        case 'Week': return 20;
        case 'Month': return 5;
        case 'Quarter': return 2;
        default: return 5;
    }
  }, [zoom]);
  
  const handleTaskUpdate = useCallback((taskId: string, start: string, due: string) => {
    const today = new Date();
    const newStartDate = new Date(start);
    // Use viewStartDate to handle negative offsets correctly
    const startOffsetDays = (newStartDate.getTime() - viewStartDate.getTime()) / (1000 * 3600 * 24);
    
    // Reverse the calculation: map days back to x-coordinate
    const newX = 50 + startOffsetDays * 20; // 50 is base start, 20px per day
    
    updateNode(taskId, { x: newX });
  }, [nodes, updateNode, viewStartDate]);

  const togglePhase = (phaseId: string) => {
    setCollapsedPhases(prev => {
        const newSet = new Set(prev);
        if (newSet.has(phaseId)) newSet.delete(phaseId);
        else newSet.add(phaseId);
        return newSet;
    });
  };

  const handleAddTask = () => {
      // Adds a task to the canvas, which will then reflect in the Gantt
      addNode('Task', 100, 100, 'New Task');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className={cn("p-4 border-b shrink-0 flex items-center justify-between", theme.surface, theme.border.default)}>
        <h3 className="text-lg font-bold">Gantt Timeline View</h3>
        <div className="flex items-center gap-2">
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
          tasks={tasks}
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
