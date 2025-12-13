
import React, { useState, useEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useInterval } from '@/hooks/useInterval';

interface SLAItem {
  id: string;
  task: string;
  dueTime: number; // Timestamp
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

  const [slas, setSLAs] = useState<SLAItem[]>([]);

  // Initialize
  useEffect(() => {
      if (tasks.length > 0) {
          const items = tasks
            .filter(t => t.dueDate && t.status !== 'Done' && t.status !== 'Completed')
            .map(t => {
             const dueTime = new Date(t.dueDate).getTime();
             
             return {
                id: t.id,
                task: t.title,
                dueTime: dueTime,
                status: 'On Track' as const,
                progress: 0 // Will be calculated in tick
             };
          });
          setSLAs(items.slice(0, 10)); // Limit to 10 for display
      }
  }, [tasks]);

  // Real-time Tick
  useInterval(() => {
      setSLAs(prev => prev.map(sla => {
          const now = Date.now();
          // Assume 7 day SLA basis for visual bar if start date is unknown, 
          // or use a fixed window ending at due date.
          // For better visualization, let's assume a 5-day window ending at due date.
          const totalDuration = 5 * 24 * 60 * 60 * 1000; 
          const startTime = sla.dueTime - totalDuration;
          
          // Calculate percentages
          const elapsed = now - startTime;
          const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
          
          const msLeft = sla.dueTime - now;
          const hoursLeft = msLeft / (1000 * 60 * 60);
          
          let status: SLAItem['status'] = 'On Track';
          if (msLeft < 0) status = 'Breached';
          else if (hoursLeft < 24) status = 'At Risk';

          return { ...sla, progress, status };
      }));
  }, 1000); // Update every second

  const formatDeadline = (dueTime: number) => {
      const diff = dueTime - Date.now();
      if (diff < 0) return 'OVERDUE';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m ${secs}s`;
  };

  if (isLoading) return <div className="flex justify-center p-6"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className={cn("rounded-lg border p-4 shadow-sm", theme.surface.default, theme.border.default)}>
      <h3 className={cn("font-bold mb-4 flex items-center justify-between", theme.text.primary)}>
        <span className="flex items-center"><Clock className="h-5 w-5 mr-2 text-blue-600" /> SLA Live Monitor</span>
        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Live Tracking"></span>
      </h3>
      <div className="space-y-4">
        {slas.map(sla => (
          <div key={sla.id} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className={cn("font-medium truncate max-w-[200px]", theme.text.primary)}>{sla.task}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  sla.status === 'Breached' ? `${theme.status.error.bg} ${theme.status.error.text}` : 
                  sla.status === 'At Risk' ? `${theme.status.warning.bg} ${theme.status.warning.text}` : `${theme.status.success.bg} ${theme.status.success.text}`
                }`}>
                  {sla.status}
                </span>
                <span className={cn("text-xs font-mono w-20 text-right font-bold", sla.status === 'Breached' ? 'text-red-600' : theme.text.secondary)}>
                    {formatDeadline(sla.dueTime)}
                </span>
              </div>
            </div>
            <div className={cn("w-full rounded-full h-1.5 overflow-hidden", theme.surface.highlight)}>
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
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
