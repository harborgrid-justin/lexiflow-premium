/**
 * Billing Event Handlers
 * Real-time event handlers for billing-related operations
 */

import { Injectable, Logger } from '@nestjs/common';
import { WebSocketService } from '../websocket.service';
import type {
  BillingInvoiceCreatedEvent,
  BillingPaymentReceivedEvent,
  BillingTimeEntryCreatedEvent,
} from './event-types';

/**
 * Billing Event Emitter
 * Handles broadcasting of billing-related events
 */
@Injectable()
export class BillingEventEmitter {
  private logger = new Logger('BillingEventEmitter');

  constructor(private websocketService: WebSocketService) {}

  /**
   * Emit invoice created event
   */
  emitInvoiceCreated(event: BillingInvoiceCreatedEvent): void {
    this.logger.log(`Emitting invoice created: ${event.invoiceId}`);
    this.websocketService.broadcastBillingInvoiceCreated(event);
  }

  /**
   * Emit payment received event
   */
  emitPaymentReceived(event: BillingPaymentReceivedEvent): void {
    this.logger.log(`Emitting payment received: ${event.paymentId}`);
    this.websocketService.broadcastBillingPaymentReceived(event);
  }

  /**
   * Emit time entry created event
   */
  emitTimeEntryCreated(event: BillingTimeEntryCreatedEvent): void {
    this.logger.log(`Emitting time entry created: ${event.timeEntryId}`);
    this.websocketService.broadcastBillingTimeEntryCreated(event);
  }

  /**
   * Emit billing reminder event
   */
  emitBillingReminder(data: {
    invoiceId: string;
    caseId: string;
    dueDate: string;
    amount: number;
    recipientUserId: string;
  }): void {
    this.logger.log(`Emitting billing reminder: ${data.invoiceId}`);
    this.websocketService.broadcastBillingReminder({
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit invoice status changed event
   */
  emitInvoiceStatusChanged(data: {
    invoiceId: string;
    caseId: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
  }): void {
    this.logger.log(
      `Emitting invoice status changed: ${data.invoiceId} (${data.oldStatus} -> ${data.newStatus})`,
    );
    this.websocketService.sendToCase(
      data.caseId,
      'billing:invoice_status_changed',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit expense created event
   */
  emitExpenseCreated(data: {
    expenseId: string;
    caseId: string;
    amount: number;
    description: string;
    createdBy: string;
  }): void {
    this.logger.log(`Emitting expense created: ${data.expenseId}`);
    this.websocketService.sendToCase(data.caseId, 'billing:expense_created', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit time entry updated event
   */
  emitTimeEntryUpdated(data: {
    timeEntryId: string;
    caseId: string;
    userId: string;
    changes: Record<string, any>;
  }): void {
    this.logger.log(`Emitting time entry updated: ${data.timeEntryId}`);
    this.websocketService.sendToCase(
      data.caseId,
      'billing:time_entry_updated',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
    this.websocketService.sendToUser(
      data.userId,
      'billing:time_entry_updated',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit payment failed event
   */
  emitPaymentFailed(data: {
    invoiceId: string;
    paymentId: string;
    reason: string;
    recipientUserId: string;
  }): void {
    this.logger.log(`Emitting payment failed: ${data.paymentId}`);
    this.websocketService.sendToUser(data.recipientUserId, 'billing:payment_failed', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit budget alert event
   */
  emitBudgetAlert(data: {
    caseId: string;
    budgetLimit: number;
    currentAmount: number;
    percentageUsed: number;
    alertType: 'warning' | 'critical';
    recipientUserIds: string[];
  }): void {
    this.logger.log(
      `Emitting budget alert for case ${data.caseId}: ${data.percentageUsed}%`,
    );

    const eventData = {
      caseId: data.caseId,
      budgetLimit: data.budgetLimit,
      currentAmount: data.currentAmount,
      percentageUsed: data.percentageUsed,
      alertType: data.alertType,
      timestamp: new Date().toISOString(),
    };

    // Send to case room
    this.websocketService.sendToCase(data.caseId, 'billing:budget_alert', eventData);

    // Send to specific users
    data.recipientUserIds.forEach((userId) => {
      this.websocketService.sendToUser(userId, 'billing:budget_alert', eventData);
    });
  }
}
