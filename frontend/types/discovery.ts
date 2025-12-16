// types/discovery.ts
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

export interface ConferralSession extends BaseEntity { caseId: CaseId; topic: string; date: string; method: ConferralMethod; participants: string[]; notes: string; result: ConferralResult; nextSteps?: string; linkedMotionId?: MotionId; }
