
export enum CaseStatus {
  Discovery = 'Discovery',
  Trial = 'Trial',
  Settled = 'Settled',
  Closed = 'Closed',
  Appeal = 'Appeal',
  Transferred = 'Transferred',
  DispositionPending = 'DispositionPending',
  Archived = 'Archived'
}

export type CaseOutcome = 'Win' | 'Loss' | 'Partial' | 'Dismissed' | 'Settled';

export interface ClosureAnalytics {
  timeToResolutionDays: number;
  budgetVariancePercent: number;
  clientSatisfactionScore?: number;
}

export type NavCategory = 'Main' | 'Case Work' | 'Litigation Tools' | 'Operations' | 'Knowledge' | 'Admin';

// Standardized Navigation Views - Single Source of Truth
export type AppView = 
  | 'dashboard' 
  | 'cases' 
  | 'docket' 
  | 'workflows' 
  | 'messages' 
  | 'discovery' 
  | 'evidence' 
  | 'jurisdiction' 
  | 'analytics' 
  | 'calendar' 
  | 'billing' 
  | 'practice' 
  | 'crm' 
  | 'documents' 
  | 'library' 
  | 'clauses' 
  | 'research' 
  | 'compliance' 
  | 'admin'
  | 'theme' // Dedicated Theme Explorer
  | 'design';

export type UserRole = 'Senior Partner' | 'Associate' | 'Paralegal' | 'Administrator' | 'Client User' | 'Guest';
export type MatterType = 'Litigation' | 'M&A' | 'IP' | 'Real Estate' | 'General' | 'Appeal';
export type BillingModel = 'Hourly' | 'Fixed' | 'Contingency' | 'Hybrid';
export type OrganizationType = 'LawFirm' | 'Corporate' | 'Government' | 'Court' | 'Vendor';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  orgId?: string;
  groupIds?: string[];
  userType?: 'Internal' | 'External';
  office?: string;
}

export interface Party {
  id: string;
  name: string;
  role: string;
  contact?: string;
  type: 'Individual' | 'Corporation' | 'Government';
  counsel?: string;
  partyGroup?: string;
  linkedOrgId?: string;
}

export interface Citation {
  id: string;
  citation: string;
  title: string;
  type: string;
  relevance: 'High' | 'Medium' | 'Low';
  description: string;
  shepardsSignal?: 'Positive' | 'Caution' | 'Negative' | 'Neutral';
}

export interface LegalArgument {
  id: string;
  title: string;
  description: string;
  strength: number;
  relatedCitationIds: string[];
  relatedEvidenceIds?: string[];
  status: string;
}

export interface Defense {
  id: string;
  title: string;
  type: string;
  description: string;
  status: string;
}

export interface Project {
  id: string;
  title: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  lead?: string;
  dueDate?: string;
  tasks: WorkflowTask[];
}

export interface CasePhase {
  id: string;
  caseId: string;
  name: string;
  startDate: string;
  duration: number;
  status: 'Pending' | 'Active' | 'Completed';
  color?: string;
}

export interface WorkflowTask {
  id: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Review' | 'Done';
  assignee: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  relatedModule?: 'Documents' | 'Discovery' | 'Evidence' | 'Motions' | 'Billing';
  relatedItemId?: string;
  relatedItemTitle?: string;
  actionLabel?: string;
  caseId?: string;
  projectId?: string;
  linkedRules?: string[];
  automatedTrigger?: string;
}

export interface WorkflowStage {
  id: string;
  title: string;
  status: 'Pending' | 'Active' | 'Completed';
  tasks: WorkflowTask[];
}

export interface LegalDocument {
  id: string;
  caseId: string;
  title: string;
  type: string;
  content: string;
  uploadDate: string;
  lastModified: string;
  tags: string[];
  versions: DocumentVersion[];
  summary?: string;
  riskScore?: number;
  sourceModule?: 'General' | 'Evidence' | 'Discovery' | 'Billing' | 'Financial';
  status?: 'Draft' | 'Final' | 'Signed';
  isEncrypted?: boolean;
  fileSize?: string;
  folderId?: string;
  linkedRules?: string[];
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  uploadDate: string;
  uploadedBy: string;
  contentSnapshot: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'document' | 'task' | 'billing' | 'milestone' | 'motion' | 'hearing' | 'planning';
  description: string;
  relatedId?: string;
}

export interface TimeEntry {
  id: string;
  caseId: string;
  date: string;
  duration: number;
  description: string;
  rate: number;
  total: number;
  status: 'Unbilled' | 'Billed';
  user_id?: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  status: 'Active' | 'Inactive';
  totalBilled: number;
  matters: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  billableTarget: number;
  currentBillable: number;
  utilizationRate: number;
  salary?: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  startDate: string;
}

export interface FirmExpense {
  id: string;
  date: string;
  vendor: string;
  category: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

export interface MarketingMetric {
  source: string;
  leads: number;
  conversions: number;
  revenue: number;
  roi: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
}

export type DocketEntryType = 'Filing' | 'Order' | 'Minute Entry' | 'Notice' | 'Exhibit' | 'Hearing';

export interface DocketEntry {
  id: string;
  sequenceNumber: number;
  caseId: string;
  date: string;
  type: DocketEntryType;
  title: string;
  description?: string;
  filedBy: string;
  documentId?: string;
  pageCount?: number;
  isSealed: boolean;
  triggersDeadlines?: any[];
  docLink?: string;
  tags?: string[];
  linkedEntryId?: string;
}

export interface DiscoveryRequest {
  id: string;
  caseId: string;
  type: 'Production' | 'Interrogatory' | 'Admission' | 'Deposition';
  propoundingParty: string;
  respondingParty: string;
  serviceDate: string;
  dueDate: string;
  status: 'Served' | 'Overdue' | 'Responded' | 'Draft';
  title: string;
  description: string;
}

export interface EvidenceItem {
  id: string;
  trackingUuid: string;
  caseId: string;
  title: string;
  type: 'Physical' | 'Digital' | 'Document' | 'Forensic';
  description: string;
  collectionDate: string;
  collectedBy: string;
  custodian: string;
  location: string;
  admissibility: 'Admissible' | 'Challenged' | 'Pending';
  tags: string[];
  blockchainHash?: string;
  chunks?: FileChunk[];
  chainOfCustody: ChainOfCustodyEvent[];
  fileSize?: string;
  fileType?: string;
  linkedRules?: string[];
  frcpStatus?: string;
}

export interface ChainOfCustodyEvent {
  id: string;
  date: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface FileChunk {
  id: string;
  pageNumber: number;
  contentPreview: string;
  hash: string;
}

export interface ResearchSession {
  id: string;
  query: string;
  response: string;
  sources: SearchResult[];
  timestamp: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface Clause {
  id: string;
  name: string;
  category: string;
  content: string;
  version: number;
  usageCount: number;
  lastUpdated: string;
  riskRating: 'Low' | 'Medium' | 'High';
  versions: ClauseVersion[];
}

export interface ClauseVersion {
  id: string;
  version: number;
  content: string;
  author: string;
  date: string;
}

export interface JudgeProfile {
  id: string;
  name: string;
  court: string;
  grantRateDismiss: number;
  grantRateSummary: number;
  avgCaseDuration: number;
  tendencies: string[];
}

export interface OpposingCounselProfile {
  name: string;
  firm: string;
  settlementRate: number;
  trialRate: number;
  avgSettlementVariance: number;
}

export interface ConflictCheck {
  id: string;
  entityName: string;
  date: string;
  status: 'Cleared' | 'Flagged';
  foundIn: string[];
  checkedBy: string;
}

export interface EthicalWall {
  id: string;
  caseId: string;
  title: string;
  restrictedGroups: string[];
  authorizedUsers: string[];
  status: string;
}

export interface Motion {
  id: string;
  caseId: string;
  title: string;
  type: MotionType;
  status: MotionStatus;
  assignedAttorney: string;
  filingDate?: string;
  hearingDate?: string;
  oppositionDueDate?: string;
  replyDueDate?: string;
  documents?: string[];
  linkedRules?: string[];
  conferralStatus?: string;
  outcome?: string;
}

export type MotionType = 'Dismiss' | 'Summary Judgment' | 'Compel Discovery' | 'In Limine';
export type MotionStatus = 'Draft' | 'Filed' | 'Hearing Set' | 'Decided' | 'Submitted';

export interface ConferralSession {
  id: string;
  caseId: string;
  topic: string;
  date: string;
  method: ConferralMethod;
  participants: string[];
  notes: string;
  result: ConferralResult;
  nextSteps?: string;
  linkedMotionId?: string;
}

export type ConferralResult = 'Pending' | 'Agreed' | 'Impasse' | 'Partial Agreement';
export type ConferralMethod = 'Phone' | 'Email' | 'Video Conference' | 'In-Person';

export interface JointPlan {
  id: string;
  caseId: string;
  title: string;
  lastUpdated: string;
  status: string;
  sections: PlanSection[];
}

export interface PlanSection {
  id: string;
  title: string;
  content: string;
  status: 'Agreed' | 'Disputed';
  opposingComments?: string;
}

export interface StipulationRequest {
  id: string;
  title: string;
  requestingParty: string;
  proposedDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  reason: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  domain: string;
  status: string;
}

export interface Group {
  id: string;
  orgId: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Playbook {
  id: string;
  name: string;
  jurisdiction: string;
  matterType: MatterType;
  stages: any[];
}

export interface Case {
  id: string; title: string; client: string; opposingCounsel: string;
  status: CaseStatus; filingDate: string; description: string; value: number;
  matterType?: MatterType; jurisdiction?: string; court?: string; 
  parties?: Party[];
  billingModel?: BillingModel; judge?: string;
  ownerOrgId?: string;
  assignedGroupIds?: string[];
  linkedCaseIds?: string[]; 
  leadCaseId?: string;
  isConsolidated?: boolean;
  citations?: Citation[];
  arguments?: LegalArgument[];
  defenses?: Defense[];
  projects?: Project[];
  phases?: CasePhase[];
  natureOfSuit?: string; 
  rawPacerXml?: string; 
  outcome?: CaseOutcome; 
  closureAnalytics?: ClosureAnalytics; 
}
