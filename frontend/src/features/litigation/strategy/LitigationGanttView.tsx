
/**
 * LitigationGanttView.tsx
 * 
 * Timeline visualization of the litigation strategy.
 * Transforms node-based graph data into a Gantt chart format.
 * 
 * @module components/litigation/LitigationGanttView
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, TrendingUp } from 'lucide-react';

// Internal Components
import { PlanningSidebar } from '../../matters/detail/planning/PlanningSidebar';
import { GanttTimeline } from '../../matters/detail/planning/GanttTimeline';
import { Button } from '../../components/atoms/Button';

// Hooks & Context
import { useTheme } from '../../../providers/ThemeContext';

// Utils
import { cn } from '@/utils/cn';
import { Pathfinding } from '@/utils/pathfinding';

// Types
import { CasePhase, WorkflowTask, TaskId, CaseId } from '../../../types';
import { LitigationGanttViewProps, ZoomLevel } from './types';
import { transformNodesToGantt, calculatePixelsPerDay, calculateNodePositionFromDate } from './utils';

export const LitigationGanttView: React.FC<LitigationGanttViewProps> = ({ nodes, connections, updateNode, addNode }) => {
  const { theme } = useTheme();
  
  const [zoom, setZoom] = useState<ZoomLevel>('Month');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [viewStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [showCriticalPath, setShowCriticalPath] = useState(true);

  // Memoized transformation logic
  const { phases, tasks } = useMemo(() => transformNodesToGantt(nodes, connections), [nodes, connections]);

  const pixelsPerDay = useMemo(() => calculatePixelsPerDay(zoom), [zoom]);

  // A* Critical Path Calculation
  const criticalPathIds = useMemo(() => {
      if (!showCriticalPath) return new Set<string>();
      return new Set(Pathfinding.findCriticalPath(tasks));
  }, [tasks, showCriticalPath]);
  
  const handleTaskUpdate = useCallback((taskId: string, start: string, due: string) => {
    const newX = calculateNodePositionFromDate(start);
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
