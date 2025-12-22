// types/financial.ts
// Auto-generated from models.ts split

import {
  BaseEntity, UserId, 
  EntityId, 
  CaseId, Money} from './primitives';
import {
  BillingModel,  LedesActivityCode} from './enums';

// --- CLUSTER 3: FINANCIAL & BILLING ---
export interface FeeAgreement { type: BillingModel; rate?: Money; contingencyPercent?: number; retainerRequired?: Money; splitRules?: SplitBillingRule[]; }
export interface SplitBillingRule { clientId: string; percentage: number; }
export interface RateTable extends BaseEntity { timekeeperId: string; rate: Money; effectiveDate: string; expiryDate?: string; level: string; }
export interface TimeEntry extends BaseEntity { 
  // Core fields (aligned with backend TimeEntry entity)
  caseId: CaseId; // Backend: varchar (case_id)
  userId: UserId; // Backend: varchar (user_id)
  date: string; // Backend: date (required)
  duration: number; // Backend: decimal(10,2) in hours
  description: string; // Backend: text (required)
  activity?: string; // Backend: varchar(100) e.g., "Research", "Court Appearance"
  ledesCode?: string; // Backend: varchar(20) LEDES billing code
  rate: number; // Backend: decimal(10,2) hourly rate
  total: number; // Backend: decimal(10,2) duration * rate
  status: 'Draft' | 'Submitted' | 'Approved' | 'Billed' | 'Written Off' | string; // Backend: enum TimeEntryStatus
  billable: boolean; // Backend: boolean, default true
  invoiceId?: string; // Backend: uuid
  rateTableId?: string; // Backend: uuid
  internalNotes?: string; // Backend: text
  taskCode?: string; // Backend: varchar(255)
  discount?: number; // Backend: decimal(5,2) percentage
  discountedTotal?: number; // Backend: decimal(10,2)
  approvedBy?: string; // Backend: uuid
  approvedAt?: string; // Backend: timestamp
  billedBy?: string; // Backend: uuid
  billedAt?: string; // Backend: timestamp
  
  // Frontend-specific
  ledesActivity?: LedesActivityCode; // Alias for ledesCode
}
export interface TimeEntryPayload { caseId: string; date: string; duration: number; description: string; rate: number; total: number; status: 'Unbilled'; }
export interface Invoice extends BaseEntity { 
  // Core fields (aligned with backend Invoice entity)
  invoiceNumber: string; // Backend: varchar unique (required)
  caseId: CaseId; // Backend: varchar (case_id)
  clientId: string; // Backend: varchar (client_id)
  clientName: string; // Backend: varchar(255)
  matterDescription: string; // Backend: varchar(500)
  invoiceDate: string; // Backend: date (required)
  dueDate: string; // Backend: date (required)
  periodStart?: string; // Backend: date
  periodEnd?: string; // Backend: date
  billingModel: 'Hourly' | 'Fixed Fee' | 'Contingency' | 'Hybrid' | 'Retainer'; // Backend: enum BillingModel
  status: 'Draft' | 'Sent' | 'Viewed' | 'Partial' | 'Paid' | 'Overdue' | 'Written Off' | string; // Backend: enum InvoiceStatus
  subtotal: number; // Backend: decimal(10,2), default 0
  taxAmount: number; // Backend: decimal(10,2), default 0
  taxRate?: number; // Backend: decimal(5,2), default 0
  discountAmount: number; // Backend: decimal(10,2), default 0
  totalAmount: number; // Backend: decimal(10,2), default 0
  paidAmount: number; // Backend: decimal(10,2), default 0
  balanceDue: number; // Backend: decimal(10,2), default 0
  timeCharges: number; // Backend: decimal(10,2), default 0
  expenseCharges: number; // Backend: decimal(10,2), default 0
  notes?: string; // Backend: text
  terms?: string; // Backend: text
  billingAddress?: string; // Backend: varchar(500)
  jurisdiction?: string; // Backend: varchar(50)
  currency: string; // Backend: varchar(3), default 'USD'
  sentAt?: string; // Backend: timestamp
  sentBy?: string; // Backend: uuid
  viewedAt?: string; // Backend: timestamp
  paidAt?: string; // Backend: timestamp
  paymentMethod?: string; // Backend: varchar(100)
  paymentReference?: string; // Backend: varchar(255)
  
  // Frontend-specific (legacy)
  client?: string; // Alias for clientName
  matter?: string; // Alias for matterDescription
  date?: string; // Alias for invoiceDate
  amount?: number; // Alias for totalAmount
  items?: string[];
  taxJurisdiction?: string; // Alias for jurisdiction
}
export interface TrustTransaction extends BaseEntity { accountId: string; type: 'Deposit' | 'Withdrawal'; amount: Money; date: string; checkNumber?: string; clearedDate?: string; description: string; }
export interface FirmExpense extends BaseEntity { date: string; category: string; description: string; amount: number; status: 'Paid' | 'Pending'; vendor: string; }
export interface TrustSubLedger { id: string; name: string; balance: Money; lastReconciled: string; accountId?: string; }

// Ledger Transaction with Receipt Support
export interface LedgerTransaction extends BaseEntity {
  account: 'Operating' | 'Trust' | 'Retainer';
  type: 'Income' | 'Expense' | 'Deposit' | 'Withdrawal' | 'Transfer';
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
  PARTNER = 'Partner',
  SENIOR_ASSOCIATE = 'Senior Associate',
  ASSOCIATE = 'Associate',
  PARALEGAL = 'Paralegal',
  LEGAL_ASSISTANT = 'Legal Assistant',
  INTERN = 'Intern'
}

export enum EmployeeStatus {
  ACTIVE = 'Active',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated'
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
  VACATION = 'Vacation',
  SICK = 'Sick',
  PERSONAL = 'Personal',
  BEREAVEMENT = 'Bereavement',
  JURY_DUTY = 'Jury Duty',
  OTHER = 'Other'
}

export enum TimeOffStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  DENIED = 'Denied',
  CANCELLED = 'Cancelled'
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
  INDIVIDUAL = 'individual',
  CORPORATION = 'corporation',
  PARTNERSHIP = 'partnership',
  LLC = 'llc',
  NONPROFIT = 'nonprofit',
  GOVERNMENT = 'government',
  OTHER = 'other'
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROSPECTIVE = 'prospective',
  FORMER = 'former',
  BLOCKED = 'blocked'
}

export enum PaymentTerms {
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  DUE_ON_RECEIPT = 'due_on_receipt',
  CUSTOM = 'custom'
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
  customFields?: Record<string, any>; // Backend: jsonb
  tags?: string[]; // Backend: jsonb
  notes?: string; // Backend: text
  metadata?: Record<string, any>; // Backend: jsonb
  
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

