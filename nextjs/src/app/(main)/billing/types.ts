/**
 * Billing Module Types
 *
 * Comprehensive TypeScript definitions for the billing module.
 * Follows Next.js 16 conventions and integrates with backend API.
 *
 * @module billing/types
 */

// =============================================================================
// Primitive Types
// =============================================================================

export type EntityId = string;
export type CaseId = string;
export type UserId = string;
export type Money = number;

// =============================================================================
// Enums
// =============================================================================

export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled',
  PARTIALLY_PAID = 'Partially Paid',
}

export enum TimeEntryStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  BILLED = 'Billed',
  REJECTED = 'Rejected',
}

export enum ExpenseStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  BILLED = 'Billed',
  REIMBURSED = 'Reimbursed',
}

export enum PaymentMethod {
  CHECK = 'Check',
  WIRE = 'Wire',
  CREDIT_CARD = 'Credit Card',
  ACH = 'ACH',
  CASH = 'Cash',
}

export enum BillingModel {
  HOURLY = 'Hourly',
  FIXED_FEE = 'Fixed Fee',
  CONTINGENCY = 'Contingency',
  HYBRID = 'Hybrid',
  RETAINER = 'Retainer',
}

export enum TrustAccountType {
  IOLTA = 'iolta',
  CLIENT_TRUST = 'client_trust',
  OPERATING = 'operating',
}

export enum TrustAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CLOSED = 'closed',
  SUSPENDED = 'suspended',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  INTEREST = 'interest',
  FEE = 'fee',
  ADJUSTMENT = 'adjustment',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CLEARED = 'cleared',
  RECONCILED = 'reconciled',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

// =============================================================================
// Billing Dashboard Types
// =============================================================================

export interface BillingMetrics {
  totalRevenue: Money;
  collectedRevenue: Money;
  outstandingRevenue: Money;
  overdueAmount: Money;
  wipAmount: Money;
  trustBalance: Money;
  invoiceCount: number;
  paidInvoiceCount: number;
  overdueInvoiceCount: number;
  unbilledTimeHours: number;
  unbilledExpensesAmount: Money;
  collectionRate: number;
  averageDaysToPayment: number;
  periodStart: string;
  periodEnd: string;
}

export interface BillingPeriod {
  value: string;
  label: string;
  startDate: string;
  endDate: string;
}

// =============================================================================
// Invoice Types
// =============================================================================

export interface InvoiceLineItem {
  id: EntityId;
  invoiceId: EntityId;
  type: 'time' | 'expense' | 'fee' | 'discount';
  description: string;
  quantity: number;
  rate: Money;
  amount: Money;
  date?: string;
  timeEntryId?: EntityId;
  expenseId?: EntityId;
}

export interface InvoicePayment {
  id: EntityId;
  invoiceId: EntityId;
  amount: Money;
  date: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdBy?: UserId;
}

export interface Invoice {
  id: EntityId;
  invoiceNumber: string;
  caseId: CaseId;
  clientId: EntityId;
  clientName: string;
  matterDescription: string;
  invoiceDate: string;
  dueDate: string;
  periodStart?: string;
  periodEnd?: string;
  billingModel: BillingModel;
  status: InvoiceStatus;
  subtotal: Money;
  taxAmount: Money;
  taxRate?: number;
  discountAmount: Money;
  totalAmount: Money;
  paidAmount: Money;
  balanceDue: Money;
  timeCharges: Money;
  expenseCharges: Money;
  notes?: string;
  terms?: string;
  billingAddress?: string;
  jurisdiction?: string;
  currency: string;
  sentAt?: string;
  sentBy?: UserId;
  viewedAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  lineItems?: InvoiceLineItem[];
  payments?: InvoicePayment[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceStats {
  total: number;
  outstanding: number;
  paid: number;
  overdue: number;
  totalAmount: Money;
  paidAmount: Money;
  outstandingAmount: Money;
}

/**
 * Input for creating a line item
 */
export interface CreateLineItemInput {
  type: 'time' | 'expense' | 'fee' | 'discount';
  description: string;
  quantity: number;
  rate: Money;
  amount: Money;
  date?: string;
  timeEntryId?: EntityId;
  expenseId?: EntityId;
}

export interface CreateInvoiceInput {
  caseId: CaseId;
  clientId: EntityId;
  invoiceDate: string;
  dueDate: string;
  periodStart?: string;
  periodEnd?: string;
  billingModel: BillingModel;
  notes?: string;
  terms?: string;
  taxRate?: number;
  taxAmount?: Money;
  discountAmount?: Money;
  subtotal?: Money;
  totalAmount?: Money;
  lineItems?: CreateLineItemInput[];
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {
  status?: InvoiceStatus;
}

export interface RecordPaymentInput {
  amount: Money;
  date: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface InvoiceFilters {
  caseId?: string;
  clientId?: string;
  status?: InvoiceStatus | string;
  startDate?: string;
  endDate?: string;
}

// =============================================================================
// Time Entry Types
// =============================================================================

export interface TimeEntry {
  id: EntityId;
  caseId: CaseId;
  userId: UserId;
  date: string;
  duration: number;
  description: string;
  activity?: string;
  ledesCode?: string;
  rate: Money;
  total: Money;
  status: TimeEntryStatus;
  billable: boolean;
  invoiceId?: EntityId;
  rateTableId?: EntityId;
  internalNotes?: string;
  taskCode?: string;
  discount?: number;
  discountedTotal?: Money;
  approvedBy?: UserId;
  approvedAt?: string;
  billedBy?: UserId;
  billedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Computed/joined fields
  caseName?: string;
  userName?: string;
  clientName?: string;
}

export interface CreateTimeEntryInput {
  caseId: CaseId;
  userId: UserId;
  date: string;
  duration: number;
  description: string;
  rate: Money;
  billable?: boolean;
  activity?: string;
  ledesCode?: string;
  taskCode?: string;
  internalNotes?: string;
}

export interface UpdateTimeEntryInput extends Partial<CreateTimeEntryInput> {
  status?: TimeEntryStatus;
}

export interface TimeEntryFilters {
  caseId?: string;
  userId?: string;
  status?: TimeEntryStatus | string;
  billable?: boolean | string;
  startDate?: string;
  endDate?: string;
}

export interface BulkApproveResult {
  success: number;
  failed: number;
  errors?: string[];
}

// =============================================================================
// Expense Types
// =============================================================================

export interface Expense {
  id: EntityId;
  caseId: CaseId;
  userId: UserId;
  date: string;
  category: string;
  description: string;
  amount: Money;
  quantity: number;
  unitCost: Money;
  status: ExpenseStatus;
  billable: boolean;
  invoiceId?: EntityId;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
  approvedBy?: UserId;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Computed/joined fields
  caseName?: string;
  userName?: string;
  clientName?: string;
}

export interface CreateExpenseInput {
  caseId: CaseId;
  userId: UserId;
  date: string;
  category: string;
  description: string;
  amount: Money;
  quantity?: number;
  unitCost?: Money;
  billable?: boolean;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  status?: ExpenseStatus;
}

export interface ExpenseFilters {
  caseId?: string;
  userId?: string;
  category?: string;
  status?: ExpenseStatus | string;
  billable?: boolean | string;
  startDate?: string;
  endDate?: string;
}

export const EXPENSE_CATEGORIES = [
  'Filing Fees',
  'Court Costs',
  'Postage & Delivery',
  'Copying & Printing',
  'Travel',
  'Lodging',
  'Meals',
  'Expert Witness Fees',
  'Deposition Costs',
  'Process Server Fees',
  'Research Services',
  'Mediation Fees',
  'Recording Fees',
  'Investigation',
  'Technology & Software',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

// =============================================================================
// Rate Table Types
// =============================================================================

export interface Rate {
  id: EntityId;
  rateTableId: EntityId;
  timekeeperId: EntityId;
  timekeeperName: string;
  level: string;
  rate: Money;
  effectiveDate: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RateTable {
  id: EntityId;
  name: string;
  description?: string;
  clientId?: EntityId;
  clientName?: string;
  isDefault: boolean;
  currency: string;
  effectiveDate: string;
  expiryDate?: string;
  rates: Rate[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateTableInput {
  name: string;
  description?: string;
  clientId?: EntityId;
  isDefault?: boolean;
  currency?: string;
  effectiveDate: string;
  expiryDate?: string;
}

export interface UpdateRateTableInput extends Partial<CreateRateTableInput> {}

export interface CreateRateInput {
  timekeeperId: EntityId;
  level: string;
  rate: Money;
  effectiveDate: string;
  expiryDate?: string;
}

export interface UpdateRateInput extends Partial<CreateRateInput> {}

// =============================================================================
// Trust Account Types
// =============================================================================

export interface TrustAccount {
  id: EntityId;
  accountNumber: string;
  accountName: string;
  accountType: TrustAccountType;
  clientId: EntityId;
  clientName: string;
  caseId?: CaseId;
  balance: Money;
  currency: string;
  minimumBalance?: Money;
  interestBearing: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  routingNumber?: string;
  stateBarApproved?: boolean;
  jurisdiction?: string;
  ioltalProgramId?: string;
  lastReconciledDate?: string;
  status: TrustAccountStatus;
  openedDate?: string;
  closedDate?: string;
  purpose?: string;
  notes?: string;
  responsibleAttorney?: EntityId;
  createdAt: string;
  updatedAt: string;
}

export interface TrustTransaction {
  id: EntityId;
  trustAccountId: EntityId;
  caseId?: CaseId;
  clientId?: EntityId;
  transactionType: TransactionType;
  transactionDate: string;
  amount: Money;
  balanceAfter: Money;
  description: string;
  status: TransactionStatus;
  referenceNumber?: string;
  checkNumber?: string;
  payee?: string;
  payor?: string;
  paymentMethod?: string;
  relatedInvoiceId?: EntityId;
  approvedBy?: UserId;
  approvedAt?: string;
  reconciled: boolean;
  reconciledDate?: string;
  reconciledBy?: UserId;
  clearedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  accountName?: string;
  clientName?: string;
}

export interface CreateTrustAccountInput {
  accountNumber: string;
  accountName: string;
  accountType: TrustAccountType;
  clientId: EntityId;
  clientName: string;
  caseId?: CaseId;
  balance?: Money;
  currency?: string;
  bankName?: string;
  bankAccountNumber?: string;
  routingNumber?: string;
  purpose?: string;
  notes?: string;
  responsibleAttorney?: EntityId;
}

export interface DepositInput {
  amount: Money;
  transactionDate: string;
  description: string;
  payorName: string;
  checkNumber?: string;
  matterReference?: string;
}

export interface WithdrawalInput {
  amount: Money;
  transactionDate: string;
  description: string;
  payeeName: string;
  checkNumber?: string;
  purpose: 'payment_to_client' | 'payment_to_vendor' | 'fee_transfer' | 'other';
}

export interface ReconciliationInput {
  reconciliationDate: string;
  bankStatementBalance: Money;
  mainLedgerBalance: Money;
  clientLedgersTotalBalance: Money;
  outstandingChecks?: Array<{ checkNumber: string; amount: Money }>;
  depositsInTransit?: Array<{ reference: string; amount: Money }>;
  notes?: string;
}

export interface TrustAccountFilters {
  clientId?: string;
  status?: TrustAccountStatus | string;
  accountType?: TrustAccountType | string;
}

// =============================================================================
// Server Action Result Types
// =============================================================================

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// Form State Types
// =============================================================================

export interface FormState {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  redirect?: string;
}

// =============================================================================
// Summary Card Types
// =============================================================================

export interface SummaryCardData {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

// =============================================================================
// Chart Data Types
// =============================================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface RevenueChartData {
  period: string;
  billed: Money;
  collected: Money;
  outstanding: Money;
}

export interface UtilizationData {
  userId: UserId;
  userName: string;
  billableHours: number;
  nonBillableHours: number;
  targetHours: number;
  utilizationRate: number;
}

// =============================================================================
// Lookup Types (for dropdowns/selects)
// =============================================================================

export interface CaseLookup {
  id: CaseId;
  name: string;
  clientId: EntityId;
  clientName: string;
}

export interface UserLookup {
  id: UserId;
  name: string;
  email: string;
  role: string;
  defaultRate?: Money;
}

export interface ClientLookup {
  id: EntityId;
  name: string;
  clientNumber: string;
}

// =============================================================================
// AR Aging Types
// =============================================================================

/**
 * AR Aging client with outstanding balance details
 */
export interface ARAgingClient {
  clientId: EntityId;
  clientName: string;
  amount: Money;
  invoiceCount: number;
  oldestInvoiceDate: string;
}

/**
 * AR Aging bucket representing a date range category
 */
export interface ARAgingBucket {
  range: string;
  amount: Money;
  count: number;
  percentage: number;
  clients: ARAgingClient[];
}

/**
 * AR Aging summary statistics
 */
export interface ARAgingSummary {
  totalOutstanding: Money;
  totalInvoiceCount: number;
  averageDaysOutstanding: number;
  buckets: ARAgingBucket[];
}

/**
 * AR Aging filters
 */
export interface ARAgingFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  minAmount?: number;
}

// =============================================================================
// Collections Types
// =============================================================================

/**
 * Collection item status
 */
export enum CollectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PROMISED = 'promised',
  ESCALATED = 'escalated',
  COLLECTED = 'collected',
  WRITE_OFF = 'write_off',
}

/**
 * Collection contact type
 */
export enum ContactType {
  PHONE = 'phone',
  EMAIL = 'email',
  LETTER = 'letter',
  IN_PERSON = 'in_person',
  VOICEMAIL = 'voicemail',
}

/**
 * Contact history entry for collection item
 */
export interface CollectionContact {
  id: EntityId;
  collectionItemId: EntityId;
  contactDate: string;
  contactType: ContactType;
  contactedBy: UserId;
  contactedByName?: string;
  notes: string;
  outcome?: string;
  followUpDate?: string;
  createdAt: string;
}

/**
 * Collection item representing an overdue invoice
 */
export interface CollectionItem {
  id: EntityId;
  clientId: EntityId;
  clientName: string;
  invoiceId: EntityId;
  invoiceNumber: string;
  amount: Money;
  originalAmount: Money;
  daysOverdue: number;
  dueDate: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  status: CollectionStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: UserId;
  assignedToName?: string;
  notes?: string;
  contacts?: CollectionContact[];
  paymentPlanId?: EntityId;
  createdAt: string;
  updatedAt: string;
}

/**
 * Collection item filters
 */
export interface CollectionFilters {
  status?: CollectionStatus | string;
  priority?: string;
  assignedTo?: string;
  clientId?: string;
  minDaysOverdue?: number;
  maxDaysOverdue?: number;
}

/**
 * Input for updating collection item
 */
export interface UpdateCollectionInput {
  status?: CollectionStatus;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: UserId;
  notes?: string;
  nextFollowUpDate?: string;
}

/**
 * Input for logging a collection contact
 */
export interface LogContactInput {
  contactDate: string;
  contactType: ContactType;
  notes: string;
  outcome?: string;
  followUpDate?: string;
}

/**
 * Collection summary statistics
 */
export interface CollectionSummary {
  totalItems: number;
  totalAmount: Money;
  pendingCount: number;
  inProgressCount: number;
  promisedCount: number;
  escalatedCount: number;
  collectedThisMonth: Money;
  averageDaysOverdue: number;
}
