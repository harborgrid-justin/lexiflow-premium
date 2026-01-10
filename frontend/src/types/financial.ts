// types/financial.ts
// Auto-generated from models.ts split

import {
  BillingModel,
  InvoiceStatus,
  LedesActivityCode,
  TimeEntryStatus,
} from "./enums";
import {
  BaseEntity,
  CaseId,
  EntityId,
  MetadataRecord,
  Money,
  UserId,
} from "./primitives";
import { TrustSubLedger } from "./trust-accounts";

// --- CLUSTER 3: FINANCIAL & BILLING ---

/**
 * Split billing rule for multi-client matters
 * Defines percentage allocation across clients
 */
export type SplitBillingRule = {
  readonly clientId: string;
  readonly percentage: number;
};

/**
 * Fee agreement entity
 * Defines billing arrangement and rates for a matter
 *
 * @property type - Billing model (Hourly, Fixed Fee, Contingency, etc.)
 * @property rate - Hourly rate or fixed fee amount
 * @property contingencyPercent - Success fee percentage (0-100)
 * @property retainerRequired - Upfront retainer amount
 * @property splitRules - Multi-client cost allocation rules
 */
export type FeeAgreement = {
  readonly type: BillingModel;
  readonly rate?: Money;
  readonly contingencyPercent?: number;
  readonly retainerRequired?: Money;
  readonly splitRules?: readonly SplitBillingRule[];
};

/**
 * Rate table entity
 * Time-bound billing rate assignments for timekeepers
 *
 * @property effectiveDate - Start date for rate application
 * @property expiryDate - End date (null for current rate)
 * @property level - Seniority level (Partner, Associate, Paralegal)
 */
export type RateTable = BaseEntity & {
  readonly timekeeperId: string;
  readonly rate: Money;
  readonly effectiveDate: string;
  readonly expiryDate?: string;
  readonly level: string;
};
export type PaginationParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Time entry entity
 * @see Backend: time-entries/entities/time-entry.entity.ts
 *
 * Represents billable time with LEDES coding and approval workflow.
 * Aligned with backend TimeEntry entity schema.
 *
 * @property duration - Time in hours (decimal, e.g., 1.5 = 90 minutes)
 * @property rate - Hourly rate in currency units
 * @property total - Calculated amount (duration × rate)
 * @property ledesCode - LEDES Uniform Task-Based Management System code
 * @property billable - Whether entry should be invoiced
 * @property status - Current approval/billing state
 */
export type TimeEntry = BaseEntity & {
  // Core fields (aligned with backend TimeEntry entity)
  readonly caseId: CaseId; // Backend: varchar (case_id)
  readonly userId: UserId; // Backend: varchar (user_id)
  readonly date: string; // Backend: date (required)
  readonly duration: number; // Backend: decimal(10,2) in hours
  readonly description: string; // Backend: text (required)
  readonly activity?: string; // Backend: varchar(100) e.g., "Research", "Court Appearance"
  readonly ledesCode?: string; // Backend: varchar(20) LEDES billing code
  readonly rate: number; // Backend: decimal(10,2) hourly rate
  readonly total: number; // Backend: decimal(10,2) duration * rate
  readonly status: TimeEntryStatus | string; // Backend: enum TimeEntryStatus
  readonly billable: boolean; // Backend: boolean, default true
  readonly invoiceId?: string; // Backend: uuid
  readonly rateTableId?: string; // Backend: uuid
  readonly internalNotes?: string; // Backend: text
  readonly taskCode?: string; // Backend: varchar(255)
  readonly discount?: number; // Backend: decimal(5,2) percentage
  readonly discountedTotal?: number; // Backend: decimal(10,2)
  readonly approvedBy?: string; // Backend: uuid
  readonly approvedAt?: string; // Backend: timestamp
  readonly billedBy?: string; // Backend: uuid
  readonly billedAt?: string; // Backend: timestamp

  // Frontend-specific
  readonly ledesActivity?: LedesActivityCode; // Alias for ledesCode
};
/**
 * Time entry creation payload
 * Simplified DTO for creating unbilled time entries
 */
export type TimeEntryPayload = {
  readonly caseId: string;
  readonly date: string;
  readonly duration: number;
  readonly description: string;
  readonly rate: number;
  readonly total: number;
  readonly status: "Unbilled";
};

/**
 * Invoice billing model type
 */
export type InvoiceBillingModel =
  | "Hourly"
  | "Fixed Fee"
  | "Contingency"
  | "Hybrid"
  | "Retainer";

// InvoiceStatus is exported from enums.ts

/**
 * Invoice entity
 * @see Backend: invoices/entities/invoice.entity.ts
 *
 * Represents client invoices with line items, payments, and status tracking.
 * Aligned with backend Invoice entity schema.
 *
 * @property invoiceNumber - Unique identifier (auto-generated or custom)
 * @property billingModel - Charging structure for this invoice
 * @property status - Current payment/delivery state
 * @property subtotal - Sum of line items before tax/discount
 * @property totalAmount - Final amount due (subtotal + tax - discount)
 * @property balanceDue - Remaining unpaid amount
 * @property currency - ISO 4217 currency code (default: USD)
 */
export type Invoice = BaseEntity & {
  // Core fields (aligned with backend Invoice entity)
  readonly invoiceNumber: string; // Backend: varchar unique (required)
  readonly caseId: CaseId; // Backend: varchar (case_id)
  readonly clientId: string; // Backend: varchar (client_id)
  readonly clientName: string; // Backend: varchar(255)
  readonly matterDescription: string; // Backend: varchar(500)
  readonly invoiceDate: string; // Backend: date (required)
  readonly dueDate: string; // Backend: date (required)
  readonly periodStart?: string; // Backend: date
  readonly periodEnd?: string; // Backend: date
  readonly billingModel: InvoiceBillingModel; // Backend: enum BillingModel
  readonly status: InvoiceStatus | string; // Backend: enum InvoiceStatus
  readonly subtotal: number; // Backend: decimal(10,2), default 0
  readonly taxAmount: number; // Backend: decimal(10,2), default 0
  readonly taxRate?: number; // Backend: decimal(5,2), default 0
  readonly discountAmount: number; // Backend: decimal(10,2), default 0
  readonly totalAmount: number; // Backend: decimal(10,2), default 0
  readonly paidAmount: number; // Backend: decimal(10,2), default 0
  readonly balanceDue: number; // Backend: decimal(10,2), default 0
  readonly timeCharges: number; // Backend: decimal(10,2), default 0
  readonly expenseCharges: number; // Backend: decimal(10,2), default 0
  readonly notes?: string; // Backend: text
  readonly terms?: string; // Backend: text
  readonly billingAddress?: string; // Backend: varchar(500)
  readonly jurisdiction?: string; // Backend: varchar(50)
  readonly currency: string; // Backend: varchar(3), default 'USD'
  readonly sentAt?: string; // Backend: timestamp
  readonly sentBy?: string; // Backend: uuid
  readonly viewedAt?: string; // Backend: timestamp
  readonly paidAt?: string; // Backend: timestamp
  readonly paymentMethod?: string; // Backend: varchar(100)
  readonly paymentReference?: string; // Backend: varchar(255)

  // Frontend-specific (legacy)
  readonly client?: string; // Alias for clientName
  readonly matter?: string; // Alias for matterDescription
  readonly date?: string; // Alias for invoiceDate
  readonly amount?: number; // Alias for totalAmount
  readonly items?: readonly string[];
  readonly taxJurisdiction?: string; // Alias for jurisdiction
};

/**
 * @deprecated Moved to types/trust-accounts.ts for full backend synchronization
 * Use TrustTransactionEntity from types/trust-accounts.ts instead
 * Legacy simple version removed to avoid duplicate export with trust-accounts.ts
 * Import from trust-accounts.ts instead
 */
// export interface TrustTransaction extends BaseEntity {
//   accountId: string;
//   type: 'Deposit' | 'Withdrawal';
//   amount: Money;
//   date: string;
//   checkNumber?: string;
//   clearedDate?: string;
//   description: string;
// }

export interface FirmExpense extends BaseEntity {
  date: string;
  category: string;
  description: string;
  amount: number;
  status: "Paid" | "Pending";
  vendor: string;
  paymentMethod?: string;
}

/**
 * @deprecated Moved to types/trust-accounts.ts for full backend synchronization
 * Use TrustSubLedger from types/trust-accounts.ts instead
 * Legacy version removed to avoid duplicate export with trust-accounts.ts
 * Import from trust-accounts.ts instead
 */
// export interface TrustSubLedger {
//   id: string;
//   name: string;
//   balance: Money;
//   lastReconciled: string;
//   accountId?: string;
// }

// Ledger Transaction with Receipt Support
export interface LedgerTransaction extends BaseEntity {
  account: "Operating" | "Trust" | "Retainer";
  type: "Income" | "Expense" | "Deposit" | "Withdrawal" | "Transfer";
  date: string;
  amount: number;
  description: string;
  receiptFile?: {
    name: string;
    size: number;
    type: string;
    data: string | null; // Base64 or preview URL
  };
}
// Backend Employee entity enums (from hr/dto/create-employee.dto.ts)
export enum EmployeeRole {
  PARTNER = "Partner",
  SENIOR_ASSOCIATE = "Senior Associate",
  ASSOCIATE = "Associate",
  PARALEGAL = "Paralegal",
  LEGAL_ASSISTANT = "Legal Assistant",
  INTERN = "Intern",
}

export enum EmployeeStatus {
  ACTIVE = "Active",
  ON_LEAVE = "On Leave",
  TERMINATED = "Terminated",
}

export interface Employee extends BaseEntity {
  // Core fields (EXACTLY aligned with backend Employee entity)
  firstName: string; // Backend: varchar (required)
  lastName: string; // Backend: varchar (required)
  fullName?: string; // Backend: computed getter
  email: string; // Backend: varchar unique (required)
  role: EmployeeRole; // Backend: enum EmployeeRole
  department?: string; // Backend: varchar
  phone?: string; // Backend: varchar
  hireDate?: string; // Backend: timestamp
  status: EmployeeStatus; // Backend: enum EmployeeStatus (default: ACTIVE)
  billingRate?: number; // Backend: decimal(10,2)
  targetBillableHours?: number; // Backend: int
  timeOffRequests?: unknown[]; // Backend: OneToMany TimeOffRequest relation
}

// Backend: time_off_requests table (hr module)
export enum TimeOffType {
  VACATION = "Vacation",
  SICK = "Sick",
  PERSONAL = "Personal",
  BEREAVEMENT = "Bereavement",
  JURY_DUTY = "Jury Duty",
  OTHER = "Other",
}

export enum TimeOffStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  DENIED = "Denied",
  CANCELLED = "Cancelled",
}

export interface TimeOffRequest extends BaseEntity {
  employeeId: string; // Backend: uuid (required), FK to employees
  employee?: Employee; // Backend: ManyToOne relation
  type: TimeOffType; // Backend: enum TimeOffType
  startDate: string; // Backend: timestamp (required)
  endDate: string; // Backend: timestamp (required)
  reason?: string; // Backend: text
  status: TimeOffStatus; // Backend: enum (default: PENDING)
  approvedBy?: string; // Backend: uuid
  approvedAt?: string; // Backend: timestamp
  denialReason?: string; // Backend: text
}

// Backend: clients table - COMPLETE entity with 40+ fields
// Backend Client entity enums (from clients/entities/client.entity.ts)
export enum ClientType {
  INDIVIDUAL = "individual",
  CORPORATION = "corporation",
  PARTNERSHIP = "partnership",
  LLC = "llc",
  NONPROFIT = "nonprofit",
  GOVERNMENT = "government",
  OTHER = "other",
}

export enum ClientStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PROSPECTIVE = "prospective",
  FORMER = "former",
  BLOCKED = "blocked",
}

export enum PaymentTerms {
  NET_15 = "net_15",
  NET_30 = "net_30",
  NET_45 = "net_45",
  NET_60 = "net_60",
  DUE_ON_RECEIPT = "due_on_receipt",
  CUSTOM = "custom",
}

export interface Client extends BaseEntity {
  id: EntityId;

  // Core Identification
  clientNumber: string; // Backend: client_number varchar(100) unique
  name?: string; // Backend: varchar(255)
  clientType?: ClientType; // Backend: client_type enum
  status: ClientStatus; // Backend: enum (default: active)

  // Contact Information
  email?: string; // Backend: varchar(255)
  phone?: string; // Backend: varchar(50)
  fax?: string; // Backend: varchar(50)
  website?: string; // Backend: varchar(500)

  // Primary Address
  address?: string; // Backend: text
  city?: string; // Backend: varchar(100)
  state?: string; // Backend: varchar(100)
  zipCode?: string; // Backend: zip_code varchar(20)
  country?: string; // Backend: varchar(100)

  // Billing Address (separate from primary)
  billingAddress?: string; // Backend: billing_address text
  billingCity?: string; // Backend: billing_city varchar(100)
  billingState?: string; // Backend: billing_state varchar(100)
  billingZipCode?: string; // Backend: billing_zip_code varchar(20)
  billingCountry?: string; // Backend: billing_country varchar(100)

  // Business Information
  taxId?: string; // Backend: tax_id varchar(100)
  industry?: string; // Backend: varchar(255)
  establishedDate?: string; // Backend: established_date date

  // Primary Contact Person
  primaryContactName?: string; // Backend: primary_contact_name varchar(255)
  primaryContactEmail?: string; // Backend: primary_contact_email varchar(255)
  primaryContactPhone?: string; // Backend: primary_contact_phone varchar(50)
  primaryContactTitle?: string; // Backend: primary_contact_title varchar(100)

  // Account Management
  accountManagerId?: string; // Backend: account_manager_id uuid
  referralSource?: string; // Backend: referral_source varchar(255)
  clientSince?: string; // Backend: client_since date

  // Payment & Billing
  paymentTerms: PaymentTerms; // Backend: payment_terms enum (default: net_30)
  preferredPaymentMethod?: string; // Backend: preferred_payment_method varchar(100)
  creditLimit: number; // Backend: credit_limit decimal(15,2) (default: 0)
  currentBalance: number; // Backend: current_balance decimal(15,2) (default: 0)

  // Financial Metrics
  totalBilled: number; // Backend: total_billed decimal(15,2) (default: 0)
  totalPaid: number; // Backend: total_paid decimal(15,2) (default: 0)
  totalCases: number; // Backend: total_cases int (default: 0)
  activeCases: number; // Backend: active_cases int (default: 0)

  // Flags & Special Handling
  isVip: boolean; // Backend: is_vip boolean (default: false)
  requiresConflictCheck: boolean; // Backend: requires_conflict_check boolean (default: false)
  lastConflictCheckDate?: string; // Backend: last_conflict_check_date date

  // Retainer
  hasRetainer: boolean; // Backend: has_retainer boolean (default: false)
  retainerAmount?: number; // Backend: retainer_amount decimal(15,2)
  retainerBalance?: number; // Backend: retainer_balance decimal(15,2)

  // Extensibility
  customFields?: Record<string, unknown>; // Backend: jsonb
  tags?: string[]; // Backend: jsonb
  notes?: string; // Backend: text
  metadata?: MetadataRecord; // Backend: jsonb

  // Client Portal
  portalToken?: string; // Backend: portal_token varchar(500)
  portalTokenExpiry?: string; // Backend: portal_token_expiry timestamp

  // Relations (OneToMany in backend)
  cases?: unknown[]; // Backend: Case[] relation
  invoices?: unknown[]; // Backend: Invoice[] relation

  // Legacy/Frontend-only fields (backward compatibility)
  matters?: CaseId[]; // Deprecated - use cases relation
  trustSubLedgers?: TrustSubLedger[]; // Frontend extension
  billingGuidelineId?: string; // Frontend extension
}

export interface WIPStat {
  name: string;
  wip: number;
  billed: number;
  totalHours?: number;
  totalFees?: number;
  totalExpenses?: number;
  unbilledCount?: number;
  agedWip?: number;
}

export interface FinancialPerformanceData {
  period: string;
  revenue: number | Array<{ month: string; actual: number; target: number }>;
  expenses: number | Array<{ category: string; value: number }>;
  profit: number;
  realizationRate: number;
  collectionRate: number;
}

export interface OperatingSummary {
  balance: number;
  expensesMtd: number;
  cashFlowMtd: number;
  revenueThisMonth?: number;
  revenueYTD?: number;
  expensesThisMonth?: number;
  expensesYTD?: number;
  netIncome?: number;
  outstandingInvoices?: number;
}
