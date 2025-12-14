
// types/enums.ts

export enum CaseStatus {
  PreFiling = 'Pre-Filing',
  Discovery = 'Discovery',
  Trial = 'Trial',
  Settled = 'Settled',
  Closed = 'Closed',
  Appeal = 'Appeal',
  Transferred = 'Transferred'
}

export type NavCategory = 'Main' | 'Case Work' | 'Litigation Tools' | 'Operations' | 'Knowledge' | 'Admin';
export type AppView = string;

export type UserRole = 'Senior Partner' | 'Associate' | 'Paralegal' | 'Administrator' | 'Client User' | 'Guest';
export type MatterType = 'Litigation' | 'M&A' | 'IP' | 'Real Estate' | 'General' | 'Appeal';
export type BillingModel = 'Hourly' | 'Fixed' | 'Contingency' | 'Hybrid';
export type OrganizationType = 'LawFirm' | 'Corporate' | 'Government' | 'Court' | 'Vendor';

export type RiskCategory = 'Legal' | 'Financial' | 'Reputational' | 'Operational' | 'Strategic';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type RiskStatus = 'Identified' | 'Mitigated' | 'Accepted' | 'Closed';

export type CommunicationType = 'Letter' | 'Email' | 'Fax' | 'Notice' | 'Memo';
export type CommunicationDirection = 'Inbound' | 'Outbound';

// Correspondence status enums with const assertion for type safety
export const CommunicationStatus = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  DELIVERED: 'Delivered',
  READ: 'Read',
  FAILED: 'Failed',
  ARCHIVED: 'Archived'
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

export type TaskStatus = 'Pending' | 'In Progress' | 'Review' | 'Done' | 'Completed';
export type StageStatus = 'Pending' | 'Active' | 'Completed';

export type LegalRuleType = 'FRE' | 'FRCP' | 'FRAP' | 'Local' | 'State';

export type EntityType = 'Individual' | 'Corporation' | 'Court' | 'Government' | 'Vendor' | 'Law Firm';
export type EntityRole = 'Client' | 'Opposing Counsel' | 'Judge' | 'Expert' | 'Witness' | 'Staff' | 'Prospect';

// Enterprise Extensions
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD';
export type LedesActivityCode = string; // e.g., 'A100'
export type LedesTaskCode = string; // e.g., 'L110'
export type OcrStatus = 'Pending' | 'Completed' | 'Failed';
export type TaskDependencyType = 'FinishToStart' | 'StartToStart' | 'FinishToFinish' | 'StartToFinish';
