// types/compliance-risk.ts
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

export interface Risk extends BaseEntity { 
  // Core fields (aligned with backend Risk entity)
  title: string; // Backend: varchar (required)
  description: string; // Backend: text, nullable
  impact: 'Low' | 'Medium' | 'High' | 'Critical'; // Backend: enum RiskImpact
  probability: 'Low' | 'Medium' | 'High'; // Backend: enum RiskProbability
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Closed'; // Backend: enum RiskStatus
  
  // Relationships
  caseId?: CaseId; // Backend: string/uuid, nullable
  
  // Mitigation
  mitigationStrategy?: string; // Backend: text
  mitigationPlan?: string; // Frontend alias
  
  // Scoring
  riskScore?: number; // Backend: decimal(3,1)
  
  // Tracking
  identifiedBy?: string; // Backend: string/uuid
  
  // Frontend-specific fields
  category?: RiskCategory; // Frontend categorization
  dateIdentified?: string;
  lastUpdated?: string;
}

export interface ConflictCheck extends BaseEntity { entityName: string; date: string; status: string; foundIn: string[]; checkedById: UserId; checkedBy: string; snapshot?: string; }

export interface EthicalWall extends BaseEntity { caseId: CaseId; title: string; restrictedGroups: GroupId[]; authorizedUsers: UserId[]; status: string; }

export interface AuditLogEntry extends BaseEntity { timestamp: string; userId: UserId; user: string; action: string; resource: string; ip: string; hash?: string; prevHash?: string; previousValue?: any; newValue?: any; }

export interface FirmAsset extends BaseEntity { name: string; type: string; assignedTo: string; status: string; purchaseDate: string; value: number; serialNumber?: string; }
