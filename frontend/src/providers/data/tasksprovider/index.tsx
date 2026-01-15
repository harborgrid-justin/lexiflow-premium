// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - TASKS/WORKFLOW DOMAIN
// ================================================================================

/**
 * Tasks Provider
 *
 * Manages task and workflow data state for project management and task tracking.
 * Handles task CRUD, assignment, status updates, filtering, and deadline management.
 *
 * @module providers/data/tasksprovider
 */

import { TasksActionsContext, TasksStateContext } from '@/lib/tasks/contexts';
import type { TasksActionsValue, TasksProviderProps, TasksStateValue } from '@/lib/tasks/types';
import { DataService } from '@/services/data/dataService';
import type { WorkflowTask } from '@/types/workflow';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

export function TasksProvider({ children, initialTasks, caseId }: TasksProviderProps) {
  const [tasks, setTasks] = useState<WorkflowTask[]>(initialTasks || []);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTaskState] = useState<WorkflowTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filterByCaseId, setFilterByCaseId] = useState<string | null>(caseId || null);
  const [filterByStatus, setFilterByStatus] = useState<string | null>(null);

  const loadTasks = useCallback(async (filters?: { caseId?: string; status?: string; assigneeId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await (DataService.tasks as unknown as { getAll: (params?: unknown) => Promise<WorkflowTask[]> }).getAll(filters);
      setTasks(loaded.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load tasks'));
      console.error('[TasksProvider] Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTaskById = useCallback(async (id: string): Promise<WorkflowTask | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const task = await (DataService.tasks as unknown as { getById: (id: string) => Promise<WorkflowTask> }).getById(id);
      setTasks(prev => {
        const exists = prev.find(t => t.id === id);
        if (exists) {
          return prev.map(t => t.id === id ? task : t);
        }
        return [...prev, task];
      });
      return task;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load task ${id}`));
      console.error('[TasksProvider] Failed to load task:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: Partial<WorkflowTask>): Promise<WorkflowTask> => {
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await (DataService.tasks as unknown as { add: (data: Partial<WorkflowTask>) => Promise<WorkflowTask> }).add(data);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create task'));
      console.error('[TasksProvider] Failed to create task:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<WorkflowTask>): Promise<WorkflowTask> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.tasks as unknown as { update: (id: string, data: Partial<WorkflowTask>) => Promise<WorkflowTask> }).update(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      if (activeTaskId === id) {
        setActiveTaskState(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update task ${id}`));
      console.error('[TasksProvider] Failed to update task:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeTaskId]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.tasks as unknown as { delete: (id: string) => Promise<void> }).delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      if (activeTaskId === id) {
        setActiveTaskId(null);
        setActiveTaskState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete task ${id}`));
      console.error('[TasksProvider] Failed to delete task:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeTaskId]);

  const completeTask = useCallback(async (id: string): Promise<void> => {
    await updateTask(id, { status: 'Completed', completedAt: new Date().toISOString() } as Partial<WorkflowTask>);
  }, [updateTask]);

  const assignTask = useCallback(async (id: string, assigneeId: string): Promise<void> => {
    await updateTask(id, { assigneeId } as Partial<WorkflowTask>);
  }, [updateTask]);

  const setActiveTask = useCallback((id: string | null) => {
    setActiveTaskId(id);
    if (id) {
      const found = tasks.find(t => t.id === id);
      setActiveTaskState(found || null);
      if (!found) {
        loadTaskById(id).then(loaded => {
          if (loaded) setActiveTaskState(loaded);
        });
      }
    } else {
      setActiveTaskState(null);
    }
  }, [tasks, loadTaskById]);

  const searchTasks = useCallback(async (query: string): Promise<WorkflowTask[]> => {
    if (!query.trim()) return tasks;

    const lowerQuery = query.toLowerCase();
    return tasks.filter(t =>
      t.title?.toLowerCase().includes(lowerQuery) ||
      t.description?.toLowerCase().includes(lowerQuery) ||
      t.assignee?.toLowerCase().includes(lowerQuery)
    );
  }, [tasks]);

  const filterByCase = useCallback((caseId: string | null) => {
    setFilterByCaseId(caseId);
    loadTasks(caseId ? { caseId } : {});
  }, [loadTasks]);

  const filterByStatusAction = useCallback((status: string | null) => {
    setFilterByStatus(status);
    if (status) {
      loadTasks({ status });
    } else {
      loadTasks();
    }
  }, [loadTasks]);

  const refreshTasks = useCallback(async () => {
    const filters: { caseId?: string; status?: string } = {};
    if (filterByCaseId) filters.caseId = filterByCaseId;
    if (filterByStatus) filters.status = filterByStatus;
    await loadTasks(filters);
  }, [loadTasks, filterByCaseId, filterByStatus]);

  useEffect(() => {
    if (!initialTasks) {
      loadTasks(caseId ? { caseId } : {});
    }
  }, [initialTasks, caseId, loadTasks]);

  useEffect(() => {
    if (activeTaskId) {
      const found = tasks.find(t => t.id === activeTaskId);
      if (found) {
        setActiveTaskState(found);
      }
    }
  }, [activeTaskId, tasks]);

  const stateValue = useMemo<TasksStateValue>(() => ({
    tasks,
    activeTaskId,
    activeTask,
    isLoading,
    error,
    filterByCaseId,
    filterByStatus,
  }), [tasks, activeTaskId, activeTask, isLoading, error, filterByCaseId, filterByStatus]);

  const actionsValue = useMemo<TasksActionsValue>(() => ({
    loadTasks,
    loadTaskById,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    assignTask,
    setActiveTask,
    searchTasks,
    filterByCase,
    filterByStatus: filterByStatusAction,
    refreshTasks,
  }), [
    loadTasks,
    loadTaskById,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    assignTask,
    setActiveTask,
    searchTasks,
    filterByCase,
    filterByStatusAction,
    refreshTasks
  ]);

  return (
    <TasksStateContext.Provider value={stateValue}>
      <TasksActionsContext.Provider value={actionsValue}>
        {children}
      </TasksActionsContext.Provider>
    </TasksStateContext.Provider>
  );
}

export function useTasksState(): TasksStateValue {
  const context = useContext(TasksStateContext);
  if (!context) {
    throw new Error('useTasksState must be used within TasksProvider');
  }
  return context;
}

export function useTasksActions(): TasksActionsValue {
  const context = useContext(TasksActionsContext);
  if (!context) {
    throw new Error('useTasksActions must be used within TasksProvider');
  }
  return context;
}

export function useTasks() {
  return {
    state: useTasksState(),
    actions: useTasksActions(),
  };
}
