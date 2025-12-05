
import {
  CaseStatus, UserRole, MatterType, BillingModel,
  OrganizationType, RiskCategory, RiskLevel, RiskStatus,
  CommunicationType, CommunicationDirection, ServiceStatus,
  ExhibitStatus, ExhibitParty, MotionType, MotionStatus,
  DocketEntryType, DiscoveryType, DiscoveryStatus,
  EvidenceType, AdmissibilityStatus, ConferralResult,
  ConferralMethod, NavCategory
} from './enums';

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
  deletedAt?: string;
}

// Search & Navigation
export interface SearchResult { id: string; title: string; url?: string; type?: string; snippet?: string; }
export interface ModuleDefinition { id: string; label: string; icon?: any; component?: any; requiresAdmin?: boolean; category: NavCategory; intentMatcher?: (intent: string, context?: any) => boolean; }

// Core Entities
export interface User extends BaseEntity { name: string; email: string; role: string; orgId?: string; groupIds?: string[]; userType?: string; office?: string; status?: string; }
export interface Organization extends BaseEntity { name: string; type: string; domain: string; status: string; }
export interface Group extends BaseEntity { orgId: string; name: string; description: string; permissions: string[]; }

// Messaging
export interface Attachment { name: string; type: 'doc' | 'image'; size: string; sender?: string; date?: string; }
export interface Message { id: string; senderId: string; text: string; timestamp: string; status: 'sent' | 'delivered' | 'read'; attachments?: Attachment[]; isPrivileged?: boolean; }
export interface Conversation { id: string; name: string; role: string; isExternal: boolean; unread: number; status: 'online' | 'offline' | 'away'; draft?: string; messages: Message[]; }

// Case Management
export interface Party extends BaseEntity { name: string; role: string; type: 'Individual' | 'Corporation' | 'Government'; contact?: string; counsel?: string; partyGroup?: string; linkedOrgId?: string; address?: string; phone?: string; email?: string; representationType?: string; attorneys?: any[]; pacerData?: any; }
export interface Case extends BaseEntity { title: string; client: string; clientId?: string; matterType: string; matterSubType?: string; status: CaseStatus; filingDate: string; description?: string; value?: number; jurisdiction?: string; court?: string; judge?: string; magistrateJudge?: string; opposingCounsel?: string; origCaseNumber?: string; origCourt?: string; origJudgmentDate?: string; noticeOfAppealDate?: string; ownerId?: string; ownerOrgId?: string; linkedCaseIds?: string[]; leadCaseId?: string; isConsolidated?: boolean; associatedCases?: any[]; parties?: Party[]; citations?: Citation[]; arguments?: LegalArgument[]; defenses?: Defense[]; dateTerminated?: string; natureOfSuit?: string; pacerData?: any; billingModel?: BillingModel; projects?: Project[]; }
export interface CasePhase { id: string; caseId: string; name: string; startDate: string; duration: number; status: string; color?: string; }

// Documents
export interface DocumentVersion extends BaseEntity { documentId?: string; versionNumber: number; uploadedBy: string; uploadDate: string; contentSnapshot?: string; storageKey?: string; author?: string; authorId?: string; }
export interface LegalDocument extends BaseEntity { caseId: string; title: string; type: string; content: string; uploadDate: string; lastModified: string; tags: string[]; versions: DocumentVersion[]; fileSize?: string; sourceModule?: string; status?: string; isEncrypted?: boolean; folderId?: string; summary?: string; riskScore?: number; linkedRules?: string[]; sharedWith?: string[]; isRedacted?: boolean; authorId?: string; }
export interface FileChunk { id: string; pageNumber: number; contentPreview: string; hash: string; }

// Workflow
export interface WorkflowTask extends BaseEntity { title: string; status: string; assignee: string; assigneeId?: string; startDate?: string; dueDate: string; priority: string; description?: string; caseId?: string; projectId?: string; relatedModule?: string; relatedItemId?: string; relatedItemTitle?: string; actionLabel?: string; automatedTrigger?: string; linkedRules?: string[]; dependencies?: string[]; completion?: number; }
export interface WorkflowStage { id: string; title: string; status: string; tasks: WorkflowTask[]; }
export interface WorkflowTemplateData { id: string; title: string; category: string; complexity: 'Low' | 'Medium' | 'High'; duration: string; tags: string[]; auditReady: boolean; stages: string[]; }
export interface Project extends BaseEntity { caseId: string; title: string; description?: string; status: string; priority: string; lead: string; dueDate?: string; tasks: WorkflowTask[]; }

// Litigation
export interface Motion extends BaseEntity { caseId: string; title: string; type: string; status: string; outcome?: string; filingDate?: string; hearingDate?: string; oppositionDueDate?: string; replyDueDate?: string; documents?: string[]; assignedAttorney?: string; linkedRules?: string[]; conferralStatus?: string; }
export interface TimelineEvent { id: string; date: string; title: string; type: string; description?: string; relatedId?: string; }
export interface DocketEntryStructuredData { actionType: string; actionVerb?: string; documentTitle?: string; filer?: string; additionalText?: string; }
export interface DocketEntry extends BaseEntity { sequenceNumber: number; pacerSequenceNumber?: number; caseId: string; date: string; type: string; title: string; description?: string; filedBy?: string; isSealed?: boolean; documentId?: string; structuredData?: DocketEntryStructuredData; triggersDeadlines?: any[]; docLink?: string; }
export interface TrialExhibit extends BaseEntity { caseId: string; exhibitNumber: string; title: string; dateMarked: string; party: string; status: string; fileType: string; description?: string; witness?: string; uploadedBy?: string; tags?: string[]; }
export interface ChainOfCustodyEvent { id: string; date: string; action: string; actor: string; notes?: string; }
export interface EvidenceItem extends BaseEntity { caseId: string; title: string; type: string; description: string; collectionDate: string; collectedBy: string; custodian: string; location: string; admissibility: string; tags: string[]; blockchainHash?: string; trackingUuid: string; chainOfCustody: ChainOfCustodyEvent[]; chunks?: FileChunk[]; fileSize?: string; fileType?: string; linkedRules?: string[]; status?: string; }

// Research & Strategy
export interface Citation extends BaseEntity { citation: string; title: string; type: string; description?: string; relevance: string; shepardsSignal: string; }
export interface LegalArgument extends BaseEntity { title: string; description: string; strength: number; status: string; relatedCitationIds: string[]; relatedEvidenceIds: string[]; }
export interface Defense extends BaseEntity { title: string; type: string; status: string; description?: string; }
export interface ResearchSession extends BaseEntity { userId: string; query: string; response: string; sources: SearchResult[]; timestamp: string; }
export interface BriefAnalysisSession extends BaseEntity { textSnapshot: string; extractedCitations: string[]; riskScore: number; strengths: string[]; weaknesses: string[]; suggestions: string[]; missingAuthority: string[]; timestamp: string; }
export interface LegalRule extends BaseEntity { code: string; name: string; type: string; level?: string; summary?: string; text?: string; parentId?: string; children?: LegalRule[]; structuredContent?: any; }
export interface Playbook extends BaseEntity { name: string; jurisdiction: string; matterType: string; stages: any[]; }

// Discovery
export interface DiscoveryRequest extends BaseEntity { caseId: string; type: string; propoundingParty: string; respondingParty: string; serviceDate: string; dueDate: string; status: string; title: string; description: string; }
export interface Deposition extends BaseEntity { caseId: string; witnessName: string; date: string; location: string; status: string; courtReporter?: string; prepNotes?: string; }
export interface ESISource extends BaseEntity { caseId: string; name: string; type: string; custodian: string; status: string; size?: string; notes?: string; }
export interface ProductionSet extends BaseEntity { caseId: string; name: string; date: string; batesRange: string; docCount: number; size: string; format: string; status: string; }
export interface CustodianInterview extends BaseEntity { caseId: string; custodianName: string; department: string; status: string; interviewDate?: string; notes?: string; relevantSources?: string[]; legalHoldId?: string; }

// Operations & Finance
export interface Client extends BaseEntity { name: string; industry: string; status: string; totalBilled: number; matters: string[]; }
export interface TimeEntry extends BaseEntity { caseId: string; userId: string; date: string; duration: number; description: string; rate: number; total: number; status: string; invoiceId?: string; }
export interface Invoice extends BaseEntity { client: string; matter: string; caseId: string; date: string; dueDate: string; amount: number; status: string; items: string[]; }
export interface FirmExpense extends BaseEntity { date: string; category: string; description: string; amount: number; status: 'Paid' | 'Pending'; vendor: string; }
export interface FirmAsset extends BaseEntity { name: string; type: string; assignedTo: string; status: string; purchaseDate: string; value: number; serialNumber?: string; }
export interface StaffMember extends BaseEntity { userId: string; name: string; email: string; role: string; phone: string; billableTarget: number; currentBillable: number; utilizationRate: number; salary: number; status: string; startDate: string; }
export interface MarketingMetric { source: string; leads: number; conversions: number; revenue: number; roi: number; }

// Compliance & Knowledge
export interface Clause extends BaseEntity { name: string; category: string; content: string; version: number; usageCount: number; lastUpdated: string; riskRating: string; versions: any[]; }
export interface WikiArticle extends BaseEntity { title: string; category: string; content: string; lastUpdated: string; isFavorite: boolean; author: string; }
export interface Precedent extends BaseEntity { title: string; type: string; description: string; tag: string; docId: string; }
export interface QAItem extends BaseEntity { question: string; asker: string; time: string; answer: string; answerer: string; role: string; verified: boolean; }
export interface Risk extends BaseEntity { caseId: string; title: string; description: string; category: RiskCategory; probability: RiskLevel; impact: RiskLevel; status: RiskStatus; dateIdentified: string; lastUpdated: string; mitigationPlan?: string; }
export interface ConflictCheck extends BaseEntity { entityName: string; date: string; status: string; foundIn: string[]; checkedById: string; checkedBy: string; }
export interface EthicalWall extends BaseEntity { caseId: string; title: string; restrictedGroups: string[]; authorizedUsers: string[]; status: string; }
export interface AuditLogEntry extends BaseEntity { timestamp: string; userId: string; user: string; action: string; resource: string; ip: string; hash?: string; prevHash?: string; }

// Collaboration
export interface ConferralSession extends BaseEntity { caseId: string; topic: string; date: string; method: ConferralMethod; participants: string[]; notes: string; result: ConferralResult; nextSteps?: string; linkedMotionId?: string; }
export interface PlanSection { id: string; title: string; content: string; status: 'Agreed' | 'Disputed'; opposingComments?: string; }
export interface JointPlan extends BaseEntity { caseId: string; title: string; lastUpdated: string; status: string; sections: PlanSection[]; }
export interface StipulationRequest extends BaseEntity { title: string; requestingParty: string; proposedDate: string; status: string; reason: string; }

// Correspondence
export interface CommunicationItem extends BaseEntity { caseId: string; userId: string; subject: string; date: string; type: string; direction: string; sender: string; recipient: string; preview: string; hasAttachment: boolean; status: string; isPrivileged: boolean; }
export interface ServiceJob extends BaseEntity { caseId: string; requestorId: string; documentTitle: string; targetPerson: string; targetAddress: string; serverName: string; method: string; mailType?: string; trackingNumber?: string; addressedTo?: string; status: string; dueDate: string; attempts: number; servedDate?: string; gpsCoordinates?: string; notes?: string; signerName?: string; }

// Misc
export interface CalendarEventItem { id: string; title: string; date: string; type: string; description?: string; priority?: string; location?: string; }
export interface SystemNotification extends BaseEntity { text: string; time: string; read: boolean; type?: string; }
export interface JudgeProfile extends BaseEntity { name: string; court: string; grantRateDismiss: number; grantRateSummary: number; avgCaseDuration: number; tendencies: string[]; }
export interface OpposingCounselProfile extends BaseEntity { name: string; firm: string; settlementRate: number; trialRate: number; avgSettlementVariance: number; }

// Entity Director
export type EntityType = 'Individual' | 'Corporation' | 'Court' | 'Government' | 'Vendor' | 'Law Firm';
export type EntityRole = 'Client' | 'Opposing Counsel' | 'Judge' | 'Expert' | 'Witness' | 'Staff' | 'Prospect';

export interface LegalEntity extends BaseEntity {
  name: string;
  type: EntityType;
  roles: EntityRole[];
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  taxId?: string;
  company?: string;
  title?: string;
  barNumber?: string;
  jurisdiction?: string;
  status: 'Active' | 'Inactive' | 'Prospect' | 'Blacklisted' | 'Deceased';
  riskScore: number;
  tags: string[];
  notes?: string;
  linkedUserId?: string;
  avatar?: string;
  externalIds?: Record<string, string>;
}

export interface EntityRelationship extends BaseEntity {
  sourceId: string;
  targetId: string;
  type: 'Employment' | 'Subsidiary' | 'Counsel_For' | 'Sued_By' | 'Witness_For' | 'Family' | 'Conflict' | 'Board_Member';
  description?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
}
