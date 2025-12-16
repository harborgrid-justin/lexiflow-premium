// types/trial.ts
// Auto-generated from models.ts split

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
import { LucideIcon } from 'lucide-react';
import type { FC, LazyExoticComponent } from 'react';

// --- CLUSTER 5: TRIAL & STRATEGY ---
export interface Juror extends BaseEntity { caseId: CaseId; name: string; status: 'Panel' | 'Seated' | 'Struck' | 'Alternate'; strikeParty?: 'Plaintiff' | 'Defense'; notes?: string; demographics?: any; }
export interface Witness extends BaseEntity { caseId: CaseId; name: string; type: 'Fact' | 'Expert'; credibilityScore: number; impeachmentRisks?: string[]; prepStatus: number; linkedExhibits?: string[]; }
export interface DepositionDesignation { id: string; depositionId: string; pageStart: number; lineStart: number; pageEnd: number; lineEnd: number; party: string; objection?: string; ruling?: string; }
export interface OpeningStatement extends BaseEntity { caseId: CaseId; sections: { title: string; durationMinutes: number; linkedExhibitIds: string[] }[]; }
export interface Fact extends BaseEntity { caseId: CaseId; date: string; description: string; type: 'Undisputed' | 'Disputed' | 'Stipulated'; supportingEvidenceIds: EvidenceId[]; }
export interface StandingOrder extends BaseEntity { judgeId: string; judgeName: string; title: string; updated: string; url: string; }

