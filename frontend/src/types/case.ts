// types/case.ts
// Auto-generated from models.ts split

import {
  BaseEntity, UserId, OrgId,
  EntityId, PartyId,
  CaseId, MatterId, Money, JurisdictionObject, MetadataRecord, JsonValue
} from './primitives';
import {
  CaseStatus, MatterType, BillingModel,
  
  
  
  
  
  
  
  MatterStatus, MatterPriority, BillingArrangement
} from './enums';
import { FeeAgreement } from './financial';
import { Citation, LegalArgument, Defense } from './legal-research';
import { Project } from './workflow';

// --- CLUSTER 2: CASE & LITIGATION ---
export interface Case extends BaseEntity { 
  id: CaseId;
  // Core fields (aligned with backend)
  title: string;
  caseNumber?: string; // Backend has this as unique field
  description?: string;
  type?: MatterType; // Maps to backend 'type' enum
  status: CaseStatus;
  practiceArea?: string; // Backend field
  jurisdiction?: string;
  jurisdictionConfig?: JurisdictionObject;
  court?: string;
  judge?: string;
  referredJudge?: string; // Backend: referred_judge
  magistrateJudge?: string; // Backend: magistrate_judge
  filingDate: string; // Backend: Date
  trialDate?: string; // Backend field
  closeDate?: string; // Backend field
  dateTerminated?: string; // Backend: date_terminated
  juryDemand?: string; // Backend: jury_demand
  
  // Team & ownership
  assignedTeamId?: string; // Backend field
  leadAttorneyId?: string; // Backend field (maps to ownerId)
  ownerId?: UserId; // Frontend legacy
  ownerOrgId?: OrgId;
  team?: CaseTeamMember[];
  
  // Client relationship
  client: string; // Display name
  clientId?: UserId | EntityId; // Backend: uuid (required)
  
  // Relationships
  parties: Party[];
  citations: Citation[];
  linkedCaseIds?: CaseId[];
  leadCaseId?: CaseId;
  isConsolidated?: boolean;
  associatedCases?: { caseId: CaseId; relationship: string }[];
  
  // Litigation details
  arguments: LegalArgument[];
  defenses: Defense[];
  opposingCounsel?: string;
  origCaseNumber?: string;
  origCourt?: string;
  origJudgmentDate?: string;
  noticeOfAppealDate?: string;
  causeOfAction?: string; // Backend: cause_of_action (e.g., '28:0158 Bankruptcy Appeal')
  natureOfSuit?: string; // Backend: nature_of_suit
  natureOfSuitCode?: string; // Backend: nature_of_suit_code (e.g., '422')
  relatedCases?: { court: string; caseNumber: string; relationship?: string }[]; // Backend: jsonb
  
  // Financial
  value?: number;
  valuation?: Money;
  billingModel?: BillingModel;
  billingValue?: number; // Total billed amount
  feeAgreement?: FeeAgreement;
  budget?: Money;
  budgetAlertThreshold?: number;
  
  // Metadata
  matterType: MatterType;
  matterSubType?: string;
  pacerData?: PacerData;
  metadata?: MetadataRecord; // Backend: jsonb field
  isArchived: boolean; // Backend field (default: false)
  projects?: Project[];
  
  // Statute of limitations
  solDate?: string;
  solTriggerDate?: string;
}

/**
 * Party type discriminated union for type safety
 * @see Backend: parties/entities/party.entity.ts
 */
export type PartyType = 
  | 'Plaintiff' 
  | 'Defendant' 
  | 'Petitioner' 
  | 'Respondent' 
  | 'Appellant' 
  | 'Appellee' 
  | 'Third Party' 
  | 'Witness' 
  | 'Expert Witness' 
  | 'Other' 
  | 'Individual' 
  | 'Corporation' 
  | 'Government';

/**
 * Party role in case
 */
export type PartyRole = 
  | 'Primary' 
  | 'Co-Party' 
  | 'Interested Party' 
  | 'Guardian' 
  | 'Representative' 
  | string;

/**
 * Party entity representing individuals or organizations involved in a case
 * @see Backend: parties/entities/party.entity.ts
 * 
 * Represents plaintiffs, defendants, witnesses, and other case participants.
 * Includes attorney representation and contact information.
 */
export type Party = BaseEntity & { 
  readonly id: PartyId;
  // Core fields (aligned with backend Party entity)
  readonly caseId: CaseId; // Backend: uuid (required), FK to cases
  readonly name: string; // Backend: varchar(255)
  readonly description?: string; // Backend: varchar(500) - e.g., 'A Community Association'
  readonly type: PartyType; // Backend: enum PartyType
  readonly role: PartyRole; // Backend: enum PartyRole
  
  // Organization
  organization?: string; // Backend: varchar(255)
  
  // Contact information
  email?: string; // Backend: varchar(255)
  phone?: string; // Backend: varchar(50)
  address?: string; // Backend: text
  city?: string; // Backend: varchar(100)
  state?: string; // Backend: varchar(100)
  zipCode?: string; // Backend: varchar(20)
  country?: string; // Backend: varchar(100)
  
  // Legal representation
  counsel?: string; // Backend: varchar(255)
  attorneyName?: string; // Backend: attorney_name
  attorneyFirm?: string; // Backend: attorney_firm
  attorneyBarNumber?: string; // Backend: attorney_bar_number
  attorneyEmail?: string; // Backend: attorney_email
  attorneyPhone?: string; // Backend: attorney_phone
  attorneyAddress?: string; // Backend: attorney_address (text)
  attorneyFax?: string; // Backend: attorney_fax
  isLeadAttorney?: boolean; // Backend: is_lead_attorney (default: false)
  isAttorneyToBeNoticed?: boolean; // Backend: is_attorney_to_be_noticed (default: false)
  isProSe?: boolean; // Backend: is_pro_se (default: false)
  
  // Additional data
  notes?: string; // Backend: text
  metadata?: MetadataRecord; // Backend: jsonb
  
  // Frontend-specific (legacy)
  contact?: string;
  partyGroup?: string;
  linkedOrgId?: OrgId;
  representationType?: string;
  attorneys?: Attorney[];
  pacerData?: JsonValue;
  readonly aliases?: readonly string[];
  readonly taxId?: string;
};

/**
 * Attorney representation information
 * Value object for party legal counsel
 */
export type Attorney = {
  readonly name: string;
  readonly firm?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: string;
  readonly type?: string;
};

/**
 * Case team member role assignment (lightweight version)
 * Associates users with cases and billing rates
 * For full team member details, see case-team.ts
 */
export type CaseTeamMemberRole = {
  readonly userId: UserId;
  readonly role: 'Lead' | 'Support' | 'Paralegal';
  readonly rateOverride?: Money;
};

/**
 * Matter Management entity
 * @see Backend: matters/entities/matter.entity.ts
 * @see Backend: matters table
 * 
 * Represents client matters with billing, assignment, and lifecycle tracking.
 * EXACTLY aligned with backend Matter entity field names and types.
 * 
 * @property matterNumber - Unique matter identifier (required, indexed)
 * @property status - Lifecycle state (INTAKE → ACTIVE → CLOSED)
 * @property matterType - Classification (LITIGATION, TRANSACTIONAL, etc.)
 * @property priority - Urgency level for resource allocation
 */
export type Matter = BaseEntity & {
  readonly id: MatterId;
  
  // Core Identification (backend field names)
  matterNumber: string; // Backend: matternumber varchar unique (required)
  title: string; // Backend: varchar (required)
  description?: string; // Backend: text
  
  // Status & Classification (backend enums)
  status: MatterStatus; // Backend: enum (default: INTAKE -> ACTIVE in DB)
  matterType: MatterType; // Backend: type enum (default: OTHER)
  priority: MatterPriority; // Backend: enum (default: MEDIUM)
  practiceArea?: string; // Backend: practicearea varchar
  
  // Client Information (backend exact fields)
  clientId?: string; // Backend: clientid uuid
  clientName?: string; // Backend: clientname varchar
  
  // Attorney Assignment (backend exact field names)
  leadAttorneyId?: string; // Backend: responsibleattorneyid uuid
  leadAttorneyName?: string; // Backend: responsibleattorneyname varchar
  originatingAttorneyId?: string; // Backend: originatingattorneyid uuid
  originatingAttorneyName?: string; // Backend: originatingattorneyname varchar
  
  // Jurisdictional Information
  jurisdiction?: string; // Backend: varchar
  venue?: string; // Backend: varchar
  
  // Financial (backend exact fields)
  billingType?: string; // Backend: billingarrangement varchar
  hourlyRate?: number; // Backend: hourlyrate decimal(10,2)
  flatFee?: number; // Backend: flatfee decimal(10,2)
  contingencyPercentage?: number; // Backend: contingencypercentage decimal(5,2)
  retainerAmount?: number; // Backend: retaineramount decimal(10,2)
  estimatedValue?: number; // Backend: estimatedvalue decimal(12,2)
  budgetAmount?: number; // Backend: budgetamount decimal(12,2)
  
  // Important Dates (backend exact field names)
  openedDate: string; // Backend: openeddate date (required)
  targetCloseDate?: string; // Backend: targetclosedate date
  closedDate?: string; // Backend: actualclosedate date
  statute_of_limitations?: string; // Backend: statuteoflimitationsdate date
  
  // Tags & Opposing Party
  tags?: string[]; // Backend: jsonb
  opposingPartyName?: string; // Backend: opposingpartyname varchar (from DTO)
  opposingCounsel?: JsonValue; // Backend: opposingcounsel jsonb
  opposingCounselFirm?: string; // Backend: opposingcounselfirm varchar (from DTO)
  
  // Conflict Check (backend exact fields)
  conflictCheckCompleted: boolean; // Backend: conflictcheckcompleted boolean (default: false)
  conflictCheckDate?: string; // Backend: conflictcheckdate date
  conflictCheckNotes?: string; // Backend: conflictchecknotes text
  
  // Risk Management (from CreateMatterDto)
  riskLevel?: string; // Backend DTO: riskLevel varchar
  riskNotes?: string; // Backend DTO: riskNotes text (max 5000)
  
  // Resources & Location
  officeLocation?: string; // Backend: officelocation varchar
  relatedMatterIds?: JsonValue; // Backend: relatedmatterids jsonb
  linkedCaseIds?: string[]; // Backend DTO: linkedCaseIds string array
  linkedDocumentIds?: string[]; // Backend DTO: linkedDocumentIds string array
  
  // Notes & Custom Fields
  internalNotes?: string; // Backend: internalnotes text
  customFields?: MetadataRecord; // Backend: customfields jsonb
  
  // Metadata (backend exact fields)
  createdBy: UserId; // Backend: createdby varchar (required)
  updatedBy?: UserId; // Backend: updatedby varchar
  isArchived?: boolean; // Backend: isarchived boolean (default: false)

  // Legacy aliases for backward compatibility
  type?: MatterType; // Alias for matterType
  responsibleAttorneyId?: string; // Alias for leadAttorneyId
  responsibleAttorneyName?: string; // Alias for leadAttorneyName
  billingArrangement?: BillingArrangement; // Alias for billingType
  intakeDate?: string; // Alias for openedDate
  userId?: UserId; // Deprecated - use createdBy

  // Frontend-only fields (not in backend)
  clientContact?: string;
  clientEmail?: string;
  clientPhone?: string;
  teamMembers?: UserId[];
  courtName?: string;
  court?: string; // Alias for courtName
  caseNumber?: string;
  judgeAssigned?: string;
  jurisdictions?: string[];
  conflictCheckStatus?: 'pending' | 'cleared' | 'conflict' | 'waived';
}

/**
 * PACER case data structure
 */
export interface PacerData {
  docketNumber?: string;
  court?: string;
  filingDate?: string;
  caseType?: string;
  nature?: string;
  jurisdiction?: string;
  assigned?: { judge?: string; magistrate?: string };
  parties?: Array<{ name: string; type: string; role: string }>;
  docket?: Array<{ date: string; number: string; description: string }>;
  metadata?: MetadataRecord;
}

/**
 * Computed deadline from docket entry analysis
 */
export interface DeadlineComputation {
  id: string;
  docketEntryId: string;
  description: string;
  dueDate: string;
  jurisdiction: string;
  rule: string;
  daysFromTrigger: number;
  status: 'pending' | 'completed' | 'missed' | 'cancelled';
}
