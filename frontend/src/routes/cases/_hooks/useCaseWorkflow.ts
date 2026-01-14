import { useState, useCallback, useMemo } from 'react';
import { WorkflowStage, StageStatus, TaskStatusBackend } from '@/types';

export function useCaseWorkflow(initialStages: WorkflowStage[]) {
  const [stages, setStages] = useState<WorkflowStage[]>(initialStages);
  const [activeTab, setActiveTab] = useState<'timeline' | 'automation'>('timeline');

  const handleToggleTask = useCallback((stageId: string, taskId: string) => {
    setStages(prevStages => prevStages.map(stage => {
        if (stage.id !== stageId) return stage;

        const newTasks = stage.tasks.map(task =>
            task.id === taskId 
              ? { ...task, status: (task.status === TaskStatusBackend.COMPLETED ? TaskStatusBackend.TODO : TaskStatusBackend.COMPLETED) } 
              : task
        );

        const allDone = newTasks.every(t => t.status === TaskStatusBackend.COMPLETED);
        const anyInProgress = newTasks.some(t => t.status === TaskStatusBackend.IN_PROGRESS);

        let newStageStatus: StageStatus = stage.status as StageStatus;
        if (allDone) newStageStatus = 'Completed';
        else if (anyInProgress || newTasks.some(t => t.status === TaskStatusBackend.COMPLETED)) newStageStatus = 'Active';

        return { ...stage, tasks: newTasks, status: newStageStatus };
    }));
  }, []);

  const stats = useMemo(() => {
    const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0);
    const completedTasks = stages.reduce((acc, s) => acc + s.tasks.filter(t => t.status === TaskStatusBackend.COMPLETED).length, 0);
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    return {
      totalTasks,
      completedTasks,
      progress
    };
  }, [stages]);

  return {
    stages,
    setStages,
    activeTab,
    setActiveTab,
    handleToggleTask,
    stats
  };
}
