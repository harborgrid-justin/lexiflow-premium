/**
 * @module hooks/useGanttDependencies
 * @category Hooks
 * @description Manages Gantt chart dependencies with critical path calculation and cascade updates.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { GanttTask, TaskDependency, UseGanttDependenciesReturn } from './types';
import { validateDependency, hasCircularDependency } from './validation';
import { calculateCriticalPath } from './criticalPath';
import { getDependentTasks, getPredecessorTasks, cascadeTaskUpdate } from './dependencies';
import { getDependencyPath, getDependencyColor } from './visualization';

export * from './types';

/**
 * Hook for managing Gantt chart dependencies
 * 
 * @param tasks - Array of Gantt tasks
 * @param initialDependencies - Initial dependencies
 * @returns Dependency management utilities
 */
export function useGanttDependencies(
  tasks: GanttTask[],
  initialDependencies: TaskDependency[] = []
): UseGanttDependenciesReturn {
  const [dependencies, setDependencies] = useState<TaskDependency[]>(initialDependencies);
  const [criticalPath, setCriticalPath] = useState<ReturnType<typeof calculateCriticalPath>>(null);

  const taskMap = useMemo(() => {
    const map = new Map<string, GanttTask>();
    tasks.forEach(task => map.set(task.id, task));
    return map;
  }, [tasks]);

  // Recalculate critical path when tasks or dependencies change
  useEffect(() => {
    const path = calculateCriticalPath(tasks, dependencies);
    setCriticalPath(path);
  }, [tasks, dependencies]);

  const addDependency = useCallback((dependency: Omit<TaskDependency, 'id'>): string => {
    const validation = validateDependency(dependency, taskMap, dependencies);
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const id = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDep: TaskDependency = { ...dependency, id };
    
    setDependencies(prev => [...prev, newDep]);
    return id;
  }, [taskMap, dependencies]);

  const removeDependency = useCallback((id: string) => {
    setDependencies(prev => prev.filter(d => d.id !== id));
  }, []);

  const updateDependency = useCallback((id: string, updates: Partial<TaskDependency>) => {
    setDependencies(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const validateDep = useCallback((dependency: Omit<TaskDependency, 'id'>) => {
    return validateDependency(dependency, taskMap, dependencies);
  }, [taskMap, dependencies]);

  const hasCircular = useCallback((toTaskId: string) => {
    return hasCircularDependency(toTaskId, dependencies);
  }, [dependencies]);

  const calcCriticalPath = useCallback(() => {
    return calculateCriticalPath(tasks, dependencies);
  }, [tasks, dependencies]);

  const isTaskOnCriticalPath = useCallback((taskId: string): boolean => {
    return criticalPath?.taskIds.includes(taskId) || false;
  }, [criticalPath]);

  const getTaskSlack = useCallback((taskId: string): number => {
    return criticalPath?.slackTime.get(taskId) || 0;
  }, [criticalPath]);

  const cascadeUpdate = useCallback((taskId: string, newEndDate: Date) => {
    return cascadeTaskUpdate(taskId, newEndDate, taskMap, dependencies);
  }, [taskMap, dependencies]);

  const getDependents = useCallback((taskId: string, type: 'direct' | 'all' = 'direct') => {
    return getDependentTasks(taskId, dependencies, type);
  }, [dependencies]);

  const getPredecessors = useCallback((taskId: string, type: 'direct' | 'all' = 'direct') => {
    return getPredecessorTasks(taskId, dependencies, type);
  }, [dependencies]);

  const getDepPath = useCallback((
    dependencyId: string,
    getTaskPosition?: (taskId: string) => { x: number; y: number; width: number; height: number } | null
  ) => {
    return getDependencyPath(dependencyId, dependencies, tasks, getTaskPosition);
  }, [dependencies, tasks]);

  const getDepColor = useCallback((dependencyId: string) => {
    return getDependencyColor(dependencyId, dependencies, criticalPath?.taskIds || []);
  }, [dependencies, criticalPath]);

  return {
    dependencies,
    criticalPath,
    addDependency,
    removeDependency,
    updateDependency,
    validateDependency: validateDep,
    hasCircularDependency: hasCircular,
    calculateCriticalPath: calcCriticalPath,
    isTaskOnCriticalPath,
    getTaskSlack,
    cascadeTaskUpdate: cascadeUpdate,
    getDependentTasks: getDependents,
    getPredecessorTasks: getPredecessors,
    getDependencyPath: getDepPath,
    getDependencyColor: getDepColor
  };
}

export default useGanttDependencies;
