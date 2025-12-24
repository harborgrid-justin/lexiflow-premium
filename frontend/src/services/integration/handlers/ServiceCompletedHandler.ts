/**
 * ServiceCompletedHandler - Service -> Docket Integration
 * 
 * Responsibility: Auto-file proof of service to docket
 * Integration: Opp #10 from architecture docs
 */

import { BaseEventHandler } from './BaseEventHandler';
import type { SystemEventPayloads } from '@/types/integration-types';
import type { DocketEntry, DocketId } from '../../../types';
import { SystemEventType } from '@/types/integration-types';

export class ServiceCompletedHandler extends BaseEventHandler<SystemEventPayloads[typeof SystemEventType.SERVICE_COMPLETED]> {
  readonly eventType = SystemEventType.SERVICE_COMPLETED;
  
  async handle(payload: SystemEventPayloads[typeof SystemEventType.SERVICE_COMPLETED]) {
    const actions: string[] = [];
    const { job } = payload;
    
    // Only file for successfully served documents
    if (job.status !== 'Served') {
      return this.createSuccess([]);
    }
    
    const { DataService } = await import('@/api/data/dataService');
    
    const entry: DocketEntry = {
      id: `dk-proof-${Date.now()}` as DocketId,
      sequenceNumber: 999,
      caseId: job.caseId,
      date: new Date().toISOString().split('T')[0],
      type: 'Filing',
      title: `Proof of Service: ${job.documentTitle}`,
      description: `Served on ${job.targetPerson} at ${job.targetAddress} by ${job.serverName}.`,
      filedBy: 'System Automation',
      isSealed: false
    };
    
    await DataService.docket.add(entry);
    actions.push('Auto-filed Proof of Service to Docket');
    
    return this.createSuccess(actions);
  }
}
