/**
 * Billing & Finance Domain API Services
 * Time entries, invoices, expenses, fee agreements, rate tables, trust accounts
 */

import { BillingApiService } from '@/api';
import { TimeEntriesApiService } from '@/api';
import { InvoicesApiService } from '@/api';
import { ExpensesApiService } from '@/api';
import { FeeAgreementsApiService } from '@/api';
import { RateTablesApiService } from '@/api';
import { TrustAccountsApiService } from '@/api';

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
