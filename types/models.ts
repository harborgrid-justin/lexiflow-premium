// types/models.ts

import {
  CaseStatus, UserRole, MatterType, BillingModel,
  OrganizationType, RiskCategory, RiskLevel, RiskStatus,
  CommunicationType, CommunicationDirection, ServiceStatus,
  ExhibitStatus, ExhibitParty, MotionType, MotionStatus, MotionOutcome,
  DocketEntryType, DiscoveryType, DiscoveryStatus,
  EvidenceType, AdmissibilityStatus, ConferralResult,
  ConferralMethod, NavCategory, TaskStatus, StageStatus, LegalRuleType, ServiceMethod,
  EntityType, EntityRole, CurrencyCode, LedesActivityCode, OcrStatus, TaskDependencyType
} from './enums';
import { LucideIcon } from 'lucide-react';
import type { FC, LazyExoticComponent } from 'react';

// --- Domain Primitives & Value Objects ---
export type Brand<K, T> = K & { readonly __brand: T };
export type UUID = Brand<string, 'UUID'>;
export type CaseId = Brand<string, 'CaseId'>;
export type UserId = Brand<string, 'UserId'>;
export type OrgId = Brand<string, 'OrgId'>;
export type GroupId = Brand<string, 'GroupId'>;
export type DocumentId = Brand<string, 'DocumentId'>;
export type EvidenceId = Brand<string, 'EvidenceId'>;
export type TaskId = Brand<string, 'TaskId'>;
export type EntityId = Brand<string, 'EntityId'>;
export type PartyId = Brand<string, 'PartyId'>;
export type MotionId = Brand<string, 'MotionId'>;
export type DocketId = Brand<string, 'DocketId'>;
export type ProjectId = Brand<string, 'ProjectId'>;
export type WorkflowTemplateId = Brand<string, 'WorkflowTemplateId'>;


export interface Money {
  amount: number;
  currency: CurrencyCode;
  precision: number;
}

export interface JurisdictionObject {
  country: string;
  state: string;
  courtLevel: 'Federal' | 'State' | 'Appellate' | 'Supreme';
  division?: string;
  county?: string;
}

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: UserId;
  updatedBy?: UserId;
  version?: number;
  deletedAt?: string;
  isEncrypted?: boolean;
}

// --- SYSTEM CONFIG ---
export interface TenantConfig {
  name: string;
  tier: string;
  version: string;
  region: string;
}

export interface OperatingSummary {
    id?: string;
    balance: number;
    expensesMtd: number;
    cashFlowMtd: number;
}

export interface ComplianceMetrics {
    score: number;
    high: number;
    missingDocs: number;
    violations: number;
    activeWalls: number;
}

// --- DATA PLATFORM ---
export interface SchemaTable { 
    name: string; 
    x: number; 
    y: number; 
    columns: any[]; 
}
export interface DataProfile { 
    column: string; 
    type: string; 
    nulls: number; 
    unique: number; 
    distribution: {name: string, value: number}[]; 
}
export interface DataLakeItem { 
    id: string; 
    name: string; 
    type: 'folder' | 'file'; 
    size?: string; 
    modified: string; 
    format?: string; 
    tier: 'Hot' | 'Cool' | 'Archive'; 
    parentId: string; 
}
export interface CostMetric { 
    name: string; 
    cost: number; 
}
export interface CostForecast { 
    day: string; 
    actual: number | null; 
    forecast: number | null; 
}
export interface LineageNode { 
    id: string; 
    label: string; 
    type: 'root' | 'org' | 'party' | 'evidence'; 
}
export interface LineageLink { 
    source: string; 
    target: string; 
    strength: number; 
}
export interface Connector {
  id: string;
  name: string;
  type: string;
  status: 'Healthy' | 'Syncing' | 'Degraded' | 'Error';
  color: string;
  icon?: any; 
}
export interface GovernanceRule {
  id: number;
  name: string;
  status: string;
  impact: string;
  passing: string;
  desc: string;
}
export interface GovernancePolicy {
  id: string;
  title: string;
  version: string;
  status: string;
  date: string;
}
export interface PipelineJob {
  id: string;
  name: string;
  status: 'Success' | 'Running' | 'Failed';
  lastRun: string;
  duration: string;
  volume: string;
  schedule: string;
  logs: string[];
}
export type SnapshotType = 'Incremental' | 'Full';
export interface BackupSnapshot {
  id: string;
  name: string;
  type: SnapshotType;
  created: string;
  size: string;
  status: 'Completed' | 'Running' | 'Failed';
}
export interface ArchiveStats {
  totalSize: string;
  objectCount: number;
  monthlyCost: number;
  retentionPolicy: string;
  glacierTier: string;
}
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  status: 'Active' | 'Revoked';
}
export interface DataDictionaryItem {
  id: string;
  table: string;
  column: string;
  dataType: string;
  description: string;
  classification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  isPII: boolean;
  domain: string;
  owner: string;
  sourceSystem: string;
  dataQualityScore: number;
}


// --- FINANCIAL & MARKETING ---
export interface FinancialPerformanceData {
    revenue: { month: string; actual: number; target: number }[];
    expenses: { category: string; value: number }[];
}
export interface MarketingCampaign {
    id: string;
    name: string;
    target: string;
    status: 'Active' | 'Upcoming' | 'Completed';
    budget?: string;
    dates?: string;
}
export interface MarketingMetric {
  source: string;
  leads: number;
  conversions: number;
  revenue: number;
  roi: number;
}


// --- CLUSTER 1: CORE & SYSTEM ---
export interface User extends BaseEntity { id: UserId; name: string; email: string; role: UserRole; orgId?: OrgId; groupIds?: GroupId[]; userType?: 'Internal' | 'External'; office?: string; status?: 'online' | 'offline' | 'away' | 'busy'; }
export interface Organization extends BaseEntity { id: OrgId; name: string; type: OrganizationType; domain: string; status: string; }
export interface Group extends BaseEntity { id: GroupId; orgId: OrgId; name: string; description: string; permissions: string[]; }
export interface FeatureFlag extends BaseEntity { key: string; enabled: boolean; rules?: any; description: string; }
export interface IntegrationMapping extends BaseEntity { system: string; entity: string; fieldMap: Record<string, string>; direction: 'Inbound' | 'Outbound' | 'Bi-directional'; }

// --- NEW: GRANULAR PROFILE SYSTEM ---
export type AccessEffect = 'Allow' | 'Deny';
export type AccessScope = 'Global' | 'Region' | 'Office' | 'Personal';

export interface AccessCondition {
  type: 'Time' | 'Location' | 'Device' | 'Network';
  operator: 'Equals' | 'NotEquals' | 'Between' | 'Includes';
  value: any;
}

export interface GranularPermission {
  id: string;
  resource: string; // e.g., "cases", "billing.invoices", "documents.metadata"
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'approve' | '*';
  effect: AccessEffect;
  scope: AccessScope;
  conditions?: AccessCondition[]; // e.g., Time: 9am-5pm
  expiration?: string; // ISO Date for temporary access
  reason?: string; // Audit trail for why this permission exists
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
    digestFrequency: 'Realtime' | 'Daily' | 'Weekly';
  };
  dashboardLayout: string[]; // Widget IDs
  density: 'comfortable' | 'compact';
  locale: string;
  timezone: string;
}

export interface UserSecurityProfile {
  mfaEnabled: boolean;
  mfaMethod: 'App' | 'SMS' | 'Hardware';
  lastPasswordChange: string;
  passwordExpiry: string;
  ipWhitelist?: string[];
  activeSessions: {
    id: string;
    device: string;
    ip: string;
    lastActive: string;
    current: boolean;
  }[];
}

export interface ExtendedUserProfile extends User {
  entityId: EntityId; // Link to Entity Director
  title: string;
  department: string;
  managerId?: UserId;
  accessMatrix: GranularPermission[];
  preferences: UserPreferences;
  security: UserSecurityProfile;
  skills: string[];
  barAdmissions: { state: string; number: string; status: 'Active' | 'Inactive' }[];
}

// --- CLUSTER 2: CASE & LITIGATION ---
export interface Case extends BaseEntity { 
  id: CaseId;
  title: string; client: string; clientId?: UserId | EntityId; matterType: MatterType; matterSubType?: string; 
  status: CaseStatus; filingDate: string; description?: string; value?: number; valuation?: Money; 
  jurisdiction?: string; jurisdictionConfig?: JurisdictionObject; court?: string; judge?: string; magistrateJudge?: string; 
  opposingCounsel?: string; origCaseNumber?: string; origCourt?: string; origJudgmentDate?: string; noticeOfAppealDate?: string; 
  ownerId?: UserId; ownerOrgId?: OrgId; team?: CaseTeamMember[]; linkedCaseIds?: CaseId[]; leadCaseId?: CaseId; 
  isConsolidated?: boolean; associatedCases?: any[]; parties: Party[]; citations: Citation[]; arguments: LegalArgument[]; 
  defenses: Defense[]; dateTerminated?: string; natureOfSuit?: string; pacerData?: any; 
  billingModel?: BillingModel; feeAgreement?: FeeAgreement; projects?: Project[]; 
  solDate?: string; solTriggerDate?: string; budget?: Money; budgetAlertThreshold?: number;
}

export interface Party extends BaseEntity { id: PartyId; name: string; role: string; type: 'Individual' | 'Corporation' | 'Government'; contact?: string; counsel?: string; partyGroup?: string; linkedOrgId?: OrgId; address?: string; phone?: string; email?: string; representationType?: string; attorneys?: Attorney[]; pacerData?: any; aliases?: string[]; taxId?: string; }
export interface Attorney { name: string; firm?: string; email?: string; phone?: string; address?: string; type?: string; }
export interface CaseTeamMember { userId: UserId; role: 'Lead' | 'Support' | 'Paralegal'; rateOverride?: Money; }

// --- CLUSTER 3: FINANCIAL & BILLING ---
export interface FeeAgreement { type: BillingModel; rate?: Money; contingencyPercent?: number; retainerRequired?: Money; splitRules?: SplitBillingRule[]; }
export interface SplitBillingRule { clientId: string; percentage: number; }
export interface RateTable extends BaseEntity { timekeeperId: string; rate: Money; effectiveDate: string; expiryDate?: string; level: string; }
export interface TimeEntry extends BaseEntity { caseId: CaseId; userId: UserId; date: string; duration: number; description: string; rate: number; total: number; status: string; invoiceId?: string; ledesActivity?: LedesActivityCode; }
export interface TimeEntryPayload { caseId: string; date: string; duration: number; description: string; rate: number; total: number; status: 'Unbilled'; }
export interface Invoice extends BaseEntity { client: string; matter: string; caseId: CaseId; date: string; dueDate: string; amount: number; status: string; items: string[]; currency?: CurrencyCode; taxAmount?: number; taxJurisdiction?: string; }
export interface TrustTransaction extends BaseEntity { accountId: string; type: 'Deposit' | 'Withdrawal'; amount: Money; date: string; checkNumber?: string; clearedDate?: string; description: string; }
export interface FirmExpense extends BaseEntity { date: string; category: string; description: string; amount: number; status: 'Paid' | 'Pending'; vendor: string; }
export interface TrustSubLedger { id: string; name: string; balance: Money; lastReconciled: string; accountId?: string; }
export interface Client extends BaseEntity { id: EntityId; name: string; industry: string; status: string; totalBilled: number; matters: CaseId[]; trustSubLedgers?: TrustSubLedger[]; taxId?: string; billingGuidelineId?: string; }

// --- CLUSTER 4: DOCUMENTS & DISCOVERY ---
export interface LegalDocument extends BaseEntity { 
  id: DocumentId;
  caseId: CaseId; title: string; type: string; content: string; searchableText?: string; ocrStatus?: OcrStatus; 
  embedding?: number[]; uploadDate: string; lastModified: string; tags: string[]; versions: DocumentVersion[]; 
  fileSize?: string; sourceModule?: string; status?: string; folderId?: string; summary?: string; riskScore?: number; 
  linkedRules?: string[]; sharedWith?: string[]; isRedacted?: boolean; authorId?: UserId; formFields?: any[]; 
  signingStatus?: { recipient: string; status: 'Sent' | 'Viewed' | 'Signed'; signedAt?: string }[]; 
  acls?: AccessControlList[]; retentionPolicyId?: string;
}
export interface DocumentVersion extends BaseEntity { documentId?: DocumentId; versionNumber: number; uploadedBy: string; uploadDate: string; contentSnapshot?: string; storageKey?: string; author?: string; authorId?: UserId; checksum?: string; }
export interface AccessControlList { roleId?: GroupId; userId?: UserId; permission: 'Read' | 'Write' | 'None'; }
export interface ReviewBatch extends BaseEntity { name: string; caseId: CaseId; assigneeId: UserId; documentIds: DocumentId[]; status: 'Pending' | 'In Progress' | 'Completed'; dueDate?: string; }
export interface RedactionLog extends BaseEntity { documentId: DocumentId; page: number; x: number; y: number; width: number; height: number; reason: string; appliedBy: UserId; }
export interface ProductionVolume extends BaseEntity { caseId: CaseId; name: string; batesStart: string; batesEnd: string; format: 'PDF' | 'Native' | 'TIFF'; documentCount: number; producedDate: string; }
export interface ProcessingJob extends BaseEntity { type: 'OCR' | 'Extraction' | 'Ingest'; status: 'Queued' | 'Processing' | 'Completed' | 'Failed'; progress: number; }

// --- CLUSTER 5: TRIAL & STRATEGY ---
export interface Juror extends BaseEntity { caseId: CaseId; name: string; status: 'Panel' | 'Seated' | 'Struck' | 'Alternate'; strikeParty?: 'Plaintiff' | 'Defense'; notes?: string; demographics?: any; }
export interface Witness extends BaseEntity { caseId: CaseId; name: string; type: 'Fact' | 'Expert'; credibilityScore: number; impeachmentRisks?: string[]; prepStatus: number; linkedExhibits?: string[]; }
export interface DepositionDesignation { id: string; depositionId: string; pageStart: number; lineStart: number; pageEnd: number; lineEnd: number; party: string; objection?: string; ruling?: string; }
export interface OpeningStatement extends BaseEntity { caseId: CaseId; sections: { title: string; durationMinutes: number; linkedExhibitIds: string[] }[]; }
export interface Fact extends BaseEntity { caseId: CaseId; date: string; description: string; type: 'Undisputed' | 'Disputed' | 'Stipulated'; supportingEvidenceIds: EvidenceId[]; }
export interface StandingOrder extends BaseEntity { judgeId: string; judgeName: string; title: string; updated: string; url: string; }

// --- CLUSTER 6: WORKFLOW & AUTOMATION ---
export interface WorkflowTask extends BaseEntity { 
  id: TaskId;
  title: string; status: TaskStatus; assignee: string; assigneeId?: UserId; startDate?: string; dueDate: string; 
  priority: 'Low' | 'Medium' | 'High' | 'Critical'; description?: string; caseId?: CaseId; projectId?: ProjectId; 
  relatedModule?: string; relatedItemId?: string; relatedItemTitle?: string; actionLabel?: string; 
  automatedTrigger?: string; linkedRules?: string[]; dependencies?: TaskId[]; dependencyType?: TaskDependencyType; 
  rrule?: string; completion?: number; slaId?: string; 
}
export interface SLAConfig extends BaseEntity { name: string; targetHours: number; warningThresholdHours: number; businessHoursOnly: boolean; }
export interface ApprovalChain extends BaseEntity { name: string; steps: { role: UserRole; userId?: UserId; order: number }[]; }
export interface WorkflowStage { id: string; title: string; status: StageStatus | string; tasks: WorkflowTask[]; }
export interface WorkflowTemplateData extends BaseEntity { id: WorkflowTemplateId; title: string; category: string; complexity: 'Low' | 'Medium' | 'High'; duration: string; tags: string[]; auditReady: boolean; stages: string[]; }
export interface Project extends BaseEntity { id: ProjectId; caseId: CaseId; title: string; description?: string; status: string; priority: string; lead: string; dueDate?: string; tasks: WorkflowTask[]; }

// --- EXISTING MODELS (Maintained for Compatibility) ---
export interface SearchResult { id: string; title: string; url?: string; type?: string; snippet?: string; }
export interface FileChunk { id: string; pageNumber: number; contentPreview: string; hash: string; }
export interface Motion extends BaseEntity { 
  id: MotionId; 
  caseId: CaseId; 
  title: string; 
  type: MotionType; 
  status: MotionStatus; 
  outcome?: MotionOutcome; 
  filingDate?: string; 
  hearingDate?: string; 
  oppositionDueDate?: string; 
  replyDueDate?: string; 
  documents?: DocumentId[]; 
  assignedAttorney?: string; 
  linkedRules?: string[]; 
  conferralStatus?: string;
  linkedEvidenceIds?: EvidenceId[]; // For Nexus Graph
}

export interface DocketEntryStructuredData {
  actionType: string;
  actionVerb: string;
  documentTitle: string;
  filer: string;
  additionalText: string;
}

export interface DocketEntry extends BaseEntity { id: DocketId; sequenceNumber: number; pacerSequenceNumber?: number; caseId: CaseId; date: string; type: DocketEntryType; title: string; description?: string; filedBy?: string; isSealed?: boolean; documentId?: DocumentId; structuredData?: DocketEntryStructuredData; triggersDeadlines?: any[]; docLink?: string; syncMetadata?: { pacerId: string; lastPolled: string; checksum: string }; }
export interface TrialExhibit extends BaseEntity { caseId: CaseId; exhibitNumber: string; title: string; dateMarked: string; party: string; status: string; fileType: string; description?: string; witness?: string; uploadedBy?: string; tags?: string[]; admissibilityHistory?: { date: string; status: string; ruling?: string }[]; }

export interface ChainOfCustodyEvent {
  id: string;
  date: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface EvidenceItem extends BaseEntity { id: EvidenceId; caseId: CaseId; title: string; type: EvidenceType; description: string; collectionDate: string; collectedBy: string; custodian: string; location: string; admissibility: AdmissibilityStatus; tags: string[]; blockchainHash?: string; trackingUuid: UUID; chainOfCustody: ChainOfCustodyEvent[]; chunks?: FileChunk[]; fileSize?: string; fileType?: string; linkedRules?: string[]; status?: string; authenticationMethod?: 'Self-Authenticated' | 'Stipulation' | 'Testimony' | 'Pending'; hearsayStatus?: 'Not Hearsay' | 'Exception Applies' | 'Objectionable' | 'Unanalyzed'; isOriginal?: boolean; relevanceScore?: number; expertId?: string; }
export interface Citation extends BaseEntity { citation: string; title: string; type: string; description?: string; relevance: string; shepardsSignal: string; embedding?: number[]; }
export interface LegalArgument extends BaseEntity { title: string; description: string; strength: number; status: string; relatedCitationIds: string[]; relatedEvidenceIds: EvidenceId[]; }
export interface Defense extends BaseEntity { title: string; type: string; status: string; description?: string; }
export interface ResearchSession extends BaseEntity { userId: UserId; query: string; response: string; sources: SearchResult[]; timestamp: string; }
export interface BriefAnalysisSession extends BaseEntity { textSnapshot: string; extractedCitations: string[]; riskScore: number; strengths: string[]; weaknesses: string[]; suggestions: string[]; missingAuthority: string[]; timestamp: string; }
export interface LegalRule extends BaseEntity { code: string; name: string; type: LegalRuleType; level?: string; summary?: string; text?: string; parentId?: string; children?: LegalRule[]; structuredContent?: any; }
export interface Playbook extends BaseEntity { name: string; jurisdiction: string; matterType: string; stages: any[]; }
export interface DiscoveryRequest extends BaseEntity { caseId: CaseId; type: DiscoveryType; propoundingParty: string; respondingParty: string; serviceDate: string; dueDate: string; status: DiscoveryStatus; title: string; description: string; }
export interface Deposition extends BaseEntity { caseId: CaseId; witnessName: string; date: string; location: string; status: string; courtReporter?: string; prepNotes?: string; }
export interface ESISource extends BaseEntity { caseId: CaseId; name: string; type: string; custodian: string; status: string; size?: string; notes?: string; }
export interface CustodianInterview extends BaseEntity { caseId: CaseId; custodianName: string; department: string; status: string; interviewDate?: string; notes?: string; relevantSources?: string[]; legalHoldId?: string; }
export interface Examination extends BaseEntity { caseId: CaseId; examinee: string; type: 'Physical' | 'Mental'; doctorName: string; date: string; status: 'Scheduled' | 'Report Received' | 'Disputed'; goodCause: string; reportDate?: string; }
export interface Vendor extends BaseEntity { name: string; serviceType: 'Court Reporting' | 'Videography' | 'Forensics' | 'Translation'; contactName: string; phone: string; email: string; status: 'Preferred' | 'Active' | 'Blocked'; rating: number; }
export interface Transcript extends BaseEntity { caseId: CaseId; deponent: string; date: string; fileId?: DocumentId; isFinal: boolean; wordCount: number; linkedDepositionId?: string; }
export interface SanctionMotion extends BaseEntity { caseId: CaseId; title: string; relatedRequestId: string; ruleBasis: 'Rule 37(a)' | 'Rule 37(b)' | 'Rule 37(c)'; status: 'Draft' | 'Filed' | 'Granted' | 'Denied'; description: string; filedDate?: string; }
export interface LegalHold extends BaseEntity { custodian: string; dept: string; issued: string; status: string; scope?: string; }
export interface PrivilegeLogEntry extends BaseEntity { date: string; author: string; recipient: string; type: string; basis: string; desc: string; }
export interface FirmAsset extends BaseEntity { name: string; type: string; assignedTo: string; status: string; purchaseDate: string; value: number; serialNumber?: string; }
export interface Clause extends BaseEntity { name: string; category: string; content: string; version: number; usageCount: number; lastUpdated: string; riskRating: string; versions: any[]; embedding?: number[]; }
export interface WikiArticle extends BaseEntity { title: string; category: string; content: string; lastUpdated: string; isFavorite: boolean; author: string; }
export interface Precedent extends BaseEntity { title: string; type: string; description: string; tag: string; docId: DocumentId; embedding?: number[]; }
export interface QAItem extends BaseEntity { question: string; asker: string; time: string; answer: string; answerer: string; role: string; verified: boolean; }
export interface Risk extends BaseEntity { caseId: CaseId; title: string; description: string; category: RiskCategory; probability: RiskLevel; impact: RiskLevel; status: RiskStatus; dateIdentified: string; lastUpdated: string; mitigationPlan?: string; }
export interface ConflictCheck extends BaseEntity { entityName: string; date: string; status: string; foundIn: string[]; checkedById: UserId; checkedBy: string; snapshot?: string; }
export interface EthicalWall extends BaseEntity { caseId: CaseId; title: string; restrictedGroups: GroupId[]; authorizedUsers: UserId[]; status: string; }
export interface AuditLogEntry extends BaseEntity { timestamp: string; userId: UserId; user: string; action: string; resource: string; ip: string; hash?: string; prevHash?: string; previousValue?: any; newValue?: any; }
export interface ConferralSession extends BaseEntity { caseId: CaseId; topic: string; date: string; method: ConferralMethod; participants: string[]; notes: string; result: ConferralResult; nextSteps?: string; linkedMotionId?: MotionId; }
export interface PlanSection { id: string; title: string; content: string; status: 'Agreed' | 'Disputed'; opposingComments?: string; }
export interface JointPlan extends BaseEntity { caseId: CaseId; title: string; lastUpdated: string; status: string; sections: PlanSection[]; }
export interface StipulationRequest extends BaseEntity { title: string; requestingParty: string; proposedDate: string; status: string; reason: string; caseId?: CaseId; }
export interface CommunicationItem extends BaseEntity { caseId: CaseId; userId: UserId; subject: string; date: string; type: string; direction: string; sender: string; recipient: string; preview: string; hasAttachment: boolean; status: string; isPrivileged: boolean; }
export interface ServiceJob extends BaseEntity { caseId: CaseId; requestorId: UserId; documentTitle: string; targetPerson: string; targetAddress: string; serverName: string; method: ServiceMethod; mailType?: string; trackingNumber?: string; addressedTo?: string; status: ServiceStatus; dueDate: string; attempts: number; servedDate?: string; gpsCoordinates?: string; notes?: string; signerName?: string; attemptHistory?: { date: string; result: string; lat?: number; long?: number }[]; }
export interface Attachment { name: string; size?: string; type?: string; sender?: string; date?: string; url?: string; }
export interface Message { id: string; senderId: UserId | 'me'; text: string; timestamp: string; status?: 'sent' | 'delivered' | 'read'; isPrivileged?: boolean; attachments?: Attachment[]; }
export interface Conversation extends BaseEntity { name: string; role: string; status: string; unread: number; isExternal: boolean; messages: Message[]; draft?: string; }
export interface SystemNotification extends BaseEntity { text: string; time: string; read: boolean; type?: string; }
export interface JudgeMotionStat { name: string; grant: number; deny: number; }
export interface JudgeProfile extends BaseEntity { name: string; court: string; grantRateDismiss: number; grantRateSummary: number; avgCaseDuration: number; tendencies: string[]; }
export interface OpposingCounselProfile extends BaseEntity { name: string; firm: string; settlementRate: number; trialRate: number; avgSettlementVariance: number; }
export interface LegalEntity extends BaseEntity { id: EntityId; name: string; type: EntityType; roles: EntityRole[]; email?: string; phone?: string; website?: string; address?: string; city?: string; state?: string; country?: string; taxId?: string; company?: string; title?: string; barNumber?: string; jurisdiction?: string; status: 'Active' | 'Inactive' | 'Prospect' | 'Blacklisted' | 'Deceased'; riskScore: number; tags: string[]; notes?: string; linkedUserId?: UserId; avatar?: string; externalIds?: Record<string, string>; aliases?: string[]; }
export interface EntityRelationship extends BaseEntity { sourceId: EntityId; targetId: EntityId; type: 'Employment' | 'Subsidiary' | 'Counsel_For' | 'Sued_By' | 'Witness_For' | 'Family' | 'Conflict' | 'Board_Member'; description?: string; startDate?: string; endDate?: string; active: boolean; weight?: number; }
export type SqlCmd = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
export interface RLSPolicy extends BaseEntity { name: string; table: string; cmd: SqlCmd; roles: string[]; using: string; withCheck?: string; status: 'Active' | 'Disabled'; }
export type PermissionLevel = 'None' | 'Read' | 'Write' | 'Full' | 'Own';
export interface RolePermission extends BaseEntity { role: string; resource: string; access: PermissionLevel; }
export interface DataAnomaly { id: number; table: string; field: string; issue: string; count: number; sample: string; status: 'Detected' | 'Fixing' | 'Fixed' | 'Ignored'; severity: 'Low' | 'Medium' | 'High' | 'Critical'; }
export interface CleansingRule { id: string; name: string; targetField: string; operation: 'Trim' | 'Uppercase' | 'FormatPhone' | 'FormatDate' | 'RemoveSpecialChars' | 'CustomRegex' | 'Lowercase'; parameters?: any; isActive: boolean; }
export interface DedupeCluster { id: string; masterId: string; duplicates: { id: string; name: string; similarityScore: number; fieldMatch: string; }[]; status: 'Pending' | 'Merged' | 'Ignored'; }
export interface QualityMetricHistory { date: string; score: number; issuesFound: number; issuesFixed: number; }
export interface ParsedDocket {
  caseInfo: Partial<Case>;
  parties: Party[];
  docketEntries: DocketEntry[];
  deadlines?: any[];
}

export interface ModuleDefinition {
  id: string;
  label: string;
  component: LazyExoticComponent<any>;
  requiresAdmin?: boolean;
  intentMatcher?: (intent: string, context: any) => boolean;
  category: NavCategory;
  icon?: any;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'milestone' | 'document' | 'billing' | 'motion' | 'hearing' | 'task' | 'planning';
  description?: string;
  relatedId?: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string;
  type: 'case' | 'deadline' | 'hearing' | 'task' | 'compliance';
  description?: string;
  priority?: string;
  location?: string;
}

export interface CasePhase {
  id: string;
  caseId: CaseId;
  name: string;
  startDate: string;
  duration: number;
  status: string;
  color: string;
}

export interface StaffMember {
  id: string;
  userId: UserId;
  name: string;
  email: string;
  role: 'Associate' | 'Paralegal' | 'Senior Partner' | 'Administrator';
  phone: string;
  billableTarget: number;
  currentBillable: number;
  utilizationRate: number;
  salary: number;
  status: 'Active' | 'Inactive';
  startDate: string;
}

export interface ProductionSet {
  id: string;
  caseId: CaseId;
  name: string;
  date: string;
  batesRange: string;
  docCount: number;
  size: string;
  format: string;
  status: 'Delivered' | 'Staging' | 'Failed';
}

export interface WIPStat { name: string; wip: number; billed: number; }
export interface RealizationStat { id?: string; name: string; value: number; color: string; }
export interface NexusNodeData { 
  id: string; 
  type: 'root' | 'org' | 'party' | 'evidence' | 'motion'; 
  label: string; 
  original: Case | Party | EvidenceItem | Motion | object; 
  status?: string;
}
export interface WarRoomData { case: Case; witnesses: Party[]; documents: LegalDocument[]; motions: Motion[]; docket: DocketEntry[]; evidence: EvidenceItem[]; tasks: WorkflowTask[]; }
export interface OutcomePredictionData {
  subject: string;
  A: number;
  fullMark: number;
}
