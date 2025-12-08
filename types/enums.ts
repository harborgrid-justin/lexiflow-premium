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

export type ServiceStatus = 'Draft' | 'Out for Service' | 'Attempted' | 'Served' | 'Non-Est' | 'Filed';
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