// types/evidence.ts
// Domain-specific types - split from compatibility.ts

import {
  BaseEntity, UserId, OrgId, GroupId, DocumentId, EvidenceId,
  TaskId, EntityId, PartyId, MotionId, DocketId, ProjectId, 
  WorkflowTemplateId, CaseId, Money, JurisdictionObject, UUID
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

export interface TrialExhibit extends BaseEntity { 
  // Core fields (aligned with backend Exhibit entity)
  exhibitNumber: string; // Backend: varchar unique (required)
  description: string; // Backend: varchar (required)
  type: 'Document' | 'Photo' | 'Video' | 'Audio' | 'Physical' | 'Demonstrative' | 'Expert Report' | 'Other'; // Backend: enum ExhibitType
  status: 'Draft' | 'Marked' | 'Offered' | 'Admitted' | 'Excluded' | 'Withdrawn'; // Backend: enum ExhibitStatus
  caseId: CaseId; // Backend: uuid (required)
  documentId?: DocumentId; // Backend: uuid
  source?: string; // Backend: varchar
  tags?: string[]; // Backend: simple-array
  custodian?: string; // Backend: varchar
  admissionDate?: string; // Backend: timestamp
  admittedBy?: string; // Backend: varchar
  
  // Frontend-specific (legacy)
  title?: string; // Alias for description
  dateMarked?: string;
  party?: string;
  fileType?: string;
  witness?: string;
  uploadedBy?: string;
  admissibilityHistory?: { date: string; status: string; ruling?: string }[];
}

export interface ChainOfCustodyEvent {
  id: string;
  date: string;
  action: string;
  actor: string;
  notes?: string;
  hash?: string;
}

export interface EvidenceItem extends BaseEntity { id: EvidenceId; caseId: CaseId; title: string; type: EvidenceType; description: string; collectionDate: string; collectedBy: string; custodian: string; location: string; admissibility: AdmissibilityStatus; tags: string[]; blockchainHash?: string; trackingUuid: UUID; chainOfCustody: ChainOfCustodyEvent[]; chunks?: FileChunk[]; fileSize?: string; fileType?: string; linkedRules?: string[]; status?: string; authenticationMethod?: 'Self-Authenticated' | 'Stipulation' | 'Testimony' | 'Pending'; hearsayStatus?: 'Not Hearsay' | 'Exception Applies' | 'Objectionable' | 'Unanalyzed'; isOriginal?: boolean; relevanceScore?: number; expertId?: string; }
