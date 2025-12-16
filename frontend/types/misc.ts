// types/misc.ts
// Miscellaneous types - split from compatibility.ts

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

export interface Attachment { 
  id?: string;
  name: string; 
  size?: string | number; 
  type?: string; 
  sender?: string; 
  date?: string; 
  url?: string; 
}

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string;
  type: 'case' | 'deadline' | 'hearing' | 'task' | 'compliance';
  description?: string;
  priority?: string;
  location?: string;
}

export interface CasePhase {
  id: string;
  caseId: CaseId;
  name: string;
  startDate: string;
  duration: number;
  status: string;
  color: string;
}

export interface CommunicationItem extends BaseEntity { caseId: CaseId; userId: UserId; subject: string; date: string; type: string; direction: string; sender: string; recipient: string; preview: string; hasAttachment: boolean; status: string; isPrivileged: boolean; }

export interface Conversation extends BaseEntity { name: string; role: string; status: string; unread: number; isExternal: boolean; messages: Message[]; draft?: string; }

export interface EntityRelationship extends BaseEntity { sourceId: EntityId; targetId: EntityId; type: 'Employment' | 'Subsidiary' | 'Counsel_For' | 'Sued_By' | 'Witness_For' | 'Family' | 'Conflict' | 'Board_Member'; description?: string; startDate?: string; endDate?: string; active: boolean; weight?: number; }

export interface JudgeMotionStat { name: string; grant: number; deny: number; }

export interface JudgeProfile extends BaseEntity {
motionStats: never[]; name: string; court: string; grantRateDismiss: number; grantRateSummary: number; avgCaseDuration: number; tendencies: string[]; 
}

export interface LegalEntity extends BaseEntity { id: EntityId; name: string; type: EntityType; roles: EntityRole[]; email?: string; phone?: string; website?: string; address?: string; city?: string; state?: string; country?: string; taxId?: string; company?: string; title?: string; barNumber?: string; jurisdiction?: string; status: 'Active' | 'Inactive' | 'Prospect' | 'Blacklisted' | 'Deceased'; riskScore: number; tags: string[]; notes?: string; linkedUserId?: UserId; avatar?: string; externalIds?: Record<string, string>; aliases?: string[]; }

export interface Message extends BaseEntity { 
  conversationId?: string;
  senderId: UserId | 'me' | string; 
  text: string; 
  content?: string;
  timestamp: string; 
  status?: 'sent' | 'delivered' | 'read'; 
  read?: boolean;
  isPrivileged?: boolean; 
  attachments?: Attachment[]; 
}

export interface ModuleDefinition {
  id: string;
  label: string;
  component: LazyExoticComponent<any>;
  requiresAdmin?: boolean;
  intentMatcher?: (intent: string, context: any) => boolean;
  category: NavCategory;
  icon?: any;
}

export interface NexusNodeData { 
  id: string; 
  type: 'root' | 'org' | 'party' | 'evidence' | 'motion'; 
  label: string; 
  original: Case | Party | EvidenceItem | Motion | object; 
  status?: string;
}

export interface OpposingCounselProfile extends BaseEntity { name: string; firm: string; settlementRate: number; trialRate: number; avgSettlementVariance: number; }

export interface OutcomePredictionData {
  subject: string;
  A: number;
  fullMark: number;
}

export interface ParsedDocket {
  caseInfo: Partial<Case>;
  parties: Party[];
  docketEntries: DocketEntry[];
  deadlines?: any[];
}

export interface ProductionSet {
  id: string;
  caseId: CaseId;
  name: string;
  date: string;
  batesRange: string;
  docCount: number;
  size: string;
  format: string;
  status: 'Delivered' | 'Staging' | 'Failed';
}

export interface RealizationStat { id?: string; name: string; value: number; color: string; }

export interface ServiceJob extends BaseEntity { caseId: CaseId; requestorId: UserId; documentTitle: string; targetPerson: string; targetAddress: string; serverName: string; method: ServiceMethod; mailType?: string; trackingNumber?: string; addressedTo?: string; status: ServiceStatus; dueDate: string; attempts: number; servedDate?: string; gpsCoordinates?: string; notes?: string; signerName?: string; attemptHistory?: { date: string; result: string; lat?: number; long?: number }[]; }

export interface StaffMember {
  id: string;
  userId: UserId;
  name: string;
  email: string;
  role: 'Associate' | 'Paralegal' | 'Senior Partner' | 'Administrator';
  phone: string;
  billableTarget: number;
  currentBillable: number;
  utilizationRate: number;
  salary: number;
  status: 'Active' | 'Inactive';
  startDate: string;
}

export interface SystemNotification extends BaseEntity { text: string; time: string; read: boolean; type?: string; }

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'milestone' | 'document' | 'billing' | 'motion' | 'hearing' | 'task' | 'planning';
  description?: string;
  relatedId?: string;
}

export interface WIPStat { name: string; wip: number; billed: number; }

export interface WarRoomData { case: Case; witnesses: Party[]; documents: LegalDocument[]; motions: Motion[]; docket: DocketEntry[]; evidence: EvidenceItem[]; tasks: WorkflowTask[]; }
