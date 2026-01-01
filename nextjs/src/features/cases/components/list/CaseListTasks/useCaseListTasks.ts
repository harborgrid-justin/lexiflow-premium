import { useState } from 'react';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { useModalState } from '@/hooks/core';
import { DataService } from '@/services/data/dataService';
import { queryKeys } from '@/utils/queryKeys';
import { WorkflowTask, Case, TaskStatusBackend } from '@/types';

export function useCaseListTasks(onSelectCase?: (c: Case) => void) {
  const taskModal = useModalState();
  const [filter, setFilter] = useState('All');

  const { data: tasks = [], isLoading, error } = useQuery<WorkflowTask[]>(
    ['tasks', 'all'],
    () => DataService.tasks.getAll()
  );

  const { mutate: addTask } = useMutation(DataService.tasks.add, {
    onSuccess: () => queryClient.invalidate(queryKeys.tasks.all()),
  });

  const { mutate: updateTask } = useMutation(
    (payload: { id: string; updates: Partial<WorkflowTask> }) =>
      DataService.tasks.update(payload.id, payload.updates),
    { onSuccess: () => queryClient.invalidate(queryKeys.tasks.all()) }
  );

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredTasks = safeTasks.filter((t) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return t.status === TaskStatusBackend.TODO || t.status === TaskStatusBackend.IN_PROGRESS;
    if (filter === 'High Priority') return t.priority === 'High';
    return true;
  });

  const handleAddTask = async (newTask: WorkflowTask) => {
    await addTask(newTask);
  };

  const handleToggle = async (id: string) => {
    const task = safeTasks.find((t) => t.id === id);
    if (task) {
      const newStatus = task.status === TaskStatusBackend.COMPLETED ? TaskStatusBackend.TODO : TaskStatusBackend.COMPLETED;
      await updateTask({ id, updates: { status: newStatus as any } });
    }
  };

  const handleTaskClick = async (task: WorkflowTask) => {
    if (task.caseId && onSelectCase) {
      const found = await DataService.cases.getById(task.caseId);
      if (found) onSelectCase(found);
    }
  };

  return {
    taskModal,
    filter,
    setFilter,
    filteredTasks,
    isLoading,
    error,
    handleAddTask,
    handleToggle,
    handleTaskClick,
  };
}
