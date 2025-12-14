/**
 * @module hooks/useGanttDependencies
 * @category Hooks
 * @description Manages Gantt chart dependencies with critical path calculation and cascade updates.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Dependency types in Gantt charts
 */
export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

/**
 * Task dependency definition
 */
export interface TaskDependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
  lagDays?: number; // Optional lag/lead time in days (negative for lead)
}

/**
 * Task definition with scheduling information
 */
export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number; // Duration in days
  progress: number; // 0-100
  isMilestone?: boolean;
  isOnCriticalPath?: boolean;
}

/**
 * Dependency validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Critical path calculation result
 */
export interface CriticalPath {
  taskIds: string[];
  totalDuration: number;
  slackTime: Map<string, number>; // Task ID -> slack time in days
}

/**
 * Hook return type
 */
export interface UseGanttDependenciesReturn {
  dependencies: TaskDependency[];
  criticalPath: CriticalPath | null;
  
  // Dependency management
  addDependency: (dependency: Omit<TaskDependency, 'id'>) => string;
  removeDependency: (id: string) => void;
  updateDependency: (id: string, updates: Partial<TaskDependency>) => void;
  
  // Validation
  validateDependency: (dependency: Omit<TaskDependency, 'id'>) => ValidationResult;
  hasCircularDependency: (fromTaskId: string, toTaskId: string) => boolean;
  
  // Critical path
  calculateCriticalPath: () => CriticalPath | null;
  isTaskOnCriticalPath: (taskId: string) => boolean;
  getTaskSlack: (taskId: string) => number;
  
  // Cascade updates
  cascadeTaskUpdate: (taskId: string, newEndDate: Date) => Map<string, Date>;
  getDependentTasks: (taskId: string, type?: 'direct' | 'all') => string[];
  getPredecessorTasks: (taskId: string, type?: 'direct' | 'all') => string[];
  
  // Visualization helpers
  getDependencyPath: (dependencyId: string) => { start: { x: number; y: number }; end: { x: number; y: number } } | null;
  getDependencyColor: (dependencyId: string) => string;
}

/**
 * Hook for managing Gantt chart dependencies
 * 
 * @param tasks - Array of Gantt tasks
 * @param initialDependencies - Initial dependencies
 * @returns Dependency management utilities
 * 
 * @example
 * ```tsx
 * const { 
 *   addDependency, 
 *   criticalPath,
 *   cascadeTaskUpdate 
 * } = useGanttDependencies(tasks);
 * 
 * // Add finish-to-start dependency
 * addDependency({
 *   fromTaskId: 'task-1',
 *   toTaskId: 'task-2',
 *   type: 'finish-to-start'
 * });
 * 
 * // Update task and cascade changes
 * const updates = cascadeTaskUpdate('task-1', new Date('2024-02-15'));
 * ```
 */
export function useGanttDependencies(
  tasks: GanttTask[],
  initialDependencies: TaskDependency[] = []
): UseGanttDependenciesReturn {
  const [dependencies, setDependencies] = useState<TaskDependency[]>(initialDependencies);
  const [criticalPath, setCriticalPath] = useState<CriticalPath | null>(null);

  // Task lookup map
  const taskMap = useMemo(() => {
    const map = new Map<string, GanttTask>();
    tasks.forEach(task => map.set(task.id, task));
    return map;
  }, [tasks]);

  /**
   * Check for circular dependencies using DFS
   */
  const hasCircularDependency = useCallback((fromTaskId: string, toTaskId: string): boolean => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (currentId: string): boolean => {
      if (recursionStack.has(currentId)) return true;
      if (visited.has(currentId)) return false;

      visited.add(currentId);
      recursionStack.add(currentId);

      // Check all dependencies where current task is the source
      const outgoingDeps = dependencies.filter(dep => dep.fromTaskId === currentId);
      
      for (const dep of outgoingDeps) {
        if (dep.toTaskId === toTaskId || dfs(dep.toTaskId)) {
          return true;
        }
      }

      recursionStack.delete(currentId);
      return false;
    };

    // Simulate adding the new dependency
    return dfs(toTaskId);
  }, [dependencies]);

  /**
   * Validate a dependency
   */
  const validateDependency = useCallback((dependency: Omit<TaskDependency, 'id'>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if tasks exist
    if (!taskMap.has(dependency.fromTaskId)) {
      errors.push(`Source task ${dependency.fromTaskId} does not exist`);
    }
    if (!taskMap.has(dependency.toTaskId)) {
      errors.push(`Target task ${dependency.toTaskId} does not exist`);
    }

    // Check for self-dependency
    if (dependency.fromTaskId === dependency.toTaskId) {
      errors.push('Task cannot depend on itself');
    }

    // Check for circular dependencies
    if (hasCircularDependency(dependency.fromTaskId, dependency.toTaskId)) {
      errors.push('This dependency would create a circular dependency');
    }

    // Check for duplicate dependencies
    const duplicate = dependencies.find(
      d => d.fromTaskId === dependency.fromTaskId && 
           d.toTaskId === dependency.toTaskId &&
           d.type === dependency.type
    );
    if (duplicate) {
      warnings.push('A similar dependency already exists');
    }

    // Check for milestone dependencies
    const fromTask = taskMap.get(dependency.fromTaskId);
    const toTask = taskMap.get(dependency.toTaskId);
    
    if (fromTask?.isMilestone && dependency.type !== 'finish-to-start') {
      warnings.push('Milestones typically use finish-to-start dependencies');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [taskMap, dependencies, hasCircularDependency]);

  /**
   * Add a new dependency
   */
  const addDependency = useCallback((dependency: Omit<TaskDependency, 'id'>): string => {
    const validation = validateDependency(dependency);
    
    if (!validation.isValid) {
      throw new Error(`Invalid dependency: ${validation.errors.join(', ')}`);
    }

    const id = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDependency: TaskDependency = { ...dependency, id };
    
    setDependencies(prev => [...prev, newDependency]);
    
    return id;
  }, [validateDependency]);

  /**
   * Remove a dependency
   */
  const removeDependency = useCallback((id: string) => {
    setDependencies(prev => prev.filter(d => d.id !== id));
  }, []);

  /**
   * Update a dependency
   */
  const updateDependency = useCallback((id: string, updates: Partial<TaskDependency>) => {
    setDependencies(prev => prev.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ));
  }, []);

  /**
   * Get direct or all dependent tasks
   */
  const getDependentTasks = useCallback((taskId: string, type: 'direct' | 'all' = 'direct'): string[] => {
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
  }, [dependencies]);

  /**
   * Get predecessor tasks
   */
  const getPredecessorTasks = useCallback((taskId: string, type: 'direct' | 'all' = 'direct'): string[] => {
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
  }, [dependencies]);

  /**
   * Calculate critical path using forward and backward pass
   */
  const calculateCriticalPath = useCallback((): CriticalPath | null => {
    if (tasks.length === 0) return null;

    // Early start and early finish times
    const earlyStart = new Map<string, number>();
    const earlyFinish = new Map<string, number>();
    
    // Late start and late finish times
    const lateStart = new Map<string, number>();
    const lateFinish = new Map<string, number>();

    // Forward pass - calculate early start/finish
    const sortedTasks = topologicalSort(tasks, dependencies);
    
    sortedTasks.forEach(task => {
      const predecessors = dependencies.filter(d => d.toTaskId === task.id);
      
      if (predecessors.length === 0) {
        earlyStart.set(task.id, 0);
      } else {
        const maxFinish = Math.max(...predecessors.map(dep => {
          const predTask = taskMap.get(dep.fromTaskId);
          if (!predTask) return 0;
          
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

    // Project duration is the maximum early finish
    const projectDuration = Math.max(...Array.from(earlyFinish.values()));

    // Backward pass - calculate late start/finish
    const reversedTasks = [...sortedTasks].reverse();
    
    reversedTasks.forEach(task => {
      const successors = dependencies.filter(d => d.fromTaskId === task.id);
      
      if (successors.length === 0) {
        lateFinish.set(task.id, projectDuration);
      } else {
        const minStart = Math.min(...successors.map(dep => {
          const succTask = taskMap.get(dep.toTaskId);
          if (!succTask) return projectDuration;
          
          const succStart = lateStart.get(dep.toTaskId) || projectDuration;
          const lag = dep.lagDays || 0;
          
          switch (dep.type) {
            case 'finish-to-start':
              return succStart - lag;
            case 'start-to-start':
              return succStart - task.duration - lag;
            case 'finish-to-finish':
              return (lateFinish.get(dep.toTaskId) || projectDuration) - lag;
            case 'start-to-finish':
              return (lateFinish.get(dep.toTaskId) || projectDuration) - task.duration - lag;
            default:
              return succStart;
          }
        }));
        
        lateFinish.set(task.id, minStart);
      }
      
      lateStart.set(task.id, (lateFinish.get(task.id) || 0) - task.duration);
    });

    // Calculate slack time and identify critical path
    const slackTime = new Map<string, number>();
    const criticalTaskIds: string[] = [];

    tasks.forEach(task => {
      const slack = (lateStart.get(task.id) || 0) - (earlyStart.get(task.id) || 0);
      slackTime.set(task.id, slack);
      
      if (Math.abs(slack) < 0.01) { // Float comparison tolerance
        criticalTaskIds.push(task.id);
      }
    });

    return {
      taskIds: criticalTaskIds,
      totalDuration: projectDuration,
      slackTime
    };
  }, [tasks, dependencies, taskMap]);

  /**
   * Topological sort helper
   */
  function topologicalSort(tasks: GanttTask[], dependencies: TaskDependency[]): GanttTask[] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();
    
    // Initialize
    tasks.forEach(task => {
      inDegree.set(task.id, 0);
      adjList.set(task.id, []);
    });
    
    // Build graph
    dependencies.forEach(dep => {
      adjList.get(dep.fromTaskId)?.push(dep.toTaskId);
      inDegree.set(dep.toTaskId, (inDegree.get(dep.toTaskId) || 0) + 1);
    });
    
    // Kahn's algorithm
    const queue: GanttTask[] = tasks.filter(task => inDegree.get(task.id) === 0);
    const result: GanttTask[] = [];
    
    while (queue.length > 0) {
      const task = queue.shift()!;
      result.push(task);
      
      const neighbors = adjList.get(task.id) || [];
      neighbors.forEach(neighborId => {
        inDegree.set(neighborId, (inDegree.get(neighborId) || 0) - 1);
        if (inDegree.get(neighborId) === 0) {
          const neighborTask = tasks.find(t => t.id === neighborId);
          if (neighborTask) queue.push(neighborTask);
        }
      });
    }
    
    return result;
  }

  /**
   * Cascade task date update to dependent tasks
   */
  const cascadeTaskUpdate = useCallback((taskId: string, newEndDate: Date): Map<string, Date> => {
    const updates = new Map<string, Date>();
    const task = taskMap.get(taskId);
    
    if (!task) return updates;
    
    const oldEndDate = task.endDate;
    const deltaMs = newEndDate.getTime() - oldEndDate.getTime();
    const deltaDays = deltaMs / (1000 * 60 * 60 * 24);
    
    // BFS to update all dependent tasks
    const queue = getDependentTasks(taskId, 'direct');
    const processed = new Set<string>();
    
    while (queue.length > 0) {
      const depTaskId = queue.shift()!;
      if (processed.has(depTaskId)) continue;
      
      processed.add(depTaskId);
      
      const depTask = taskMap.get(depTaskId);
      if (!depTask) continue;
      
      // Calculate new dates based on dependency type
      const relevantDeps = dependencies.filter(
        d => d.toTaskId === depTaskId && d.fromTaskId === taskId
      );
      
      relevantDeps.forEach(dep => {
        let newStart = new Date(depTask.startDate);
        let newEnd = new Date(depTask.endDate);
        
        switch (dep.type) {
          case 'finish-to-start':
            newStart = new Date(newEndDate);
            newStart.setDate(newStart.getDate() + (dep.lagDays || 0));
            newEnd = new Date(newStart);
            newEnd.setDate(newEnd.getDate() + depTask.duration);
            break;
            
          case 'start-to-start':
            newStart.setDate(newStart.getDate() + deltaDays);
            newEnd.setDate(newEnd.getDate() + deltaDays);
            break;
            
          case 'finish-to-finish':
            newEnd = new Date(newEndDate);
            newEnd.setDate(newEnd.getDate() + (dep.lagDays || 0));
            newStart = new Date(newEnd);
            newStart.setDate(newStart.getDate() - depTask.duration);
            break;
            
          case 'start-to-finish':
            // Rare case - when task starts, successor finishes
            newEnd.setDate(newEnd.getDate() + deltaDays);
            newStart.setDate(newStart.getDate() + deltaDays);
            break;
        }
        
        updates.set(depTaskId, newEnd);
      });
      
      // Add next level dependencies
      queue.push(...getDependentTasks(depTaskId, 'direct'));
    }
    
    return updates;
  }, [taskMap, dependencies, getDependentTasks]);

  /**
   * Check if task is on critical path
   */
  const isTaskOnCriticalPath = useCallback((taskId: string): boolean => {
    return criticalPath?.taskIds.includes(taskId) || false;
  }, [criticalPath]);

  /**
   * Get task slack time
   */
  const getTaskSlack = useCallback((taskId: string): number => {
    return criticalPath?.slackTime.get(taskId) || 0;
  }, [criticalPath]);

  /**
   * Get dependency visualization path (for SVG arrows)
   */
  const getDependencyPath = useCallback((dependencyId: string): { start: { x: number; y: number }; end: { x: number; y: number } } | null => {
    const dep = dependencies.find(d => d.id === dependencyId);
    if (!dep) return null;
    
    // This would be implemented based on your Gantt chart layout
    // Return null for now - actual implementation depends on your chart dimensions
    return null;
  }, [dependencies]);

  /**
   * Get dependency color based on critical path
   */
  const getDependencyColor = useCallback((dependencyId: string): string => {
    const dep = dependencies.find(d => d.id === dependencyId);
    if (!dep) return '#94a3b8'; // slate-400
    
    const fromOnCritical = isTaskOnCriticalPath(dep.fromTaskId);
    const toOnCritical = isTaskOnCriticalPath(dep.toTaskId);
    
    if (fromOnCritical && toOnCritical) {
      return '#ef4444'; // rose-500 - critical path
    }
    
    if (fromOnCritical || toOnCritical) {
      return '#f59e0b'; // amber-500 - near critical
    }
    
    return '#3b82f6'; // blue-500 - normal
  }, [dependencies, isTaskOnCriticalPath]);

  // Recalculate critical path when dependencies or tasks change
  useEffect(() => {
    const path = calculateCriticalPath();
    setCriticalPath(path);
  }, [calculateCriticalPath]);

  return {
    dependencies,
    criticalPath,
    addDependency,
    removeDependency,
    updateDependency,
    validateDependency,
    hasCircularDependency,
    calculateCriticalPath,
    isTaskOnCriticalPath,
    getTaskSlack,
    cascadeTaskUpdate,
    getDependentTasks,
    getPredecessorTasks,
    getDependencyPath,
    getDependencyColor
  };
}

export default useGanttDependencies;
