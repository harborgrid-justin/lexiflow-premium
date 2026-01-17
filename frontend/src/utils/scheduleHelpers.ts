/**
 * @module utils/scheduleHelpers
 * @category Utils - Visualization
 * @description Schedule chart calculation utilities for task positioning and timeline generation. Provides
 * CSS positioning style calculation from task dates with pixelsPerDay scaling, default 5-day duration
 * fallback, and offscreen optimization. Generates timeline header dates with configurable step intervals.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Types
import type { WorkflowTask } from "@/types";

// ============================================================================
// HELPERS
// ============================================================================
export const ScheduleHelpers = {
  /**
   * Calculates CSS positioning style for a Gantt task bar.
   */
  getTaskStyle: (
    task: WorkflowTask,
    viewStartDate: Date,
    pixelsPerDay: number,
  ) => {
    if (!task.dueDate) {
      // Return default hidden style if no due date
      return { left: "0px", width: "20px", display: "none" as const };
    }
    const due = new Date(task.dueDate).getTime();
    let start;

    if (task.startDate) {
      start = new Date(task.startDate).getTime();
    } else {
      // Default to 5 days duration if no start date
      start = due - 5 * 24 * 60 * 60 * 1000;
    }

    const viewStart = viewStartDate.getTime();
    const durationMs = due - start;
    const durationDays = Math.max(1, durationMs / (1000 * 60 * 60 * 24));

    const left = ((start - viewStart) / (1000 * 60 * 60 * 24)) * pixelsPerDay;
    const width = durationDays * pixelsPerDay;

    return {
      left: `${Math.max(-100, left)}px`, // Allow slightly offscreen to left
      width: `${Math.max(20, width)}px`,
      display: left + width < 0 ? "none" : "flex", // Optimization
    };
  },

  /**
   * Generates dates for the timeline header
   */
  generateTimeScale: (viewStartDate: Date, days: number, step: number) => {
    const dates: { date: Date; label: string }[] = [];
    const now = new Date(viewStartDate);

    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i * step);
      dates.push({
        date: d,
        label: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      });
    }
    return dates;
  },
};
