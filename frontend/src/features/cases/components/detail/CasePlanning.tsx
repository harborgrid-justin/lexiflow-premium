/**
 * CasePlanning.tsx
 *
 * Gantt-style case planning interface with phase management, task dependencies,
 * zoom controls, and critical path analysis.
 *
 * @module components/case-detail/CasePlanning
 * @category Case Management - Planning & Gantt
 */

// External Dependencies
import { Layers, Plus, TrendingUp } from 'lucide-react';
import React, { useMemo, useState } from 'react';

// Internal Dependencies - Components
import { TaskCreationModal } from '@/features/cases/ui/components/TaskCreationModal/TaskCreationModal';
import { Button } from '@/shared/ui/atoms/Button';
import { PlanningSidebar } from './planning/PlanningSidebar';
import { ScheduleTimeline } from './planning/ScheduleTimeline';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/features/theme';
import { useCasePlanning } from '@/features/cases/hooks/useCasePlanning';
import { useModalState } from '@/hooks/core';
import { useNotify } from '@/hooks/useNotify';

// Internal Dependencies - Services & Utils
import { cn } from '@/shared/lib/cn';
import { Pathfinding } from '@/utils/pathfinding';

// Types & Interfaces
import { Case } from '@/types';

interface CasePlanningProps {
    caseData: Case;
}

type ZoomLevel = 'Quarter' | 'Month' | 'Week' | 'Day';

export const CasePlanning: React.FC<CasePlanningProps> = ({ caseData }) => {
    const { theme } = useTheme();
    const notify = useNotify();

    const [zoom, setZoom] = useState<ZoomLevel>('Month');
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
    const taskModal = useModalState();
    const [showCriticalPath, setShowCriticalPath] = useState(false);

    // Set start date to 1 month ago for context
    const [viewStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));

    // Data Queries
    const { phases, tasks, updateTask } = useCasePlanning(caseData.id);

    const pixelsPerDay = useMemo(() => {
        switch (zoom) {
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

    const handleTaskUpdate = (taskId: string, startDate: string, dueDate: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            updateTask({ ...task, startDate, dueDate });
        }
    };

    const togglePhase = (phaseId: string) => {
        const newSet = new Set(collapsedPhases);
        if (newSet.has(phaseId)) newSet.delete(phaseId);
        else newSet.add(phaseId);
        setCollapsedPhases(newSet);
    };

    return (
        <div className={cn("h-full flex flex-col overflow-hidden animate-fade-in", theme.background)}>
            <TaskCreationModal
                isOpen={taskModal.isOpen}
                onClose={() => taskModal.close()}
                onSave={() => { notify.success("Task added"); taskModal.close(); }}
            />

            <div className={cn("p-4 border-b flex flex-col md:flex-row gap-4 justify-between shrink-0", theme.surface.default, theme.border.default)}>
                <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg bg-indigo-50 border border-indigo-100")}>
                        <Layers className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className={cn("text-lg font-bold", theme.text.primary)}>Master Case Plan</h3>
                        <p className={cn("text-xs", theme.text.secondary)}>{phases.length} Phases • {tasks.length} Tasks</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowCriticalPath(!showCriticalPath)}
                        className={cn("flex items-center px-3 py-1.5 text-xs font-bold rounded-md border transition-all", showCriticalPath ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-500")}
                    >
                        <TrendingUp className="h-3 w-3 mr-1" /> Critical Path
                    </button>
                    <div className={cn("flex items-center bg-slate-100 p-1 rounded-lg border", theme.border.default)}>
                        {(['Quarter', 'Month', 'Week', 'Day'] as ZoomLevel[]).map(z => (
                            <button key={z} onClick={() => setZoom(z)} className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all", zoom === z ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}>
                                {z}
                            </button>
                        ))}
                    </div>
                    <Button variant="primary" icon={Plus} onClick={() => taskModal.open()}>Add Task</Button>
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
                    onAddTask={() => taskModal.open()}
                />
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
    );
};
