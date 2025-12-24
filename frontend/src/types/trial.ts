// types/trial.ts
// Auto-generated from models.ts split

import {
  BaseEntity, UserId, OrgId, GroupId, DocumentId, EvidenceId,
  TaskId, EntityId, PartyId, MotionId, DocketId, ProjectId,
  WorkflowTemplateId, CaseId, Money, JurisdictionObject, MetadataRecord
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
import { LucideIcon } from 'lucide-react';
import type { FC, LazyExoticComponent } from 'react';

// --- CLUSTER 5: TRIAL & STRATEGY ---
export interface Juror extends BaseEntity { 
  caseId: CaseId; 
  jurorNumber?: string;
  name: string; 
  status: 'Panel' | 'Seated' | 'Struck' | 'Alternate' | 'Dismissed'; 
  strikeParty?: 'Plaintiff' | 'Defense'; 
  strikeReason?: string;
  peremptoryStrike?: boolean;
  causeStrike?: string;
  notes?: string; 
  demographics?: {
    age?: number;
    gender?: string;
    occupation?: string;
    education?: string;
    maritalStatus?: string;
    zipCode?: string;
  };
  questionnaire?: MetadataRecord;
  biasIndicators?: string[];
  rating?: number; // 1-10 scale
  seatedDate?: string;
  struckDate?: string;
}

export interface Witness extends BaseEntity { 
  caseId: CaseId; 
  name: string; 
  witnessType: 'fact_witness' | 'expert_witness' | 'character_witness' | 'rebuttal_witness' | 'impeachment_witness';
  status: 'identified' | 'contacted' | 'interviewed' | 'subpoenaed' | 'deposed' | 'testifying' | 'testified' | 'unavailable' | 'withdrawn';
  email?: string;
  phone?: string;
  address?: string;
  organization?: string;
  title?: string;
  expertise?: string;
  credibilityScore?: number; 
  impeachmentRisks?: string[]; 
  prepStatus?: number; 
  linkedExhibits?: string[];
  notes?: string;
  contactedAt?: string;
  interviewedAt?: string;
  subpoenaedAt?: string;
  deposedAt?: string;
  testifiedAt?: string;
  metadata?: MetadataRecord;
  // Expert witness specific
  cvUrl?: string;
  hourlyRate?: number;
  retainerAmount?: number;
  opinions?: string[];
  reportsSubmitted?: string[];
  dauberChallengeRisk?: 'Low' | 'Medium' | 'High';
}
export interface DepositionDesignation { id: string; depositionId: string; pageStart: number; lineStart: number; pageEnd: number; lineEnd: number; party: string; objection?: string; ruling?: string; }
export interface OpeningStatement extends BaseEntity { caseId: CaseId; sections: { title: string; durationMinutes: number; linkedExhibitIds: string[] }[]; }
export interface Fact extends BaseEntity { caseId: CaseId; date: string; description: string; type: 'Undisputed' | 'Disputed' | 'Stipulated'; supportingEvidenceIds: EvidenceId[]; }
export interface StandingOrder extends BaseEntity { judgeId: string; judgeName: string; title: string; updated: string; url: string; }

// War Room - Strategic Planning (backend: war-room module)
export enum ExpertType {
  TECHNICAL = 'Technical',
  MEDICAL = 'Medical',
  FINANCIAL = 'Financial',
  FORENSIC = 'Forensic',
  INDUSTRY = 'Industry',
  OTHER = 'Other'
}

export interface Advisor extends BaseEntity {
  // Backend: advisors table
  name: string;
  email: string;
  phone?: string;
  firm?: string;
  specialty?: string;
  caseId?: string;
  isActive: boolean;
}

export interface Expert extends BaseEntity {
  // Backend: experts table
  name: string;
  expertType: ExpertType;
  email: string;
  phone?: string;
  hourlyRate?: number;
  credentials?: string;
  caseId?: string;
  isActive: boolean;
}

export interface CaseStrategy extends BaseEntity {
  // Backend: case_strategies table
  caseId: string;
  objective?: string;
  approach?: string;
  keyArguments?: string;
}

