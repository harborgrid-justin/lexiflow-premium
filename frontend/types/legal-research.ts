// types/legal-research.ts
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

export interface Citation extends BaseEntity { citation: string; title: string; type: string; description?: string; relevance: string; shepardsSignal: string; embedding?: number[]; }

export interface LegalArgument extends BaseEntity { title: string; description: string; strength: number; status: string; relatedCitationIds: string[]; relatedEvidenceIds: EvidenceId[]; }

export interface Defense extends BaseEntity { title: string; type: string; status: string; description?: string; }

export interface ResearchSession extends BaseEntity { userId: UserId; query: string; response: string; sources: SearchResult[]; timestamp: string; }

export interface BriefAnalysisSession extends BaseEntity { textSnapshot: string; extractedCitations: string[]; riskScore: number; strengths: string[]; weaknesses: string[]; suggestions: string[]; missingAuthority: string[]; timestamp: string; }

export interface LegalRule extends BaseEntity { code: string; name: string; type: LegalRuleType; level?: string; summary?: string; text?: string; parentId?: string; children?: LegalRule[]; structuredContent?: any; }

export interface Playbook extends BaseEntity { name: string; jurisdiction: string; matterType: string; stages: any[]; }

export interface WikiArticle extends BaseEntity { title: string; category: string; content: string; lastUpdated: string; isFavorite: boolean; author: string; }

export interface Precedent extends BaseEntity { title: string; type: string; description: string; tag: string; docId: DocumentId; embedding?: number[]; }

export interface QAItem extends BaseEntity { question: string; asker: string; time: string; answer: string; answerer: string; role: string; verified: boolean; }
