// types/case.ts
// Auto-generated from models.ts split

import {
  BaseEntity, UserId, OrgId, GroupId, DocumentId, EvidenceId,
  TaskId, EntityId, PartyId, MotionId, DocketId, ProjectId, 
  WorkflowTemplateId, CaseId, MatterId, Money, JurisdictionObject
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
  OcrStatus, TaskDependencyType, MatterStatus, MatterPriority, PracticeArea, BillingArrangement
} from './enums';
import { LucideIcon } from 'lucide-react';
import type { FC, LazyExoticComponent } from 'react';

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
  filingDate: string; // Backend: Date
  trialDate?: string; // Backend field
  closeDate?: string; // Backend field
  
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
  associatedCases?: any[];
  
  // Litigation details
  arguments: LegalArgument[];
  defenses: Defense[];
  magistrateJudge?: string;
  opposingCounsel?: string;
  origCaseNumber?: string;
  origCourt?: string;
  origJudgmentDate?: string;
  noticeOfAppealDate?: string;
  dateTerminated?: string;
  natureOfSuit?: string;
  
  // Financial
  value?: number;
  valuation?: Money;
  billingModel?: BillingModel;
  feeAgreement?: FeeAgreement;
  budget?: Money;
  budgetAlertThreshold?: number;
  
  // Metadata
  matterType: MatterType;
  matterSubType?: string;
  pacerData?: any;
  metadata?: Record<string, any>; // Backend: jsonb field
  isArchived: boolean; // Backend field (default: false)
  projects?: Project[];
  
  // Statute of limitations
  solDate?: string;
  solTriggerDate?: string;
}

export interface Party extends BaseEntity { 
  id: PartyId;
  // Core fields (aligned with backend Party entity)
  caseId: CaseId; // Backend: uuid (required), FK to cases
  name: string; // Backend: varchar(255)
  type: 'Plaintiff' | 'Defendant' | 'Petitioner' | 'Respondent' | 'Appellant' | 'Appellee' | 'Third Party' | 'Witness' | 'Expert Witness' | 'Other' | 'Individual' | 'Corporation' | 'Government'; // Backend: enum PartyType
  role: 'Primary' | 'Co-Party' | 'Interested Party' | 'Guardian' | 'Representative' | string; // Backend: enum PartyRole
  
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
  
  // Additional data
  notes?: string; // Backend: text
  metadata?: Record<string, any>; // Backend: jsonb
  
  // Frontend-specific (legacy)
  contact?: string;
  partyGroup?: string;
  linkedOrgId?: OrgId;
  representationType?: string;
  attorneys?: Attorney[];
  pacerData?: any;
  aliases?: string[];
  taxId?: string;
}
export interface Attorney { name: string; firm?: string; email?: string; phone?: string; address?: string; type?: string; }
export interface CaseTeamMember { userId: UserId; role: 'Lead' | 'Support' | 'Paralegal'; rateOverride?: Money; }

// Matter Management (aligned with backend Matter entity)
export interface Matter extends BaseEntity {
  id: MatterId;
  matterNumber: string; // Auto-generated: MAT-YYYY-NNNN
  title: string;
  description?: string;
  type: MatterType;
  status: MatterStatus;
  priority: MatterPriority;
  practiceArea: PracticeArea;
  
  // Client Information
  clientId: UserId;
  clientName: string;
  clientContact?: string;
  clientEmail?: string;
  clientPhone?: string;
  
  // Attorney Assignment
  responsibleAttorneyId: UserId;
  responsibleAttorneyName: string;
  originatingAttorneyId?: UserId;
  originatingAttorneyName?: string;
  teamMembers?: UserId[];
  
  // Conflict Check
  conflictCheckStatus?: 'pending' | 'cleared' | 'conflict' | 'waived';
  conflictCheckDate?: string;
  conflictCheckNotes?: string;
  
  // Important Dates
  intakeDate: string;
  openedDate?: string;
  closedDate?: string;
  statute_of_limitations?: string;
  
  // Billing & Financial
  billingArrangement: BillingArrangement;
  estimatedValue?: number;
  budgetAmount?: number;
  retainerAmount?: number;
  hourlyRate?: number;
  contingencyPercentage?: number;
  
  // Court Information
  courtName?: string;
  caseNumber?: string;
  judgeAssigned?: string;
  jurisdiction?: string;
  jurisdictions?: string[];
  
  // Opposing Parties
  opposingCounsel?: Array<{
    name: string;
    firm?: string;
    email?: string;
    phone?: string;
  }>;
  
  // Tags & Custom
  tags?: string[];
  customFields?: Record<string, any>;
  
  // Metadata
  userId: UserId;
}

