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
// Backend Task entity enums (from tasks/dto/create-task.dto.ts)
export enum TaskStatusBackend {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum TaskPriorityBackend {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical' // Backend uses CRITICAL not URGENT
}

export interface WorkflowTask extends BaseEntity { 
  id: TaskId;
  // Core fields (EXACTLY aligned with backend Task entity)
  title: string;
  description?: string; // Backend: text, nullable
  status: TaskStatusBackend; // Backend: enum TaskStatus
  priority: TaskPriorityBackend; // Backend: enum TaskPriority
  dueDate?: string; // Backend: timestamp, nullable
  
  // Assignment (backend field names)
  assignedTo?: string; // Backend: assigned_to (uuid)
  createdBy?: string; // Backend: created_by (uuid)
  
  // Relationships
  caseId?: CaseId; // Backend: case_id (uuid, nullable)
  parentTaskId?: string; // Backend: parent_task_id (uuid, nullable)
  
  // Tracking (exact backend fields)
  tags?: string[]; // Backend: simple-array
  estimatedHours?: number; // Backend: estimated_hours decimal(10,2)
  actualHours?: number; // Backend: actual_hours decimal(10,2), default 0
  completionPercentage?: number; // Backend: completion_percentage int, default 0
  
  // Legacy aliases for backward compatibility
  assignee?: string; // Alias - use assignedTo
  assigneeId?: UserId; // Alias - use assignedTo
  projectId?: ProjectId; // Frontend extension
  startDate?: string; // Frontend extension
  relatedModule?: string; // Frontend extension
  relatedItemId?: string; // Frontend extension
  relatedItemTitle?: string; // Frontend extension
  actionLabel?: string; // Frontend extension
  automatedTrigger?: string; // Frontend extension
  linkedRules?: string[]; // Frontend extension
  dependencies?: TaskId[]; // Frontend extension
  dependencyType?: TaskDependencyType; // Frontend extension
  rrule?: string; // Frontend extension - recurring rule
  completion?: number; // Alias for completionPercentage
  slaId?: string; // Frontend extension
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

