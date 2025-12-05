
import React, { useRef } from 'react';
import { WorkflowTask, CasePhase } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useWindow } from '../../../context/WindowContext';
import { Badge } from '../../common/Badge';
import { useGanttDrag } from '../../../hooks/useGanttDrag';

interface GanttTimelineProps {
  phases: CasePhase[];
  tasks: WorkflowTask[];
  collapsedPhases: Set<string>;
  zoom: 'Quarter' | 'Month' | 'Week' | 'Day';
  viewStartDate: Date;
  activeTaskId: string | null;
  onHoverTask: (id: string | null) => void;
  pixelsPerDay: number;
  onUpdateTask: (taskId: string, start: string, due: string) => void;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  phases, tasks, collapsedPhases, zoom, viewStartDate, activeTaskId, onHoverTask, pixelsPerDay, onUpdateTask
}) => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();
  const timelineRef = useRef<HTMLDivElement>(null);

  const { onMouseDown } = useGanttDrag({ 
      pixelsPerDay, 
      tasks, 
      onTaskUpdate: onUpdateTask 
  });

  const getTaskStyle = (task: WorkflowTask) => {
      const due = new Date(task.dueDate).getTime();
      let start;
      
      if (task.startDate) {
          start = new Date(task.startDate).getTime();
      } else {
          // Default to 5 days duration if no start date
          start = due - (5 * 24 * 60 * 60 * 1000);
      }

      const viewStart = viewStartDate.getTime();
      const durationMs = due - start;
      const durationDays = Math.max(1, durationMs / (1000 * 60 * 60 * 24));

      const left = (start - viewStart) / (1000 * 60 * 60 * 24) * pixelsPerDay;
      const width = durationDays * pixelsPerDay;

      return { 
          left: `${Math.max(-100, left)}px`, // Allow slightly offscreen to left
          width: `${Math.max(20, width)}px`,
          display: (left + width < 0) ? 'none' : 'flex' // Optimization
      };
  };

  const renderTimeScale = () => {
      const days = [];
      const now = new Date(viewStartDate);
      // Render 90 days buffer
      for(let i=0; i < 90; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() + i * (zoom === 'Month' ? 30 : 7));
          days.push(
              <div 
                key={i} 
                className={cn("border-r text-[10px] font-bold uppercase p-2 flex-shrink-0 text-slate-400 select-none", theme.border.default)}
                style={{ width: pixelsPerDay * (zoom === 'Month' ? 30 : 7) }}
              >
                  {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
          );
      }
      return <div className="flex h-8 border-b">{days}</div>;
  };

  return (
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative" ref={timelineRef}>
          <div className="flex-1 overflow-auto custom-scrollbar relative">
              <div className="sticky top-0 z-20 bg-slate-50 border-b shadow-sm min-w-max">
                  {renderTimeScale()}
              </div>
              
              <div className="relative min-w-max pb-20">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none z-0 flex">
                      {Array.from({length: 90}).map((_, i) => (
                          <div key={i} className={cn("border-r h-full", theme.border.light)} style={{ width: pixelsPerDay * (zoom === 'Month' ? 30 : 7) }} />
                      ))}
                      {/* Today Line */}
                      <div className="absolute top-0 bottom-0 w-px bg-red-500 z-10" style={{ left: `${((new Date().getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay}px` }}>
                          <div className="bg-red-500 text-white text-[9px] px-1 rounded absolute -top-1 -translate-x-1/2">Today</div>
                      </div>
                  </div>

                  {phases.map((phase) => {
                      if (collapsedPhases.has(phase.id)) return null;
                      return (
                          <div key={phase.id} className="relative mt-2">
                              {/* Phase Row Background */}
                              <div className="h-10 sticky left-0 right-0"></div> 
                              
                              {/* Tasks */}
                              {tasks.filter(t => true).slice(0, 10).map((task) => (
                                  <div 
                                    key={task.id} 
                                    className={cn("h-10 relative flex items-center hover:bg-black/5 transition-colors", activeTaskId === task.id && "bg-blue-50/50")}
                                  >
                                      <div 
                                          className={cn(
                                              "absolute h-6 rounded-full border shadow-sm flex items-center px-2 text-xs font-bold text-white cursor-pointer select-none group overflow-hidden",
                                              task.status === 'Done' ? "bg-slate-400 border-slate-500" :
                                              task.priority === 'High' ? "bg-red-500 border-red-600" :
                                              "bg-blue-500 border-blue-600"
                                          )}
                                          style={getTaskStyle(task)}
                                          onMouseDown={(e) => onMouseDown(e, task.id, 'move')}
                                          onMouseEnter={() => onHoverTask(task.id)}
                                          onMouseLeave={() => onHoverTask(null)}
                                          onClick={(e) => {
                                              if (e.defaultPrevented) return; // Don't open if dragged
                                              openWindow(`task-${task.id}`, `Task: ${task.title}`, <div className="p-6 bg-white h-full"><h2 className="text-xl font-bold mb-2">{task.title}</h2><p className="text-slate-600 mb-4">{task.description}</p><Badge variant="neutral">{task.status}</Badge></div>)
                                          }}
                                      >
                                          <span className="truncate drop-shadow-md z-10 pr-2">{task.title}</span>
                                          
                                          {/* Drag Overlay */}
                                          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                                          
                                          {/* Resize Handles */}
                                          <div 
                                            className="absolute left-0 top-0 bottom-0 w-3 cursor-w-resize hover:bg-black/20 z-20" 
                                            onMouseDown={(e) => onMouseDown(e, task.id, 'resize-left')}
                                          ></div>
                                          <div 
                                            className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize hover:bg-black/20 z-20" 
                                            onMouseDown={(e) => onMouseDown(e, task.id, 'resize-right')}
                                          ></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>
  );
};
