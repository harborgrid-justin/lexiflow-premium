import type { GanttTask, TaskDependency, CriticalPath } from './types';

/**
 * Topological sort for task ordering
 */
export function topologicalSort(tasks: GanttTask[], dependencies: TaskDependency[]): GanttTask[] {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();
  
  tasks.forEach(task => {
    inDegree.set(task.id, 0);
    adjList.set(task.id, []);
  });
  
  dependencies.forEach(dep => {
    adjList.get(dep.fromTaskId)?.push(dep.toTaskId);
    inDegree.set(dep.toTaskId, (inDegree.get(dep.toTaskId) || 0) + 1);
  });
  
  const queue: string[] = [];
  inDegree.forEach((degree, taskId) => {
    if (degree === 0) queue.push(taskId);
  });
  
  const sorted: GanttTask[] = [];
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  
  while (queue.length > 0) {
    const taskId = queue.shift()!;
    const task = taskMap.get(taskId);
    if (task) sorted.push(task);
    
    adjList.get(taskId)?.forEach(nextId => {
      const degree = inDegree.get(nextId)! - 1;
      inDegree.set(nextId, degree);
      if (degree === 0) queue.push(nextId);
    });
  }
  
  return sorted;
}

/**
 * Calculate critical path using CPM algorithm
 */
export function calculateCriticalPath(
  tasks: GanttTask[],
  dependencies: TaskDependency[],
  _taskMap: Map<string, GanttTask>
): CriticalPath | null {
  if (tasks.length === 0) return null;

  const earlyStart = new Map<string, number>();
  const earlyFinish = new Map<string, number>();
  const lateStart = new Map<string, number>();
  const lateFinish = new Map<string, number>();

  // Forward pass
  const sortedTasks = topologicalSort(tasks, dependencies);
  
  sortedTasks.forEach(task => {
    const predecessors = dependencies.filter(d => d.toTaskId === task.id);
    
    if (predecessors.length === 0) {
      earlyStart.set(task.id, 0);
    } else {
      const maxFinish = Math.max(...predecessors.map(dep => {
        const predFinish = earlyFinish.get(dep.fromTaskId) || 0;
        const lag = dep.lagDays || 0;
        
        switch (dep.type) {
          case 'finish-to-start':
            return predFinish + lag;
          case 'start-to-start':
            return (earlyStart.get(dep.fromTaskId) || 0) + lag;
          case 'finish-to-finish':
            return predFinish - task.duration + lag;
          case 'start-to-finish':
            return (earlyStart.get(dep.fromTaskId) || 0) - task.duration + lag;
          default:
            return predFinish;
        }
      }));
      
      earlyStart.set(task.id, maxFinish);
    }
    
    earlyFinish.set(task.id, (earlyStart.get(task.id) || 0) + task.duration);
  });

  // Backward pass
  const projectDuration = Math.max(...Array.from(earlyFinish.values()));
  
  sortedTasks.reverse().forEach(task => {
    const successors = dependencies.filter(d => d.fromTaskId === task.id);
    
    if (successors.length === 0) {
      lateFinish.set(task.id, projectDuration);
    } else {
      const minStart = Math.min(...successors.map(dep => {
        const succStart = lateStart.get(dep.toTaskId) || projectDuration;
        const lag = dep.lagDays || 0;
        return succStart - lag;
      }));
      
      lateFinish.set(task.id, minStart);
    }
    
    lateStart.set(task.id, (lateFinish.get(task.id) || 0) - task.duration);
  });

  // Calculate slack and identify critical path
  const slackTime = new Map<string, number>();
  const criticalTaskIds: string[] = [];
  
  tasks.forEach(task => {
    const slack = (lateStart.get(task.id) || 0) - (earlyStart.get(task.id) || 0);
    slackTime.set(task.id, slack);
    
    if (slack === 0) {
      criticalTaskIds.push(task.id);
    }
  });

  return {
    taskIds: criticalTaskIds,
    totalDuration: projectDuration,
    slackTime
  };
}
