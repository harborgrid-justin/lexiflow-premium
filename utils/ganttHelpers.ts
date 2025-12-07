
import { WorkflowTask } from '../types';

export const GanttHelpers = {
    /**
     * Calculates CSS positioning style for a Gantt task bar.
     */
    getTaskStyle: (task: WorkflowTask, viewStartDate: Date, pixelsPerDay: number) => {
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
    },

    /**
     * Generates dates for the timeline header
     */
    generateTimeScale: (viewStartDate: Date, days: number, step: number) => {
        const dates: { date: Date, label: string }[] = [];
        const now = new Date(viewStartDate);
        
        for(let i=0; i < days; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() + i * step);
            dates.push({
                date: d,
                label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            });
        }
        return dates;
    }
};
