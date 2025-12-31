import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2} from '@nestjs/event-emitter';

export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  timestamp: Date;
  data: unknown;
  userId?: string;
  correlationId?: string;
}

/**
 * ╔=================================================================================================================╗
 * ║EVENTBUS                                                                                                         ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class EventBusService implements OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  onModuleDestroy() {
    this.logger.log('Cleaning up event bus...');
    
    // Get listener counts before cleanup
    const eventNames = this.eventEmitter.eventNames();
    const totalListeners = eventNames.reduce((sum, event) => {
      return sum + this.eventEmitter.listenerCount(event);
    }, 0);
    
    // Remove all listeners to prevent memory leaks
    this.eventEmitter.removeAllListeners();
    
    this.logger.log(`Event bus cleanup complete (removed ${totalListeners} listeners for ${eventNames.length} events)`);
  }

  /**
   * Publish a domain event
   */
  async publish(event: DomainEvent): Promise<void> {
    this.logger.debug(`Publishing event: ${event.eventType}`, {
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
    });

    this.eventEmitter.emit(event.eventType, event);
  }

  /**
   * Publish multiple events
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Subscribe to an event
   */
  subscribe(eventType: string, handler: (event: DomainEvent) => void): void {
    this.eventEmitter.on(eventType, handler);
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(eventType: string, handler: (event: DomainEvent) => void): void {
    this.eventEmitter.off(eventType, handler);
  }
}

// Common domain events
export const DomainEvents = {
  // Case events
  CASE_CREATED: 'case.created',
  CASE_UPDATED: 'case.updated',
  CASE_CLOSED: 'case.closed',
  CASE_REOPENED: 'case.reopened',

  // Document events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_UPDATED: 'document.updated',
  DOCUMENT_DELETED: 'document.deleted',
  DOCUMENT_PROCESSED: 'document.processed',

  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',

  // Billing events
  INVOICE_CREATED: 'invoice.created',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',
  TIME_ENTRY_LOGGED: 'time_entry.logged',

  // Discovery events
  DISCOVERY_REQUEST_CREATED: 'discovery_request.created',
  DISCOVERY_RESPONSE_SUBMITTED: 'discovery_response.submitted',

  // Compliance events
  CONFLICT_CHECK_INITIATED: 'conflict_check.initiated',
  CONFLICT_CHECK_COMPLETED: 'conflict_check.completed',
  AUDIT_TRAIL_ENTRY: 'audit_trail.entry',

  // Communication events
  MESSAGE_SENT: 'message.sent',
  NOTIFICATION_CREATED: 'notification.created',
  EMAIL_SENT: 'email.sent',

  // Task events
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',
  TASK_OVERDUE: 'task.overdue',
};
