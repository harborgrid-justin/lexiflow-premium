/**
 * Case Event Handlers
 * Real-time event handlers for case-related operations
 */

import { Injectable, Logger } from '@nestjs/common';
import { WebSocketService } from '../websocket.service';
import type {
  CaseCreatedEvent,
  CaseUpdatedEvent,
  CaseDeletedEvent,
  CaseStatusChangedEvent,
} from './event-types';

/**
 * Case Event Emitter
 * Handles broadcasting of case-related events
 */
@Injectable()
export class CaseEventEmitter {
  private logger = new Logger('CaseEventEmitter');

  constructor(private websocketService: WebSocketService) {}

  /**
   * Emit case created event
   */
  emitCaseCreated(event: CaseCreatedEvent): void {
    this.logger.log(`Emitting case created: ${event.caseId}`);
    this.websocketService.broadcastCaseCreated(event);
  }

  /**
   * Emit case updated event
   */
  emitCaseUpdated(event: CaseUpdatedEvent): void {
    this.logger.log(`Emitting case updated: ${event.caseId}`);
    this.websocketService.broadcastCaseUpdated(event);
  }

  /**
   * Emit case deleted event
   */
  emitCaseDeleted(event: CaseDeletedEvent): void {
    this.logger.log(`Emitting case deleted: ${event.caseId}`);
    this.websocketService.broadcastCaseDeleted(event);
  }

  /**
   * Emit case status changed event
   */
  emitCaseStatusChanged(event: CaseStatusChangedEvent): void {
    this.logger.log(
      `Emitting case status changed: ${event.caseId} (${event.oldStatus} -> ${event.newStatus})`,
    );
    this.websocketService.broadcastCaseStatusChanged(event);
  }

  /**
   * Emit case assigned event
   */
  emitCaseAssigned(data: {
    caseId: string;
    assignedTo: string;
    assignedBy: string;
  }): void {
    this.logger.log(`Emitting case assigned: ${data.caseId} -> ${data.assignedTo}`);
    this.websocketService.broadcastCaseAssigned({
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit case comment added event
   */
  emitCaseCommentAdded(data: {
    caseId: string;
    commentId: string;
    content: string;
    authorId: string;
  }): void {
    this.logger.log(`Emitting case comment added: ${data.caseId}`);
    this.websocketService.broadcastCaseCommentAdded({
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit case viewed event
   */
  emitCaseViewed(data: { caseId: string; userId: string }): void {
    this.websocketService.sendToCase(data.caseId, 'case:viewed', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit case activity event
   */
  emitCaseActivity(data: {
    caseId: string;
    userId: string;
    activityType: string;
    metadata?: Record<string, any>;
  }): void {
    this.websocketService.sendToCase(data.caseId, 'case:activity', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}
