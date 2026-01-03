/**
 * LitigationScheduleView.tsx
 *
 * Timeline visualization of the litigation strategy.
 * Transforms node-based graph data into a schedule chart format.
 *
 * @module components/litigation/LitigationScheduleView
 */

import React, { useState, useMemo, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';

// Internal Components
import { PlanningSidebar, ScheduleTimeline } from '@features/cases/components/detail/planning';

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils
import { cn } from '@/utils/cn';
import { Pathfinding } from '@/utils/pathfinding';

// Types
import { LitigationScheduleViewProps, ZoomLevel } from './types';
import { transformNodesToSchedule, calculatePixelsPerDay, calculateNodePositionFromDate } from './utils';

export const LitigationScheduleView: React.FC<LitigationScheduleViewProps> = ({ nodes, connections, updateNode, addNode }) => {
  const { theme } = useTheme();

  const [zoom, setZoom] = useState<ZoomLevel>('Month');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [viewStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [showCriticalPath, setShowCriticalPath] = useState(true);

  // Memoized transformation logic
  const { phases, tasks } = useMemo(() => transformNodesToSchedule(nodes, connections), [nodes, connections]);

  const pixelsPerDay = useMemo(() => calculatePixelsPerDay(zoom), [zoom]);

  // A* Critical Path Calculation
  const criticalPathIds = useMemo(() => {
      if (!showCriticalPath) return new Set<string>();
      return new Set(Pathfinding.findCriticalPath(tasks));
  }, [tasks, showCriticalPath]);

  const handleTaskUpdate = useCallback((taskId: string, start: string, _due: string) => {
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
        <div className="shrink-0">
          <PlanningSidebar
            phases={phases}
            tasks={tasks}
            collapsedPhases={collapsedPhases}
            activeTaskId={activeTaskId}
            onTogglePhase={togglePhase}
            onHoverTask={setActiveTaskId}
            onAddTask={handleAddTask}
          />
        </div>
        <div className="flex-1">
          <ScheduleTimeline
            phases={phases}
            tasks={tasks.map(t => ({ ...t, isCritical: criticalPathIds.has(t.id) }))}
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
    </div>
  );
};

export default LitigationScheduleView;
