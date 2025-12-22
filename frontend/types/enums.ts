
// types/enums.ts

export enum CaseStatus {
  Open = 'Open',
  Active = 'Active',
  Discovery = 'Discovery',
  Trial = 'Trial',
  Settled = 'Settled',
  Closed = 'Closed',
  Archived = 'Archived',
  OnHold = 'On Hold',
  // Legacy values for backwards compatibility
  PreFiling = 'Pre-Filing',
  Appeal = 'Appeal',
  Transferred = 'Transferred'
}

export type NavCategory = 'Main' | 'Case Work' | 'Litigation Tools' | 'Operations' | 'Knowledge' | 'Admin';
export type AppView = string;

export type UserRole = 'Senior Partner' | 'Associate' | 'Paralegal' | 'Administrator' | 'Client User' | 'Guest';
export type MatterType = 'Litigation' | 'M&A' | 'IP' | 'Real Estate' | 'General' | 'Appeal';
export type BillingModel = 'Hourly' | 'Fixed' | 'Contingency' | 'Hybrid';
export type OrganizationType = 'LawFirm' | 'Corporate' | 'Government' | 'Court' | 'Vendor';

// Matter Management Enums (aligned with backend)
// Backend Matter entity enums (from matters/entities/matter.entity.ts)
export enum MatterStatus {
  INTAKE = 'ACTIVE',  // Backend: INTAKE maps to ACTIVE in DB (no INTAKE in DB enum)
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum MatterType {
  LITIGATION = 'LITIGATION',
  TRANSACTIONAL = 'TRANSACTIONAL',
  ADVISORY = 'ADVISORY',
  COMPLIANCE = 'CORPORATE', // Backend: No COMPLIANCE in DB, maps to CORPORATE
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  EMPLOYMENT = 'EMPLOYMENT',
  REAL_ESTATE = 'REAL_ESTATE',
  CORPORATE = 'CORPORATE',
  OTHER = 'OTHER',
}

export enum MatterPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Practice Area Enum
export enum PracticeArea {
  CIVIL_LITIGATION = 'civil_litigation',
  CRIMINAL_DEFENSE = 'criminal_defense',
  CORPORATE_LAW = 'corporate_law',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  EMPLOYMENT_LAW = 'employment_law',
  REAL_ESTATE = 'real_estate',
  FAMILY_LAW = 'family_law',
  TAX_LAW = 'tax_law',
  BANKRUPTCY = 'bankruptcy',
  IMMIGRATION = 'immigration',
  ENVIRONMENTAL_LAW = 'environmental_law',
  HEALTHCARE_LAW = 'healthcare_law',
  OTHER = 'other',
}

// Billing Arrangement Enum
export enum BillingArrangement {
  HOURLY = 'hourly',
  FLAT_FEE = 'flat_fee',
  CONTINGENCY = 'contingency',
  RETAINER = 'retainer',
  BLENDED = 'blended',
  VALUE_BASED = 'value_based',
  PRO_BONO = 'pro_bono',
}

export type RiskCategory = 'Legal' | 'Financial' | 'Reputational' | 'Operational' | 'Strategic';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type RiskStatus = 'Identified' | 'Mitigated' | 'Accepted' | 'Closed';

export type CommunicationType = 'Letter' | 'Email' | 'Fax' | 'Notice' | 'Memo';
export type CommunicationDirection = 'Inbound' | 'Outbound';

// Correspondence status enums with const assertion for type safety (aligned with backend)
export const CommunicationStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  PENDING: 'pending',
  // Legacy values for backwards compatibility
  READ: 'read',
  ARCHIVED: 'archived'
} as const;

export type CommunicationStatusType = typeof CommunicationStatus[keyof typeof CommunicationStatus];

export const ServiceStatus = {
  DRAFT: 'Draft',
  OUT_FOR_SERVICE: 'Out for Service',
  ATTEMPTED: 'Attempted',
  SERVED: 'Served',
  NON_EST: 'Non-Est',
  FILED: 'Filed',
  RETURNED: 'Returned'
} as const;

// Billing status enums with const assertion for type safety
export const InvoiceStatusEnum = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  SENT: 'Sent',
  PARTIAL: 'Partial',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  WRITTEN_OFF: 'Written Off',
  CANCELLED: 'Cancelled'
} as const;

export type InvoiceStatus = typeof InvoiceStatusEnum[keyof typeof InvoiceStatusEnum];

export const PaymentStatusEnum = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
} as const;

export type PaymentStatus = typeof PaymentStatusEnum[keyof typeof PaymentStatusEnum];

export const WIPStatusEnum = {
  UNBILLED: 'Unbilled',
  READY_TO_BILL: 'Ready to Bill',
  BILLED: 'Billed',
  WRITTEN_OFF: 'Written Off'
} as const;

export type WIPStatus = typeof WIPStatusEnum[keyof typeof WIPStatusEnum];

export const ExpenseStatusEnum = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  BILLED: 'Billed',
  REIMBURSED: 'Reimbursed'
} as const;

export type ExpenseStatus = typeof ExpenseStatusEnum[keyof typeof ExpenseStatusEnum];

export const TrustAccountStatusEnum = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  CLOSED: 'Closed'
} as const;

export type TrustAccountStatus = typeof TrustAccountStatusEnum[keyof typeof TrustAccountStatusEnum];

export type ServiceStatusType = typeof ServiceStatus[keyof typeof ServiceStatus];

// Discovery request status enums
export const DiscoveryRequestStatusEnum = {
  SERVED: 'Served',
  PENDING: 'Pending',
  RESPONDED: 'Responded',
  OVERDUE: 'Overdue'
} as const;

export type DiscoveryRequestStatusType = typeof DiscoveryRequestStatusEnum[keyof typeof DiscoveryRequestStatusEnum];

// ESI collection status enums
export const ESICollectionStatusEnum = {
  PENDING: 'Pending',
  COLLECTING: 'Collecting',
  COLLECTED: 'Collected',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  PRODUCED: 'Produced',
  ERROR: 'Error'
} as const;

export type ESICollectionStatusType = typeof ESICollectionStatusEnum[keyof typeof ESICollectionStatusEnum];

// Legal hold status enums
export const LegalHoldStatusEnum = {
  PENDING: 'Pending',
  ACKNOWLEDGED: 'Acknowledged',
  REMINDER_SENT: 'Reminder Sent',
  RELEASED: 'Released'
} as const;

export type LegalHoldStatusType = typeof LegalHoldStatusEnum[keyof typeof LegalHoldStatusEnum];

// Privilege basis enums
export const PrivilegeBasisEnum = {
  ATTORNEY_CLIENT: 'Attorney-Client',
  WORK_PRODUCT: 'Work Product',
  JOINT_DEFENSE: 'Joint Defense',
  COMMON_INTEREST: 'Common Interest'
} as const;

export type PrivilegeBasisType = typeof PrivilegeBasisEnum[keyof typeof PrivilegeBasisEnum];

export type ServiceMethod = 'Process Server' | 'Mail';

export type ExhibitStatus = 'Marked' | 'Offered' | 'Admitted' | 'Excluded' | 'Withdrawn';
export type ExhibitParty = 'Plaintiff' | 'Defense' | 'Joint' | 'Court';

export type MotionType = 'Dismiss' | 'Summary Judgment' | 'Compel Discovery' | 'In Limine' | 'Continuance' | 'Sanctions';
export type MotionStatus = 'Draft' | 'Filed' | 'Opposition Served' | 'Reply Served' | 'Hearing Set' | 'Submitted' | 'Decided' | 'Withdrawn';
export type MotionOutcome = 'Granted' | 'Denied' | 'Withdrawn' | 'Moot';

export type DocketEntryType = 'Filing' | 'Order' | 'Notice' | 'Minute Entry' | 'Exhibit' | 'Hearing' | 'Motion';

// Document status enums (aligned with backend REST API)
export const DocumentStatus = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  FILED: 'filed',
  ARCHIVED: 'archived'
} as const;

export type DocumentStatusType = typeof DocumentStatus[keyof typeof DocumentStatus];

export type DiscoveryType = 'Production' | 'Interrogatory' | 'Admission' | 'Deposition';
export type DiscoveryStatus = 'Draft' | 'Served' | 'Responded' | 'Overdue' | 'Closed' | 'Motion Filed';

export type EvidenceType = 'Physical' | 'Digital' | 'Document' | 'Testimony' | 'Forensic';
export type AdmissibilityStatus = 'Admissible' | 'Challenged' | 'Inadmissible' | 'Pending';

// Evidence status enums with const assertion for type safety
export const AdmissibilityStatusEnum = {
  ADMISSIBLE: 'Admissible',
  CHALLENGED: 'Challenged',
  INADMISSIBLE: 'Inadmissible',
  PENDING: 'Pending'
} as const;

export type AdmissibilityStatusType = typeof AdmissibilityStatusEnum[keyof typeof AdmissibilityStatusEnum];

export const CustodyActionType = {
  INITIAL_COLLECTION: 'Initial Collection',
  TRANSFER_TO_STORAGE: 'Transfer to Storage',
  TRANSFER_TO_LAB: 'Transfer to Lab',
  RETURNED_TO_CLIENT: 'Returned to Client',
  SENT_FOR_ANALYSIS: 'Sent for Analysis',
  CHECKED_OUT: 'Checked Out',
  CHECKED_IN: 'Checked In',
  DISPOSED: 'Disposed'
} as const;

export type CustodyActionTypeValue = typeof CustodyActionType[keyof typeof CustodyActionType];

export type ConferralResult = 'Agreed' | 'Impasse' | 'Partial Agreement' | 'Pending';
export type ConferralMethod = 'Email' | 'Phone' | 'In-Person' | 'Video Conference';

// Legacy TaskStatus (deprecated - use TaskStatusBackend from workflow.ts)
export type TaskStatus = 'Pending' | 'In Progress' | 'Review' | 'Done' | 'Completed';
export type StageStatus = 'Pending' | 'Active' | 'Completed';

// Legal Rule Types - aligned with backend JurisdictionRule types
export type LegalRuleType = 
  | 'Procedural' 
  | 'Evidentiary' 
  | 'Civil' 
  | 'Criminal' 
  | 'Administrative' 
  | 'Local' 
  | 'Standing Order' 
  | 'Practice Guide'
  // Legacy types for backward compatibility
  | 'FRE' 
  | 'FRCP' 
  | 'FRAP' 
  | 'State';

export type EntityType = 'Individual' | 'Corporation' | 'Court' | 'Government' | 'Vendor' | 'Law Firm';
export type EntityRole = 'Client' | 'Opposing Counsel' | 'Judge' | 'Expert' | 'Witness' | 'Staff' | 'Prospect';

// Enterprise Extensions
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD';
export type LedesActivityCode = string; // e.g., 'A100'
export type LedesTaskCode = string; // e.g., 'L110'
export type OcrStatus = 'Pending' | 'Completed' | 'Failed';
export type TaskDependencyType = 'FinishToStart' | 'StartToStart' | 'FinishToFinish' | 'StartToFinish';
