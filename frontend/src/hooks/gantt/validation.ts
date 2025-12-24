import type { TaskDependency, ValidationResult, GanttTask } from './types';

/**
 * Check for circular dependencies using DFS
 */
export function hasCircularDependency(
  fromTaskId: string,
  toTaskId: string,
  dependencies: TaskDependency[]
): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const dfs = (currentId: string): boolean => {
    if (recursionStack.has(currentId)) return true;
    if (visited.has(currentId)) return false;

    visited.add(currentId);
    recursionStack.add(currentId);

    const outgoingDeps = dependencies.filter(dep => dep.fromTaskId === currentId);
    
    for (const dep of outgoingDeps) {
      if (dep.toTaskId === toTaskId || dfs(dep.toTaskId)) {
        return true;
      }
    }

    recursionStack.delete(currentId);
    return false;
  };

  return dfs(toTaskId);
}

/**
 * Validate a dependency
 */
export function validateDependency(
  dependency: Omit<TaskDependency, 'id'>,
  taskMap: Map<string, GanttTask>,
  dependencies: TaskDependency[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!taskMap.has(dependency.fromTaskId)) {
    errors.push(`Source task ${dependency.fromTaskId} does not exist`);
  }
  if (!taskMap.has(dependency.toTaskId)) {
    errors.push(`Target task ${dependency.toTaskId} does not exist`);
  }

  if (dependency.fromTaskId === dependency.toTaskId) {
    errors.push('Task cannot depend on itself');
  }

  if (hasCircularDependency(dependency.fromTaskId, dependency.toTaskId, dependencies)) {
    errors.push('This dependency would create a circular dependency');
  }

  const duplicate = dependencies.find(
    d => d.fromTaskId === dependency.fromTaskId && 
         d.toTaskId === dependency.toTaskId &&
         d.type === dependency.type
  );
  if (duplicate) {
    warnings.push('A similar dependency already exists');
  }

  const fromTask = taskMap.get(dependency.fromTaskId);
  const _toTask = taskMap.get(dependency.toTaskId);
  
  if (fromTask?.isMilestone && dependency.type !== 'finish-to-start') {
    warnings.push('Milestones typically use finish-to-start dependencies');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
