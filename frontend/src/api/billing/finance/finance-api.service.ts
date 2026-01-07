/**
 * Billing Finance API Service
 * Main service facade combining all billing operations
 */

import { analyticsService } from "./analytics.service";
import { invoiceService } from "./invoice.service";
import { timeEntryService } from "./time-entry.service";
import { trustAccountService } from "./trust-account.service";

export class BillingApiService {
  // Service instances
  private timeEntry = timeEntryService;
  private invoice = invoiceService;
  private trustAccount = trustAccountService;
  private analytics = analyticsService;

  constructor() {
    this.logInitialization();
  }

  private logInitialization(): void {
    console.log(
      "[BillingApiService] Initialized with Backend API (PostgreSQL)"
    );
  }

  // Time Entry Operations - delegate to timeEntryService
  getTimeEntries = this.timeEntry.getTimeEntries.bind(this.timeEntry);
  getTimeEntryById = this.timeEntry.getTimeEntryById.bind(this.timeEntry);
  addTimeEntry = this.timeEntry.addTimeEntry.bind(this.timeEntry);
  addBulkTimeEntries = this.timeEntry.addBulkTimeEntries.bind(this.timeEntry);
  updateTimeEntry = this.timeEntry.updateTimeEntry.bind(this.timeEntry);
  approveTimeEntry = this.timeEntry.approveTimeEntry.bind(this.timeEntry);
  billTimeEntry = this.timeEntry.billTimeEntry.bind(this.timeEntry);
  getUnbilledTimeEntries = this.timeEntry.getUnbilledTimeEntries.bind(
    this.timeEntry
  );
  getTimeEntryTotals = this.timeEntry.getTimeEntryTotals.bind(this.timeEntry);
  deleteTimeEntry = this.timeEntry.deleteTimeEntry.bind(this.timeEntry);

  // Invoice Operations - delegate to invoiceService
  getInvoices = this.invoice.getInvoices.bind(this.invoice);
  createInvoice = this.invoice.createInvoice.bind(this.invoice);
  updateInvoice = this.invoice.updateInvoice.bind(this.invoice);
  sendInvoice = this.invoice.sendInvoice.bind(this.invoice);

  // Trust Account Operations - delegate to trustAccountService
  getTrustAccounts = this.trustAccount.getTrustAccounts.bind(this.trustAccount);
  getTrustAccount = this.trustAccount.getTrustAccount.bind(this.trustAccount);
  createTrustAccount = this.trustAccount.createTrustAccount.bind(
    this.trustAccount
  );
  updateTrustAccount = this.trustAccount.updateTrustAccount.bind(
    this.trustAccount
  );
  deleteTrustAccount = this.trustAccount.deleteTrustAccount.bind(
    this.trustAccount
  );
  getTrustTransactions = this.trustAccount.getTrustTransactions.bind(
    this.trustAccount
  );
  createTrustTransaction = this.trustAccount.createTrustTransaction.bind(
    this.trustAccount
  );
  depositTrustFunds = this.trustAccount.depositTrustFunds.bind(
    this.trustAccount
  );
  withdrawTrustFunds = this.trustAccount.withdrawTrustFunds.bind(
    this.trustAccount
  );
  getTrustAccountBalance = this.trustAccount.getTrustAccountBalance.bind(
    this.trustAccount
  );
  getLowBalanceTrustAccounts =
    this.trustAccount.getLowBalanceTrustAccounts.bind(this.trustAccount);

  // Analytics Operations - delegate to analyticsService
  getWIPStats = this.analytics.getWIPStats.bind(this.analytics);
  getRealizationStats = this.analytics.getRealizationStats.bind(this.analytics);
  getRates = this.analytics.getRates.bind(this.analytics);
  getOverviewStats = this.analytics.getOverviewStats.bind(this.analytics);
  getFinancialPerformance = this.analytics.getFinancialPerformance.bind(
    this.analytics
  );
  getTopAccounts = this.analytics.getTopAccounts.bind(this.analytics);
}
