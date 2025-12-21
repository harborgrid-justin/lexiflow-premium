import type { GanttTask, TaskDependency } from './types';

/**
 * Get dependent tasks (successors)
 */
export function getDependentTasks(
  taskId: string,
  dependencies: TaskDependency[],
  type: 'direct' | 'all' = 'direct'
): string[] {
  if (type === 'direct') {
    return dependencies
      .filter(d => d.fromTaskId === taskId)
      .map(d => d.toTaskId);
  }

  // BFS for all descendants
  const result: string[] = [];
  const queue = [taskId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    
    visited.add(current);
    
    const directDeps = dependencies
      .filter(d => d.fromTaskId === current)
      .map(d => d.toTaskId);
    
    result.push(...directDeps.filter(id => !visited.has(id)));
    queue.push(...directDeps);
  }

  return result;
}

/**
 * Get predecessor tasks
 */
export function getPredecessorTasks(
  taskId: string,
  dependencies: TaskDependency[],
  type: 'direct' | 'all' = 'direct'
): string[] {
  if (type === 'direct') {
    return dependencies
      .filter(d => d.toTaskId === taskId)
      .map(d => d.fromTaskId);
  }

  // BFS for all ancestors
  const result: string[] = [];
  const queue = [taskId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    
    visited.add(current);
    
    const directPreds = dependencies
      .filter(d => d.toTaskId === current)
      .map(d => d.fromTaskId);
    
    result.push(...directPreds.filter(id => !visited.has(id)));
    queue.push(...directPreds);
  }

  return result;
}

/**
 * Cascade task date updates through dependencies
 */
export function cascadeTaskUpdate(
  taskId: string,
  newEndDate: Date,
  taskMap: Map<string, GanttTask>,
  dependencies: TaskDependency[]
): Map<string, Date> {
  const updates = new Map<string, Date>();
  const task = taskMap.get(taskId);
  if (!task) return updates;

  const dateShift = newEndDate.getTime() - task.endDate.getTime();
  if (dateShift === 0) return updates;

  const dependentTaskIds = getDependentTasks(taskId, dependencies, 'all');
  
  dependentTaskIds.forEach(depId => {
    const depTask = taskMap.get(depId);
    if (depTask) {
      const newDepEndDate = new Date(depTask.endDate.getTime() + dateShift);
      updates.set(depId, newDepEndDate);
    }
  });

  return updates;
}
