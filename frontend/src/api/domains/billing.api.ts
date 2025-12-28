/**
 * Billing & Finance Domain API Services
 * Time entries, invoices, expenses, fee agreements, rate tables, trust accounts
 */

import { BillingApiService } from '../billing/billing-api';
import { TimeEntriesApiService } from '../billing/time-entries-api';
import { InvoicesApiService } from '../billing/invoices-api';
import { ExpensesApiService } from '../billing/expenses-api';
import { FeeAgreementsApiService } from '../billing/fee-agreements-api';
import { RateTablesApiService } from '../billing/rate-tables-api';
import { TrustAccountsApiService } from '../billing/trust-accounts-api';

// Export service classes
export {
  BillingApiService,
  TimeEntriesApiService,
  InvoicesApiService,
  ExpensesApiService,
  FeeAgreementsApiService,
  RateTablesApiService,
  TrustAccountsApiService,
};

// Export singleton instances
export const billingApi = {
  billing: new BillingApiService(),
  timeEntries: new TimeEntriesApiService(),
  invoices: new InvoicesApiService(),
  expenses: new ExpensesApiService(),
  feeAgreements: new FeeAgreementsApiService(),
  rateTables: new RateTablesApiService(),
  trustAccounts: new TrustAccountsApiService(),
} as const;
