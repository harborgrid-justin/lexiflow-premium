export interface Matter {
  id: string;
  matterNumber: string;
  title: string;
  description?: string;
  status: MatterStatus;
  matterType: MatterType;
  priority: MatterPriority;
  clientId?: string;
  clientName?: string;
  leadAttorneyId?: string;
  leadAttorneyName?: string;
  originatingAttorneyId?: string;
  originatingAttorneyName?: string;
  jurisdiction?: string;
  venue?: string;
  practiceArea?: string;
  billingType?: string;
  hourlyRate?: number;
  flatFee?: number;
  contingencyPercentage?: number;
  retainerAmount?: number;
  estimatedValue?: number;
  budgetAmount?: number;
  openedDate: Date;
  targetCloseDate?: Date;
  closedDate?: Date;
  statute_of_limitations?: Date;
  tags?: string[];
  opposingCounsel?: Record<string, unknown>;
  conflictCheckCompleted: boolean;
  conflictCheckDate?: Date;
  conflictCheckNotes?: string;
  officeLocation?: string;
  relatedMatterIds?: string[];
  internalNotes?: string;
  customFields?: Record<string, unknown>;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MatterStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
  INTAKE = 'INTAKE',
}

export enum MatterType {
  LITIGATION = 'LITIGATION',
  TRANSACTIONAL = 'TRANSACTIONAL',
  ADVISORY = 'ADVISORY',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  EMPLOYMENT = 'EMPLOYMENT',
  REAL_ESTATE = 'REAL_ESTATE',
  CORPORATE = 'CORPORATE',
  OTHER = 'OTHER',
}

export enum MatterPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface MatterWithDetails extends Matter {
  caseCount?: number;
  activeDeadlines?: number;
  upcomingDeadlines?: CaseDeadline[];
  conflictStatus?: 'cleared' | 'pending' | 'issues';
  relatedMattersCount?: number;
}

export interface CaseDeadline {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  deadlineType: DeadlineType;
  deadlineDate: Date;
  originalDeadlineDate?: Date;
  status: DeadlineStatus;
  priority: DeadlinePriority;
  jurisdictionRuleId?: string;
  ruleCitation?: string;
  triggerEvent?: string;
  triggerDate?: Date;
  daysFromTrigger?: number;
  businessDaysOnly: boolean;
  assignedTo?: string;
  assignedTeamId?: string;
  completedDate?: Date;
  completedBy?: string;
  completionNotes?: string;
  notes?: string;
  isCourtImposed: boolean;
  isStatutory: boolean;
}

export enum DeadlineType {
  FILING = 'filing',
  RESPONSE = 'response',
  DISCOVERY = 'discovery',
  MOTION = 'motion',
  TRIAL = 'trial',
  APPEAL = 'appeal',
  CUSTOM = 'custom',
}

export enum DeadlineStatus {
  PENDING = 'pending',
  UPCOMING = 'upcoming',
  DUE_TODAY = 'due_today',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXTENDED = 'extended',
}

export enum DeadlinePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface TimelineEvent {
  id: string;
  type: 'filing' | 'deadline' | 'hearing' | 'motion' | 'discovery' | 'milestone' | 'document' | 'note' | 'status_change';
  date: Date;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
}

export interface CasePhase {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  status: 'upcoming' | 'active' | 'completed';
  progress: number;
  milestones: TimelineEvent[];
  deadlines: TimelineEvent[];
}

export interface CaseRelationship {
  id: string;
  caseId1: string;
  caseId2: string;
  relationshipType: RelationshipType;
  description?: string;
  isBidirectional: boolean;
  relationshipStrength: number;
  establishedDate?: Date;
  isActive: boolean;
}

export enum RelationshipType {
  RELATED = 'related',
  CONSOLIDATED = 'consolidated',
  APPEALED_FROM = 'appealed_from',
  APPEALED_TO = 'appealed_to',
  LEAD_CASE = 'lead_case',
  MEMBER_CASE = 'member_case',
  PARALLEL = 'parallel',
  CUSTOM = 'custom',
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictSeverity?: 'low' | 'medium' | 'high' | 'critical';
  conflictType?: string;
  conflictingCases?: Array<{
    caseId: string;
    caseNumber: string;
    title: string;
    conflictReason: string;
  }>;
  conflictingClients?: Array<{
    clientId: string;
    clientName: string;
    conflictReason: string;
  }>;
  recommendations?: string[];
  requiresWaiver: boolean;
}
