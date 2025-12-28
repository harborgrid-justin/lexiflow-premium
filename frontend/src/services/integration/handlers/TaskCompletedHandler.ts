/**
 * TaskCompletedHandler - Task -> Billing Integration
 * 
 * Responsibility: Auto-create billable time entries from completed tasks
 * Integration: Opp #3 from architecture docs
 */

import { BaseEventHandler } from './BaseEventHandler';
import type { SystemEventPayloads, IntegrationResult } from '@/types/integration-types';
import type { TimeEntry, UUID, CaseId, UserId } from '@/types';
import { SystemEventType } from '@/types/integration-types';

export class TaskCompletedHandler extends BaseEventHandler<SystemEventPayloads[typeof SystemEventType.TASK_COMPLETED]> {
  readonly eventType = SystemEventType.TASK_COMPLETED;
  
  async handle(payload: SystemEventPayloads[typeof SystemEventType.TASK_COMPLETED]): Promise<IntegrationResult> {
    const actions: string[] = [];
    const { task } = payload;
    
    // Validate task is billable
    if (!this.isBillable(task)) {
      return this.createSuccess([]);
    }
    
    // Dynamic import to avoid circular dependency
    const { DataService } = await import('@/services');
    
    const draftTimeEntry: TimeEntry = {
      id: `time-auto-${Date.now()}` as UUID,
      caseId: task.caseId as CaseId,
      userId: task.assigneeId as UserId,
      date: new Date().toISOString().split('T')[0],
      duration: 0, // User will fill in actual duration
      description: `Task Completion: ${task.title}`,
      rate: 0, // Will be filled by billing rules
      total: 0,
      status: 'Unbilled',
      billable: true
    };
    
    await DataService.billing.addTimeEntry(draftTimeEntry);
    actions.push('Created Draft Billable Entry from Task');
    
    return this.createSuccess(actions);
  }
  
  /**
   * Business rules for determining if a task should generate a time entry
   */
  private isBillable(task: SystemEventPayloads[typeof SystemEventType.TASK_COMPLETED]['task']): boolean {
    // Check if task description/title suggests non-billable work
    const nonBillableKeywords = ['administrative', 'internal', 'training'];
    const titleLower = task.title.toLowerCase();
    const descLower = task.description?.toLowerCase() || '';
    const isBillableCategory = !nonBillableKeywords.some(keyword =>
      titleLower.includes(keyword) || descLower.includes(keyword)
    );

    const hasValidCase = !!(task.caseId && task.caseId !== 'General');
    const isHighPriority = task.priority === 'High' || task.priority === 'Critical';
    const hasAssignee = !!(task.assigneeId || task.assignedTo);

    return hasValidCase && isHighPriority && isBillableCategory && hasAssignee;
  }
}
