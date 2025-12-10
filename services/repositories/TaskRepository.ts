import { WorkflowTask } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../db';
import { IntegrationOrchestrator } from '../integrationOrchestrator';
import { SystemEventType } from '../../types/integrationTypes';

export class TaskRepository extends Repository<WorkflowTask> {
    constructor() {
        super(STORES.TASKS);
    }
    
    async getByCaseId(caseId: string) {
        return this.getByIndex('caseId', caseId);
    }
    
    async countByCaseId(caseId: string): Promise<number> {
      const tasks = await this.getByCaseId(caseId);
      return tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed').length;
    }
    
    async add(item: WorkflowTask): Promise<WorkflowTask> {
        const result = await super.add(item);
        return result;
    }
    
    async update(id: string, updates: Partial<WorkflowTask>): Promise<WorkflowTask> {
        const result = await super.update(id, updates);
        
        // Opp #3 Integration Point
        if (updates.status === 'Done' || updates.status === 'Completed') {
             IntegrationOrchestrator.publish(SystemEventType.TASK_COMPLETED, { task: result });
        }
        
        return result;
    }
}