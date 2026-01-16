/**
 * @module hooks/useTasks
 * @description Production hook for task management
 * 
 * Provides access to:
 * - All tasks
 * - Single task by ID
 * - Task creation, updates, deletion
 * - Case-specific tasks
 * - Task filtering by status/assignee
 */

import { useQuery, useMutation, queryClient } from '@/hooks/backend';
import { DataService } from '@/services/data/data-service.service';

/**
 * Main tasks hook - access all tasks
 */
export function useTasks() {
  const { data: tasks = [], isLoading } = useQuery(
    ['tasks'],
    async () => {
      const data = await DataService.tasks.getAll();
      return data || [];
    }
  );

  const createTask = useMutation(
    async (taskData: any) => {
      return await DataService.tasks.add(taskData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
      },
    }
  );

  const updateTask = useMutation(
    async ({ id, updates }: { id: string; updates: any }) => {
      return await DataService.tasks.update(id, updates);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
      },
    }
  );

  const deleteTask = useMutation(
    async (id: string) => {
      return await DataService.tasks.delete(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
      },
    }
  );

  return {
    tasks,
    isLoading,
    createTask: createTask.mutateAsync,
    updateTask: updateTask.mutateAsync,
    deleteTask: deleteTask.mutateAsync,
  };
}

/**
 * Single task hook
 */
export function useTask(taskId: string) {
  const { data: task, isLoading } = useQuery(
    ['task', taskId],
    async () => {
      return await DataService.tasks.getById(taskId);
    },
    {
      enabled: !!taskId,
    }
  );

  const updateTask = useMutation(
    async (updates: any) => {
      return await DataService.tasks.update(taskId, updates);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task', taskId]);
        queryClient.invalidateQueries(['tasks']);
      },
    }
  );

  return {
    task,
    isLoading,
    updateTask: updateTask.mutateAsync,
  };
}

/**
 * Case-specific tasks hook
 */
export function useCaseTasks(caseId: string) {
  const { data: tasks = [], isLoading } = useQuery(
    ['case-tasks', caseId],
    async () => {
      const data = await DataService.tasks.getAll();
      // Filter by caseId on client side
      return (data || []).filter((task: any) => task.caseId === caseId);
    },
    {
      enabled: !!caseId,
    }
  );

  const createTask = useMutation(
    async (taskData: any) => {
      return await DataService.tasks.add({ ...taskData, caseId });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['case-tasks', caseId]);
        queryClient.invalidateQueries(['tasks']);
      },
    }
  );

  return {
    tasks,
    isLoading,
    createTask: createTask.mutateAsync,
  };
}

/**
 * User-assigned tasks hook
 */
export function useMyTasks(userId?: string) {
  const { data: tasks = [], isLoading } = useQuery(
    ['my-tasks', userId],
    async () => {
      const data = await DataService.tasks.getAll();
      // Filter by userId if provided
      if (userId) {
        return (data || []).filter((task: any) => task.assignedTo === userId);
      }
      return data || [];
    }
  );

  return {
    tasks,
    isLoading,
  };
}
