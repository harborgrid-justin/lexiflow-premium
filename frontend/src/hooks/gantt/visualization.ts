import type { TaskDependency, GanttTask } from './types';

/**
 * Get dependency path coordinates for visualization
 * 
 * This function calculates SVG arrow coordinates for Gantt chart dependency lines.
 * If DOM-based positioning is needed, the consuming component should provide
 * task element refs and calculate getBoundingClientRect() positions.
 * 
 * @param dependencyId - The dependency to visualize
 * @param dependencies - All dependencies
 * @param tasks - All Gantt tasks with positioning data
 * @param getTaskPosition - Optional callback to get task DOM position (x, y, width, height)
 * @returns Coordinates for dependency arrow start/end points, or null if not found
 */
export function getDependencyPath(
  dependencyId: string,
  dependencies: TaskDependency[],
  tasks?: GanttTask[],
  getTaskPosition?: (taskId: string) => { x: number; y: number; width: number; height: number } | null
): { start: { x: number; y: number }; end: { x: number; y: number } } | null {
  const dep = dependencies.find(d => d.id === dependencyId);
  if (!dep) return null;

  // If DOM position callback provided, use it for pixel-perfect coordinates
  if (getTaskPosition) {
    const fromPos = getTaskPosition(dep.fromTaskId);
    const toPos = getTaskPosition(dep.toTaskId);
    
    if (!fromPos || !toPos) return null;
    
    // Calculate connection points based on dependency type
    let startX: number, startY: number, endX: number, endY: number;
    
    switch (dep.type) {
      case 'finish-to-start':
        // From task right edge to target task left edge
        startX = fromPos.x + fromPos.width;
        startY = fromPos.y + fromPos.height / 2;
        endX = toPos.x;
        endY = toPos.y + toPos.height / 2;
        break;
        
      case 'start-to-start':
        // From task left edge to target task left edge
        startX = fromPos.x;
        startY = fromPos.y + fromPos.height / 2;
        endX = toPos.x;
        endY = toPos.y + toPos.height / 2;
        break;
        
      case 'finish-to-finish':
        // From task right edge to target task right edge
        startX = fromPos.x + fromPos.width;
        startY = fromPos.y + fromPos.height / 2;
        endX = toPos.x + toPos.width;
        endY = toPos.y + toPos.height / 2;
        break;
        
      case 'start-to-finish':
        // From task left edge to target task right edge
        startX = fromPos.x;
        startY = fromPos.y + fromPos.height / 2;
        endX = toPos.x + toPos.width;
        endY = toPos.y + toPos.height / 2;
        break;
        
      default:
        return null;
    }
    
    return {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    };
  }
  
  // Fallback: calculate from task data if available
  if (tasks) {
    const fromTask = tasks.find(t => t.id === dep.fromTaskId);
    const toTask = tasks.find(t => t.id === dep.toTaskId);
    
    if (!fromTask || !toTask) return null;
    
    // Use task scheduling data for relative positioning
    // This provides logical dependency connections without DOM coordinates
    const fromStart = new Date(fromTask.startDate).getTime();
    const fromEnd = new Date(fromTask.endDate).getTime();
    const toStart = new Date(toTask.startDate).getTime();
    const toEnd = new Date(toTask.endDate).getTime();
    
    // Calculate relative timeline positions (normalized 0-1000 scale)
    const timelineStart = Math.min(fromStart, toStart);
    const timelineEnd = Math.max(fromEnd, toEnd);
    const timelineSpan = timelineEnd - timelineStart || 1;
    
    const fromStartNorm = ((fromStart - timelineStart) / timelineSpan) * 1000;
    const fromEndNorm = ((fromEnd - timelineStart) / timelineSpan) * 1000;
    const toStartNorm = ((toStart - timelineStart) / timelineSpan) * 1000;
    const toEndNorm = ((toEnd - timelineStart) / timelineSpan) * 1000;
    
    // Position based on dependency type
    switch (dep.type) {
      case 'finish-to-start':
        return {
          start: { x: fromEndNorm, y: 0 },
          end: { x: toStartNorm, y: 0 }
        };
      case 'start-to-start':
        return {
          start: { x: fromStartNorm, y: 0 },
          end: { x: toStartNorm, y: 0 }
        };
      case 'finish-to-finish':
        return {
          start: { x: fromEndNorm, y: 0 },
          end: { x: toEndNorm, y: 0 }
        };
      case 'start-to-finish':
        return {
          start: { x: fromStartNorm, y: 0 },
          end: { x: toEndNorm, y: 0 }
        };
      default:
        return null;
    }
  }
  
  // No positioning data available
  return null;
}

/**
 * Get dependency color based on type and status
 */
export function getDependencyColor(
  dependencyId: string,
  dependencies: TaskDependency[],
  criticalPathIds: string[]
): string {
  const dep = dependencies.find(d => d.id === dependencyId);
  if (!dep) return '#94a3b8'; // slate-400

  const isCritical = criticalPathIds.includes(dep.fromTaskId) && 
                     criticalPathIds.includes(dep.toTaskId);

  if (isCritical) return '#ef4444'; // red-500

  switch (dep.type) {
    case 'finish-to-start':
      return '#3b82f6'; // blue-500
    case 'start-to-start':
      return '#10b981'; // green-500
    case 'finish-to-finish':
      return '#f59e0b'; // amber-500
    case 'start-to-finish':
      return '#8b5cf6'; // purple-500
    default:
      return '#94a3b8';
  }
}
