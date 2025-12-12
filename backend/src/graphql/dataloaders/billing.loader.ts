import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class BillingLoader {
  // Inject BillingServices here
  // constructor(
  //   private readonly timeEntryService: TimeEntryService,
  //   private readonly invoiceService: InvoiceService,
  //   private readonly expenseService: ExpenseService,
  // ) {}

  // Create a DataLoader for loading time entries by case ID
  public readonly batchTimeEntriesByCaseId = new DataLoader(
    async (caseIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const timeEntries = await this.timeEntryService.findByCaseIds([...caseIds]);
      // const timeEntriesByCaseId = new Map<string, any[]>();
      // timeEntries.forEach(entry => {
      //   if (!timeEntriesByCaseId.has(entry.caseId)) {
      //     timeEntriesByCaseId.set(entry.caseId, []);
      //   }
      //   timeEntriesByCaseId.get(entry.caseId)!.push(entry);
      // });
      // return caseIds.map(id => timeEntriesByCaseId.get(id) || []);
      return caseIds.map(() => []);
    },
  );

  // Create a DataLoader for loading time entries by user ID
  public readonly batchTimeEntriesByUserId = new DataLoader(
    async (userIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const timeEntries = await this.timeEntryService.findByUserIds([...userIds]);
      // const timeEntriesByUserId = new Map<string, any[]>();
      // timeEntries.forEach(entry => {
      //   if (!timeEntriesByUserId.has(entry.userId)) {
      //     timeEntriesByUserId.set(entry.userId, []);
      //   }
      //   timeEntriesByUserId.get(entry.userId)!.push(entry);
      // });
      // return userIds.map(id => timeEntriesByUserId.get(id) || []);
      return userIds.map(() => []);
    },
  );

  // Create a DataLoader for loading invoices by case ID
  public readonly batchInvoicesByCaseId = new DataLoader(
    async (caseIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const invoices = await this.invoiceService.findByCaseIds([...caseIds]);
      // const invoicesByCaseId = new Map<string, any[]>();
      // invoices.forEach(invoice => {
      //   if (!invoicesByCaseId.has(invoice.caseId)) {
      //     invoicesByCaseId.set(invoice.caseId, []);
      //   }
      //   invoicesByCaseId.get(invoice.caseId)!.push(invoice);
      // });
      // return caseIds.map(id => invoicesByCaseId.get(id) || []);
      return caseIds.map(() => []);
    },
  );

  // Create a DataLoader for loading invoices by client ID
  public readonly batchInvoicesByClientId = new DataLoader(
    async (clientIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const invoices = await this.invoiceService.findByClientIds([...clientIds]);
      // const invoicesByClientId = new Map<string, any[]>();
      // invoices.forEach(invoice => {
      //   if (!invoicesByClientId.has(invoice.clientId)) {
      //     invoicesByClientId.set(invoice.clientId, []);
      //   }
      //   invoicesByClientId.get(invoice.clientId)!.push(invoice);
      // });
      // return clientIds.map(id => invoicesByClientId.get(id) || []);
      return clientIds.map(() => []);
    },
  );

  // Create a DataLoader for loading expenses by case ID
  public readonly batchExpensesByCaseId = new DataLoader(
    async (caseIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const expenses = await this.expenseService.findByCaseIds([...caseIds]);
      // const expensesByCaseId = new Map<string, any[]>();
      // expenses.forEach(expense => {
      //   if (!expensesByCaseId.has(expense.caseId)) {
      //     expensesByCaseId.set(expense.caseId, []);
      //   }
      //   expensesByCaseId.get(expense.caseId)!.push(expense);
      // });
      // return caseIds.map(id => expensesByCaseId.get(id) || []);
      return caseIds.map(() => []);
    },
  );

  // Load time entries by case ID
  async loadTimeEntriesByCaseId(caseId: string) {
    return this.batchTimeEntriesByCaseId.load(caseId);
  }

  // Load time entries by user ID
  async loadTimeEntriesByUserId(userId: string) {
    return this.batchTimeEntriesByUserId.load(userId);
  }

  // Load invoices by case ID
  async loadInvoicesByCaseId(caseId: string) {
    return this.batchInvoicesByCaseId.load(caseId);
  }

  // Load invoices by client ID
  async loadInvoicesByClientId(clientId: string) {
    return this.batchInvoicesByClientId.load(clientId);
  }

  // Load expenses by case ID
  async loadExpensesByCaseId(caseId: string) {
    return this.batchExpensesByCaseId.load(caseId);
  }
}
