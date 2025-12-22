/**
 * InvoiceStatusChangedHandler - Billing -> Workflow/Audit Integration
 * 
 * Responsibility: Deploy collection workflows and log payments to blockchain
 * Integration: Opp #5 from architecture docs
 */

import { BaseEventHandler } from './BaseEventHandler';
import { ChainService } from '../../infrastructure/chainService';
import type { SystemEventPayloads, IntegrationResult } from '../../../types/integration-types';
import type { UserId } from '../../../types';
import { SystemEventType } from '../../../types/integration-types';

export class InvoiceStatusChangedHandler extends BaseEventHandler<SystemEventPayloads[typeof SystemEventType.INVOICE_STATUS_CHANGED]> {
  readonly eventType = SystemEventType.INVOICE_STATUS_CHANGED;
  
  async handle(payload: SystemEventPayloads[typeof SystemEventType.INVOICE_STATUS_CHANGED]): Promise<IntegrationResult> {
    const actions: string[] = [];
    const errors: string[] = [];
    const { invoice } = payload;
    
    // Handle overdue invoices
    if (invoice.status === 'Overdue') {
      await this.handleOverdueInvoice(invoice, actions, errors);
    }
    
    // Handle paid invoices
    if (invoice.status === 'Paid') {
      await this.logPaymentToBlockchain(invoice, actions);
    }
    
    return errors.length > 0 
      ? this.createError(errors, actions)
      : this.createSuccess(actions);
  }
  
  private async handleOverdueInvoice(
    invoice: SystemEventPayloads[typeof SystemEventType.INVOICE_STATUS_CHANGED]['invoice'],
    actions: string[],
    errors: string[]
  ): Promise<void> {
    const { DataService } = await import('../../data/dataService');
    
    // Check if workflow services are available
    if (!DataService.playbooks || !DataService.workflow || typeof DataService.workflow.deploy !== 'function') {
      console.warn('[InvoiceHandler] Workflow service not available');
      actions.push('Overdue invoice detected (workflow service unavailable)');
      return;
    }
    
    try {
      const collectionTemplate = await DataService.playbooks.getByIndex('type', 'collection');
      
      if (collectionTemplate && collectionTemplate.length > 0) {
        await DataService.workflow.deploy(collectionTemplate[0].id, { caseId: invoice.caseId });
        actions.push('Deployed Collections Workflow');
      } else {
        console.warn('[InvoiceHandler] No collection workflow template found');
        actions.push('Overdue invoice detected (no collection workflow available)');
      }
    } catch (err: unknown) {
      console.error('[InvoiceHandler] Failed to deploy collection workflow:', err);
      errors.push(`Collection workflow deployment failed: ${err.message}`);
    }
  }
  
  private async logPaymentToBlockchain(
    invoice: SystemEventPayloads[typeof SystemEventType.INVOICE_STATUS_CHANGED]['invoice'],
    actions: string[]
  ): Promise<void> {
    const prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    
    await ChainService.createEntry({
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('userName') || 'System',
      userId: (localStorage.getItem('userId') || 'system') as UserId,
      action: 'INVOICE_PAID',
      resource: `Invoice/${invoice.id}`,
      ip: 'internal',
      newValue: invoice.amount
    }, prevHash);
    
    actions.push('Logged INVOICE_PAID to immutable ledger');
  }
}
