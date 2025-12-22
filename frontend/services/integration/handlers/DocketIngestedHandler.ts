/**
 * DocketIngestedHandler - Docket -> Calendar Integration
 * 
 * Responsibility: Auto-create calendar events from docket entries using rules engine
 * Integration: Opp #2 from architecture docs
 */

import { BaseEventHandler } from './BaseEventHandler';
import { db } from '../../data/db';
import type { SystemEventPayloads, IntegrationResult } from '../../../types/integration-types';
import type { CalendarEventItem } from '../../../types';
import { SystemEventType } from '../../../types/integration-types';

export class DocketIngestedHandler extends BaseEventHandler<SystemEventPayloads[typeof SystemEventType.DOCKET_INGESTED]> {
  readonly eventType = SystemEventType.DOCKET_INGESTED;
  
  async handle(payload: SystemEventPayloads[typeof SystemEventType.DOCKET_INGESTED]): Promise<IntegrationResult> {
    const actions: string[] = [];
    const { entry } = payload;

    // Rule: Motion filings trigger response deadline
    if ((entry.title || '').toLowerCase().includes('motion')) {
      await this.createResponseDeadline(entry);
      actions.push('Calculated Response Deadline per Local Rules');
    }

    // Rule: Hearings sync to calendar
    if (entry.type === 'Hearing' || (entry.title || '').toLowerCase().includes('hearing')) {
      await this.createHearingEvent(entry);
      actions.push('Synced Hearing to Master Calendar');
    }
    
    return this.createSuccess(actions);
  }
  
  private async createResponseDeadline(entry: SystemEventPayloads[typeof SystemEventType.DOCKET_INGESTED]['entry']) {
    const deadlineDate = new Date(new Date(entry.date).getTime() + (14 * 24 * 60 * 60 * 1000));
    
    const deadlineEvt: CalendarEventItem = {
      id: `cal-resp-${entry.id}`,
      title: `Response Due: ${entry.title}`,
      date: deadlineDate.toISOString().split('T')[0],
      type: 'deadline',
      priority: 'High',
      description: `Derived from Docket Sequence #${entry.sequenceNumber}`,
      location: 'Court ECF'
    };
    
    await db.put('calendarEvents', deadlineEvt);
  }
  
  private async createHearingEvent(entry: SystemEventPayloads[typeof SystemEventType.DOCKET_INGESTED]['entry']) {
    const hearingEvt: CalendarEventItem = {
      id: `cal-hear-${entry.id}`,
      title: entry.title,
      date: entry.date,
      type: 'hearing',
      priority: 'Critical',
      description: `Court Appearance Required. Docket #${entry.sequenceNumber}`
    };
    
    await db.put('calendarEvents', hearingEvt);
  }
}
