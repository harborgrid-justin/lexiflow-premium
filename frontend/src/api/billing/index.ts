/**
 * Billing & Financial Management API Services
 * Time entries, invoices, expenses, fee agreements, and trust accounts
 */

export { BillingAnalyticsApiService } from "./billing-analytics-api";
export { BILLING_QUERY_KEYS, BillingApiService } from "./billing-api";
export {
  ExpensesApiService,
  type CreateExpenseDto,
  type ExpenseFilters,
  type ExpenseTotals,
  type UpdateExpenseDto,
} from "./expenses-api";
export { FeeAgreementsApiService } from "./fee-agreements-api";
export {
  InvoicesApiService,
  type CreateInvoiceDto,
  type InvoiceFilters,
  type InvoiceItem,
} from "./invoices-api";
export { RateTablesApiService } from "./rate-tables-api";
export {
  TimeEntriesApiService,
  type BulkOperationResult,
  type BulkTimeEntryDto,
  type CreateTimeEntryDto,
  type TimeEntryFilters,
  type TimeEntryTotals,
  type UpdateTimeEntryDto,
} from "./time-entries-api";
export {
  TrustAccountsApiService,
  trustAccountsApi,
} from "./trust-accounts-api";
