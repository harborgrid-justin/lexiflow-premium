// types/pleadings.ts
// Domain-specific types - split from compatibility.ts

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

export interface Pleading extends BaseEntity {
  // Core fields (aligned with backend Pleading entity)
  title: string; // Backend: varchar (required)
  description?: string; // Backend: text, nullable
  type: 'complaint' | 'answer' | 'motion' | 'brief' | 'memorandum' | 'reply' | 'opposition' | 'petition' | 'response'; // Backend: enum PleadingType
  caseId: CaseId; // Backend: uuid (required), FK to cases
  documentId?: DocumentId; // Backend: uuid
  status: 'draft' | 'review' | 'approved' | 'filed' | 'rejected' | 'withdrawn'; // Backend: enum PleadingStatus
  filedDate?: string; // Backend: timestamp
  filedBy?: string; // Backend: varchar
  courtName?: string; // Backend: varchar
  caseNumber?: string; // Backend: varchar
  docketNumber?: string; // Backend: varchar
  hearingDate?: string; // Backend: timestamp
  judge?: string; // Backend: varchar
  parties?: string[]; // Backend: simple-array
  summary?: string; // Backend: text
  customFields?: Record<string, any>; // Backend: jsonb
  tags?: string[]; // Backend: simple-array
  createdBy?: string; // Backend: uuid
  updatedBy?: string; // Backend: uuid
}

export interface Clause extends BaseEntity { 
  // Core fields (aligned with backend Clause entity)
  title: string; // Backend: varchar (required)
  name?: string; // Frontend legacy alias
  content: string; // Backend: text (required)
  description?: string; // Backend: text, nullable
  category: 'general' | 'contract' | 'motion' | 'pleading' | 'discovery' | 'custom' | string; // Backend: enum ClauseCategory
  tags?: string[]; // Backend: simple-array
  variables?: Record<string, any>; // Backend: jsonb
  isActive?: boolean; // Backend: boolean, default true
  usageCount: number; // Backend: int, default 0
  lastUsedAt?: string; // Backend: timestamp
  createdBy?: string; // Backend: uuid
  updatedBy?: string; // Backend: uuid
  metadata?: any; // Backend field
  // Frontend legacy fields
  version?: number;
  lastUpdated?: string;
  riskRating?: string;
  versions?: any[];
  embedding?: number[];
}

export interface PlanSection { id: string; title: string; content: string; status: 'Agreed' | 'Disputed'; opposingComments?: string; }

export interface JointPlan extends BaseEntity { caseId: CaseId; title: string; lastUpdated: string; status: string; sections: PlanSection[]; }

export interface StipulationRequest extends BaseEntity { title: string; requestingParty: string; proposedDate: string; status: string; reason: string; caseId?: CaseId; }
