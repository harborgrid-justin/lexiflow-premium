import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { DataService } from '@/services/data/dataService';

interface ScheduleTimelineProps {
  className?: string;
  caseId?: string;
}

interface TimelinePhase {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ className, caseId }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPhases = async () => {
      if (!caseId) return;
      setLoading(true);
      try {
        // Fetch case phases from backend
        const timelineData = await DataService.cases.getTimeline(caseId);
        if (Array.isArray(timelineData)) {
          // Adapt API response to UI model
          setPhases(timelineData.map((t) => ({
            id: t.id,
            title: t.title || t.type,
            startDate: t.date?.toString() || new Date().toISOString(),
            endDate: t.endDate?.toString() || new Date().toISOString(),
            isActive: t.status === 'ACTIVE'
          })));
        }
      } catch (err) {
        console.error("Failed to load timeline phases", err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a caseId context, otherwise component is idle/empty
    if (caseId) fetchPhases();
  }, [caseId]);

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-slate-950", className)}>
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <div className="w-48 p-3 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phase</span>
        </div>
        <div className="flex-1 flex">
          {months.map(m => (
            <div key={m} className="flex-1 p-3 border-r border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              {m} 2026
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="p-8 text-center text-slate-500 text-sm">Loading timeline...</div>
        )}

        {!loading && phases.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            {caseId ? "No timeline data available." : "Select a case to view timeline."}
          </div>
        )}

        {/* Render Actual Timeline Rows */}
        {!loading && phases.map((phase, i) => (
          <div key={phase.id} className="flex border-b border-slate-100 dark:border-slate-800 text-sm">
            <div className="w-48 p-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800">
              {phase.title}
            </div>
            <div className="flex-1 relative p-4">
              <div
                className={cn(
                  "absolute h-6 rounded-md border text-xs flex items-center px-2",
                  phase.isActive
                    ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                )}
                style={{
                  left: `${10 + (i * 15)}%`,
                  width: `${20 + (i * 5)}%`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                {phase.isActive ? 'Active Phase' : 'Scheduled'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
