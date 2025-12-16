// types/financial.ts
// Auto-generated from models.ts split

import {
  BaseEntity, UserId, OrgId, GroupId, DocumentId, EvidenceId,
  TaskId, EntityId, PartyId, MotionId, DocketId, ProjectId, 
  WorkflowTemplateId, CaseId, Money, JurisdictionObject
} from './primitives';
import {
  CaseStatus, UserRole, MatterType, BillingModel,
  OrganizationType, RiskCategory, RiskLevel, RiskStatus,
  CommunicationType, CommunicationDirection, ServiceStatus,
  ExhibitStatus, ExhibitParty, MotionType, MotionStatus, MotionOutcome,
  DocketEntryType, DiscoveryType, DiscoveryStatus,
  EvidenceType, AdmissibilityStatus, ConferralResult,
  ConferralMethod, NavCategory, TaskStatus, StageStatus, LegalRuleType, 
  ServiceMethod, EntityType, EntityRole, CurrencyCode, LedesActivityCode, 
  OcrStatus, TaskDependencyType
} from './enums';
import { LucideIcon } from 'lucide-react';
import type { FC, LazyExoticComponent } from 'react';

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
export interface Employee extends BaseEntity {
  // Core fields (aligned with backend Employee entity)
  firstName: string; // Backend: varchar (required)
  lastName: string; // Backend: varchar (required)
  fullName?: string; // Backend: computed getter
  email: string; // Backend: varchar unique (required)
  role: 'Partner' | 'Senior Associate' | 'Associate' | 'Junior Associate' | 'Paralegal' | 'Legal Assistant' | 'Administrator' | 'Other'; // Backend: enum EmployeeRole
  department?: string; // Backend: varchar
  phone?: string; // Backend: varchar
  hireDate?: string; // Backend: timestamp
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated'; // Backend: enum EmployeeStatus
  billingRate?: number; // Backend: decimal(10,2)
  targetBillableHours?: number; // Backend: int
  timeOffRequests?: any[]; // Backend: OneToMany relation
}

export interface Client extends BaseEntity { id: EntityId; name: string; industry: string; status: string; totalBilled: number; matters: CaseId[]; trustSubLedgers?: TrustSubLedger[]; taxId?: string; billingGuidelineId?: string; }

