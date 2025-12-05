
import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

interface SLAItem {
  id: string;
  task: string;
  deadline: string;
  status: 'On Track' | 'At Risk' | 'Breached';
  progress: number;
}

export const SLAMonitor: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: tasks = [], isLoading } = useQuery(
      [STORES.TASKS, 'all'],
      DataService.tasks.getAll
  );

  // Derived State
  const slas: SLAItem[] = React.useMemo(() => {
      return tasks.slice(0, 5).map(t => {
          const due = new Date(t.dueDate).getTime();
          const now = Date.now();
          const diffHours = (due - now) / (1000 * 60 * 60);
          
          let status: SLAItem['status'] = 'On Track';
          let progress = 50;

          if (diffHours < 0) {
              status = 'Breached';
              progress = 100;
          } else if (diffHours < 24) {
              status = 'At Risk';
              progress = 85;
          } else {
              progress = 30;
          }

          return {
              id: t.id,
              task: t.title,
              deadline: diffHours < 0 ? 'Overdue' : `${Math.ceil(diffHours / 24)} days`,
              status,
              progress
          };
      });
  }, [tasks]);

  if (isLoading) return <div className="flex justify-center p-6"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className={cn("rounded-lg border p-4 shadow-sm", theme.surface, theme.border.default)}>
      <h3 className={cn("font-bold mb-4 flex items-center", theme.text.primary)}>
        <Clock className="h-5 w-5 mr-2 text-blue-600" /> SLA Monitor
      </h3>
      <div className="space-y-4">
        {slas.map(sla => (
          <div key={sla.id} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className={cn("font-medium truncate max-w-[200px]", theme.text.primary)}>{sla.task}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  sla.status === 'Breached' ? `${theme.status.error.bg} ${theme.status.error.text}` : 
                  sla.status === 'At Risk' ? `${theme.status.warning.bg} ${theme.status.warning.text}` : `${theme.status.success.bg} ${theme.status.success.text}`
                }`}>
                  {sla.status}
                </span>
                <span className={cn("text-xs font-mono", theme.text.secondary)}>{sla.deadline}</span>
              </div>
            </div>
            <div className={cn("w-full rounded-full h-1.5 overflow-hidden", theme.surfaceHighlight)}>
              <div 
                className={`h-full rounded-full ${
                  sla.status === 'Breached' ? 'bg-red-500' : 
                  sla.status === 'At Risk' ? 'bg-amber-500' : 'bg-green-500'
                }`} 
                style={{ width: `${sla.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
        {slas.length === 0 && <div className="text-center text-xs text-slate-400 py-4">No active SLAs being tracked.</div>}
      </div>
    </div>
  );
};
