import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { CasePhase, WorkflowTask } from '@/types';

export const useCasePlanning = (caseId: string) => {
    const { data: phases = [] } = useQuery<CasePhase[]>(
        ['cases', caseId, 'phases'],
        () => DataService.phases.getByCaseId(caseId)
    );
    const { data: tasks = [] } = useQuery<WorkflowTask[]>(
        ['tasks', caseId],
        () => DataService.tasks.getByCaseId(caseId)
    );

    const { mutate: updateTask } = useMutation(
        (task: WorkflowTask) => DataService.tasks.update(task.id, task),
        {
            invalidateKeys: [['tasks', caseId]],
            // Optimistic Update logic preserved from component
            onSuccess: (updatedTask: WorkflowTask) => {
                const current = queryClient.getQueryState<WorkflowTask[]>(['tasks', caseId])?.data || [];
                const newTasks = current.map(t => t.id === updatedTask.id ? updatedTask : t);
                queryClient.setQueryData(['tasks', caseId], newTasks);
            }
        }
    );

    return {
        phases,
        tasks,
        updateTask
    };
};
