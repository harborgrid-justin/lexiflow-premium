// types/workflow.ts
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

// --- CLUSTER 6: WORKFLOW & AUTOMATION ---
export interface WorkflowTask extends BaseEntity { 
  id: TaskId;
  // Core fields (aligned with backend Task entity)
  title: string;
  description?: string; // Backend: text, nullable
  status: TaskStatus; // Backend: enum TaskStatus (TODO, IN_PROGRESS, DONE, CANCELLED)
  priority: 'Low' | 'Medium' | 'High' | 'Critical'; // Backend: enum TaskPriority (LOW, MEDIUM, HIGH, URGENT)
  dueDate: string; // Backend: timestamp
  
  // Assignment
  assignee: string; // Display name
  assigneeId?: UserId; // Backend: assignedTo (string/uuid)
  createdBy?: string; // Backend: uuid
  
  // Relationships
  caseId?: CaseId; // Backend: string/uuid, nullable
  projectId?: ProjectId;
  parentTaskId?: string; // Backend: uuid, nullable
  
  // Tracking
  tags?: string[]; // Backend: simple-array
  estimatedHours?: number; // Backend: decimal(10,2)
  actualHours?: number; // Backend: decimal(10,2), default 0
  completionPercentage?: number; // Backend: int, default 0
  
  // Frontend-specific fields
  startDate?: string;
  relatedModule?: string;
  relatedItemId?: string;
  relatedItemTitle?: string;
  actionLabel?: string;
  automatedTrigger?: string;
  linkedRules?: string[];
  dependencies?: TaskId[];
  dependencyType?: TaskDependencyType;
  rrule?: string; // Recurring rule
  completion?: number; // Alias for completionPercentage
  slaId?: string;
}
export interface SLAConfig extends BaseEntity { name: string; targetHours: number; warningThresholdHours: number; businessHoursOnly: boolean; }
export interface ApprovalChain extends BaseEntity { name: string; steps: { role: UserRole; userId?: UserId; order: number }[]; }
export interface WorkflowStage { id: string; title: string; status: StageStatus | string; tasks: WorkflowTask[]; }
export interface WorkflowTemplateData extends BaseEntity { id: WorkflowTemplateId; title: string; category: string; complexity: 'Low' | 'Medium' | 'High'; duration: string; tags: string[]; auditReady: boolean; stages: string[]; }
export interface Project extends BaseEntity { 
  id: ProjectId;
  // Core fields (aligned with backend Project entity)
  name: string; // Backend: varchar(255)
  description?: string; // Backend: text, nullable
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled'; // Backend: enum ProjectStatus
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'; // Backend: enum ProjectPriority
  
  // Relationships
  caseId?: CaseId; // Backend: uuid, nullable, with FK to cases
  projectManagerId?: string; // Backend: uuid, nullable
  assignedTeamId?: string; // Backend: uuid, nullable
  
  // Dates
  startDate?: string; // Backend: date
  dueDate?: string; // Backend: date
  completedDate?: string; // Backend: date
  
  // Progress tracking
  completionPercentage: number; // Backend: decimal(5,2), default 0
  estimatedHours?: number; // Backend: decimal(12,2)
  actualHours?: number; // Backend: decimal(12,2)
  budget?: number; // Backend: decimal(12,2)
  
  // Content
  notes?: string; // Backend: text
  tasks?: Array<{ // Backend: jsonb
    id: string;
    name: string;
    assignedTo?: string;
    status: string;
    dueDate?: string;
    completedDate?: string;
  }>;
  milestones?: Array<{ // Backend: jsonb
    name: string;
    dueDate?: string;
    completedDate?: string;
    status: string;
  }>;
  metadata?: Record<string, any>; // Backend: jsonb
  
  // Frontend-specific (legacy)
  title?: string; // Alias for name
  lead?: string; // Alias for projectManagerId
}

