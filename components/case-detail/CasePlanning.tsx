import React, { useState, useMemo } from 'react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { Case, CasePhase, WorkflowTask } from '../../types';
import { DataService } from '../../services/dataService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useNotify } from '../../hooks/useNotify';
import { TaskCreationModal } from '../common/TaskCreationModal';
import { PlanningSidebar } from './planning/PlanningSidebar';
import { GanttTimeline } from './planning/GanttTimeline';

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
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Set start date to 1 month ago for context
  const [viewStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));

  // Data Queries
  const { data: phases = [] } = useQuery<CasePhase[]>(
      [STORES.CASES, caseData.id, 'phases'], 
      () => DataService.phases.getByCaseId(caseData.id)
  );
  const { data: tasks = [] } = useQuery<WorkflowTask[]>(
      [STORES.TASKS, caseData.id], 
      () => DataService.tasks.getByCaseId(caseData.id)
  );
  
  const { mutate: updateTask } = useMutation(
      (task: WorkflowTask) => DataService.tasks.update(task.id, task), 
      { 
          invalidateKeys: [[STORES.TASKS, caseData.id]], 
          // Optimistic Update
          onSuccess: (updatedTask) => {
              const current = queryClient.getQueryState<WorkflowTask[]>([STORES.TASKS, caseData.id])?.data || [];
              const newTasks = current.map(t => t.id === updatedTask.id ? updatedTask : t);
              queryClient.setQueryData([STORES.TASKS, caseData.id], newTasks);
          }
      }
  );

  const pixelsPerDay = useMemo(() => {
      switch(zoom) {
          case 'Day': return 60;
          case 'Week': return 20;
          case 'Month': return 5;
          case 'Quarter': return 2;
          default: return 5;
      }
  }, [zoom]);

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
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          onSave={(task) => { notify.success("Task added"); setIsTaskModalOpen(false); }} 
      />

      <div className={cn("p-4 border-b flex flex-col md:flex-row gap-4 justify-between shrink-0", theme.surface, theme.border.default)}>
          <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-lg bg-indigo-50 border border-indigo-100")}>
                  <Layers className="h-5 w-5 text-indigo-600"/>
              </div>
              <div>
                  <h3 className={cn("text-lg font-bold", theme.text.primary)}>Master Case Plan</h3>
                  <p className={cn("text-xs", theme.text.secondary)}>{phases.length} Phases • {tasks.length} Tasks</p>
              </div>
          </div>
          
          <div className="flex items-center gap-2">
              <div className={cn("flex items-center bg-slate-100 p-1 rounded-lg border", theme.border.default)}>
                  {(['Quarter', 'Month', 'Week', 'Day'] as ZoomLevel[]).map(z => (
                      <button key={z} onClick={() => setZoom(z)} className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all", zoom === z ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}>
                          {z}
                      </button>
                  ))}
              </div>
              <Button variant="primary" icon={Plus} onClick={() => setIsTaskModalOpen(true)}>Add Task</Button>
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
              onAddTask={() => setIsTaskModalOpen(true)}
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