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

export type ExhibitStatus = 'Marked' | 'Offered' | 'Admitted' | 'Excluded' | 'Withdrawn';
export type ExhibitParty = 'Plaintiff' | 'Defense' | 'Joint' | 'Court';

export type MotionType = 'Dismiss' | 'Summary Judgment' | 'Compel Discovery' | 'In Limine' | 'Continuance' | 'Sanctions';
export type MotionStatus = 'Draft' | 'Filed' | 'Opposition Served' | 'Reply Served' | 'Hearing Set' | 'Submitted' | 'Decided' | 'Withdrawn';

export type DocketEntryType = 'Filing' | 'Order' | 'Notice' | 'Minute Entry' | 'Exhibit' | 'Hearing';

export type DiscoveryType = 'Production' | 'Interrogatory' | 'Admission' | 'Deposition';
export type DiscoveryStatus = 'Draft' | 'Served' | 'Responded' | 'Overdue' | 'Closed' | 'Motion Filed';

export type EvidenceType = 'Physical' | 'Digital' | 'Document' | 'Testimony' | 'Forensic';
export type AdmissibilityStatus = 'Admissible' | 'Challenged' | 'Inadmissible' | 'Pending';

export type ConferralResult = 'Agreed' | 'Impasse' | 'Partial Agreement' | 'Pending';
export type ConferralMethod = 'Email' | 'Phone' | 'In-Person' | 'Video Conference';