// types/compliance-risk.ts
// Domain-specific types - split from compatibility.ts

import {
  BaseEntity, UserId, GroupId,
  CaseId, JsonValue} from './primitives';
import {
  
  RiskCategory
  
  
  
  
  
  
  } from './enums';

// Backend Risk entity enums (from risks/dto/create-risk.dto.ts)
export enum RiskImpact {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum RiskProbability {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

// Backend Risk Status enum - MUST match backend/src/risks/dto/create-risk.dto.ts
export enum RiskStatusEnum {
  OPEN = 'Open',
  MONITORING = 'Monitoring',
  MITIGATED = 'Mitigated',
  CLOSED = 'Closed',
  IDENTIFIED = "IDENTIFIED"
}

export interface Risk extends BaseEntity { 
  // Core fields (EXACTLY aligned with backend Risk entity)
  title: string; // Backend: varchar (required)
  description?: string; // Backend: text, nullable
  impact: RiskImpact; // Backend: enum RiskImpact
  probability: RiskProbability; // Backend: enum RiskProbability
  status: RiskStatusEnum; // Backend: enum RiskStatus (default: OPEN)
  
  // Relationships
  caseId?: CaseId; // Backend: string/uuid, nullable
  
  // Mitigation
  mitigationStrategy?: string; // Backend: text
  
  // Scoring
  riskScore?: number; // Backend: decimal(3,1), nullable
  
  // Tracking
  identifiedBy?: string; // Backend: string/uuid, nullable
  
  // Legacy aliases for backward compatibility
  mitigationPlan?: string; // Alias for mitigationStrategy
  category?: RiskCategory; // Frontend categorization (deprecated)
  dateIdentified?: string; // Use createdAt instead
  lastUpdated?: string; // Use updatedAt instead
}

export interface ConflictCheck extends BaseEntity { entityName: string; date: string; status: string; foundIn: string[]; checkedById: UserId; checkedBy: string; snapshot?: string; }

export interface EthicalWall extends BaseEntity { caseId: CaseId; title: string; restrictedGroups: GroupId[]; authorizedUsers: UserId[]; status: string; }

export interface AuditLogEntry extends BaseEntity { timestamp: string; userId: UserId; user: string; action: string; resource: string; ip: string; hash?: string; prevHash?: string; previousValue?: JsonValue; newValue?: JsonValue; }

export interface FirmAsset extends BaseEntity { name: string; type: string; assignedTo: string; status: string; purchaseDate: string; value: number; serialNumber?: string; }
