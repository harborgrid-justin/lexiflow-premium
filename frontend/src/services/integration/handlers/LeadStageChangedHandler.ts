/**
 * LeadStageChangedHandler - CRM -> Compliance Integration
 * 
 * Responsibility: Trigger conflict checks when leads reach engagement stage
 * Integration: Opp #1 from architecture docs
 */

import { BaseEventHandler } from './BaseEventHandler';
import type { SystemEventPayloads } from '@/types/integration-types';
import type { ConflictCheck } from '@/types';
import { SystemEventType } from '@/types/integration-types';

export class LeadStageChangedHandler extends BaseEventHandler<SystemEventPayloads[typeof SystemEventType.LEAD_STAGE_CHANGED]> {
  readonly eventType = SystemEventType.LEAD_STAGE_CHANGED;
  
  async handle(payload: SystemEventPayloads[typeof SystemEventType.LEAD_STAGE_CHANGED]) {
    const actions: string[] = [];
    
    // Only trigger conflict checks for specific stages
    if (payload.stage === 'Engagement' || payload.stage === 'Conflict Check') {
      // Dynamic import to avoid circular dependency
      const { DataService } = await import('@/services');
      
      await DataService.compliance.runConflictCheck(payload.clientName);
      actions.push('Triggered Automated Conflict Check');
    }
    
    return this.createSuccess(actions);
  }
}
