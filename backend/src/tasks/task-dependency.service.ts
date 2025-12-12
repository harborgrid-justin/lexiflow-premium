import { Injectable, BadRequestException, Logger } from '@nestjs/common';

/**
 * Task definition
 */
export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  dependencies: string[]; // Task IDs that must be completed first
  dependents: string[]; // Task IDs that depend on this task
  estimatedDuration?: number;
  actualDuration?: number;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  priority: number;
  metadata?: Record<string, any>;
}

export enum TaskStatus {
  PENDING = 'pending',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Dependency graph node
 */
interface DependencyNode {
  taskId: string;
  dependencies: Set<string>;
  dependents: Set<string>;
}

/**
 * Task Dependency Service
 * Manages task dependencies and blocking relationships
 */
@Injectable()
export class TaskDependencyService {
  private readonly logger = new Logger(TaskDependencyService.name);
  private tasks: Map<string, Task> = new Map();
  private dependencyGraph: Map<string, DependencyNode> = new Map();

  /**
   * Add task to dependency system
   */
  addTask(task: Task): void {
    this.tasks.set(task.id, task);

    // Initialize dependency node
    if (!this.dependencyGraph.has(task.id)) {
      this.dependencyGraph.set(task.id, {
        taskId: task.id,
        dependencies: new Set(task.dependencies),
        dependents: new Set(),
      });
    }

    // Update dependent tasks
    task.dependencies.forEach((depId) => {
      const depNode = this.dependencyGraph.get(depId);
      if (depNode) {
        depNode.dependents.add(task.id);
      } else {
        this.dependencyGraph.set(depId, {
          taskId: depId,
          dependencies: new Set(),
          dependents: new Set([task.id]),
        });
      }
    });

    this.logger.log(`Task added: ${task.name} (${task.id})`);
  }

  /**
   * Add dependency between tasks
   */
  addDependency(taskId: string, dependsOnTaskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new BadRequestException(`Task ${taskId} not found`);
    }

    // Check for circular dependency
    if (this.wouldCreateCircularDependency(taskId, dependsOnTaskId)) {
      throw new BadRequestException(
        'Cannot add dependency: would create circular dependency',
      );
    }

    // Update task dependencies
    if (!task.dependencies.includes(dependsOnTaskId)) {
      task.dependencies.push(dependsOnTaskId);
    }

    // Update dependency graph
    const node = this.dependencyGraph.get(taskId);
    if (node) {
      node.dependencies.add(dependsOnTaskId);
    }

    const depNode = this.dependencyGraph.get(dependsOnTaskId);
    if (depNode) {
      depNode.dependents.add(taskId);
    }

    this.logger.log(`Dependency added: ${taskId} depends on ${dependsOnTaskId}`);

    // Update task status if needed
    this.updateTaskStatus(taskId);
  }

  /**
   * Remove dependency between tasks
   */
  removeDependency(taskId: string, dependsOnTaskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new BadRequestException(`Task ${taskId} not found`);
    }

    // Update task dependencies
    task.dependencies = task.dependencies.filter((id) => id !== dependsOnTaskId);

    // Update dependency graph
    const node = this.dependencyGraph.get(taskId);
    if (node) {
      node.dependencies.delete(dependsOnTaskId);
    }

    const depNode = this.dependencyGraph.get(dependsOnTaskId);
    if (depNode) {
      depNode.dependents.delete(taskId);
    }

    this.logger.log(`Dependency removed: ${taskId} no longer depends on ${dependsOnTaskId}`);

    // Update task status if needed
    this.updateTaskStatus(taskId);
  }

  /**
   * Check if adding dependency would create circular dependency
   */
  private wouldCreateCircularDependency(
    taskId: string,
    dependsOnTaskId: string,
  ): boolean {
    // DFS to check if dependsOnTaskId depends on taskId
    const visited = new Set<string>();
    const stack = [dependsOnTaskId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;

      if (currentId === taskId) {
        return true; // Circular dependency detected
      }

      if (visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);

      const node = this.dependencyGraph.get(currentId);
      if (node) {
        node.dependencies.forEach((depId) => stack.push(depId));
      }
    }

    return false;
  }

  /**
   * Check if task is blocked by dependencies
   */
  isTaskBlocked(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    // Check if any dependencies are not completed
    return task.dependencies.some((depId) => {
      const depTask = this.tasks.get(depId);
      return depTask?.status !== TaskStatus.COMPLETED;
    });
  }

  /**
   * Get blocking tasks (dependencies that are not completed)
   */
  getBlockingTasks(taskId: string): Task[] {
    const task = this.tasks.get(taskId);
    if (!task) {
      return [];
    }

    return task.dependencies
      .map((depId) => this.tasks.get(depId))
      .filter(
        (depTask) =>
          depTask && depTask.status !== TaskStatus.COMPLETED,
      ) as Task[];
  }

  /**
   * Get all tasks that would be unblocked if this task completes
   */
  getUnblockableTasks(taskId: string): Task[] {
    const node = this.dependencyGraph.get(taskId);
    if (!node) {
      return [];
    }

    const unblockable: Task[] = [];

    node.dependents.forEach((dependentId) => {
      const dependentTask = this.tasks.get(dependentId);
      if (!dependentTask) {
        return;
      }

      // Check if this is the only blocking dependency
      const otherBlockingDeps = dependentTask.dependencies.filter(
        (depId) => {
          if (depId === taskId) {
            return false; // Exclude current task
          }
          const depTask = this.tasks.get(depId);
          return depTask?.status !== TaskStatus.COMPLETED;
        },
      );

      if (otherBlockingDeps.length === 0) {
        unblockable.push(dependentTask);
      }
    });

    return unblockable;
  }

  /**
   * Update task status based on dependencies
   */
  updateTaskStatus(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      return;
    }

    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED) {
      return; // Don't change completed/cancelled tasks
    }

    const isBlocked = this.isTaskBlocked(taskId);

    if (isBlocked && task.status !== TaskStatus.BLOCKED) {
      task.status = TaskStatus.BLOCKED;
      this.logger.log(`Task ${taskId} is now blocked`);
    } else if (!isBlocked && task.status === TaskStatus.BLOCKED) {
      task.status = TaskStatus.READY;
      this.logger.log(`Task ${taskId} is now ready`);
    }
  }

  /**
   * Complete task and update dependents
   */
  completeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new BadRequestException(`Task ${taskId} not found`);
    }

    if (this.isTaskBlocked(taskId)) {
      throw new BadRequestException(
        `Cannot complete task ${taskId}: blocked by dependencies`,
      );
    }

    task.status = TaskStatus.COMPLETED;
    task.completedDate = new Date();

    this.logger.log(`Task completed: ${task.name}`);

    // Update dependent tasks
    const node = this.dependencyGraph.get(taskId);
    if (node) {
      node.dependents.forEach((dependentId) => {
        this.updateTaskStatus(dependentId);
      });
    }
  }

  /**
   * Get task execution order (topological sort)
   */
  getExecutionOrder(taskIds?: string[]): string[] {
    const tasksToSort = taskIds || Array.from(this.tasks.keys());
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (taskId: string) => {
      if (visited.has(taskId)) {
        return;
      }

      visited.add(taskId);

      const node = this.dependencyGraph.get(taskId);
      if (node) {
        // Visit dependencies first
        node.dependencies.forEach((depId) => {
          if (tasksToSort.includes(depId)) {
            visit(depId);
          }
        });
      }

      result.push(taskId);
    };

    tasksToSort.forEach((taskId) => visit(taskId));

    return result;
  }

  /**
   * Get critical path (longest path through dependencies)
   */
  getCriticalPath(): {
    path: string[];
    duration: number;
  } {
    const dp = new Map<string, { duration: number; path: string[] }>();

    const calculatePath = (taskId: string): {
      duration: number;
      path: string[];
    } => {
      if (dp.has(taskId)) {
        return dp.get(taskId)!;
      }

      const task = this.tasks.get(taskId);
      if (!task) {
        return { duration: 0, path: [] };
      }

      if (task.dependencies.length === 0) {
        const result = {
          duration: task.estimatedDuration || 0,
          path: [taskId],
        };
        dp.set(taskId, result);
        return result;
      }

      let maxPath = { duration: 0, path: [] as string[] };

      task.dependencies.forEach((depId) => {
        const depPath = calculatePath(depId);
        if (depPath.duration > maxPath.duration) {
          maxPath = depPath;
        }
      });

      const result = {
        duration: maxPath.duration + (task.estimatedDuration || 0),
        path: [...maxPath.path, taskId],
      };

      dp.set(taskId, result);
      return result;
    };

    let criticalPath = { duration: 0, path: [] as string[] };

    this.tasks.forEach((task) => {
      const path = calculatePath(task.id);
      if (path.duration > criticalPath.duration) {
        criticalPath = path;
      }
    });

    return criticalPath;
  }

  /**
   * Get task dependency tree
   */
  getDependencyTree(taskId: string): any {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    const buildTree = (id: string, visited = new Set<string>()): any => {
      if (visited.has(id)) {
        return { id, circular: true };
      }

      visited.add(id);

      const t = this.tasks.get(id);
      if (!t) {
        return null;
      }

      return {
        id: t.id,
        name: t.name,
        status: t.status,
        dependencies: t.dependencies.map((depId) =>
          buildTree(depId, new Set(visited)),
        ),
      };
    };

    return buildTree(taskId);
  }

  /**
   * Get task statistics
   */
  getTaskStatistics(): {
    total: number;
    byStatus: Record<TaskStatus, number>;
    blocked: number;
    ready: number;
    averageDuration: number;
  } {
    const stats = {
      total: this.tasks.size,
      byStatus: {} as Record<TaskStatus, number>,
      blocked: 0,
      ready: 0,
      averageDuration: 0,
    };

    let totalDuration = 0;
    let completedCount = 0;

    this.tasks.forEach((task) => {
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;

      if (task.status === TaskStatus.BLOCKED) {
        stats.blocked++;
      } else if (task.status === TaskStatus.READY) {
        stats.ready++;
      }

      if (task.actualDuration) {
        totalDuration += task.actualDuration;
        completedCount++;
      }
    });

    stats.averageDuration =
      completedCount > 0 ? totalDuration / completedCount : 0;

    return stats;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }
}
