// types/misc.ts
// Miscellaneous types - split from compatibility.ts

import type * as React from "react";
import type { LazyExoticComponent } from "react";
import type { Case, Party } from "./case";
import type { LegalDocument } from "./documents";
import {
  EntityRole,
  EntityType,
  NavCategory,
  ServiceMethod,
  ServiceStatus,
} from "./enums";
import type { EvidenceItem } from "./evidence";
import type { DocketEntry, Motion } from "./motion-docket";
import {
  BaseEntity,
  CaseId,
  EntityId,
  MetadataRecord,
  UserId,
} from "./primitives";
import type { WorkflowTask } from "./workflow";

export interface Attachment {
  id?: string;
  name: string;
  size?: string | number;
  type?: string;
  sender?: string;
  date?: string;
  url?: string;
}

// Backend: calendar_events table
// Backend CalendarEventType enum (from calendar/dto/calendar.dto.ts)
export enum CalendarEventType {
  HEARING = "Hearing",
  DEADLINE = "Deadline",
  MEETING = "Meeting",
  REMINDER = "Reminder",
  COURT_DATE = "CourtDate",
  FILING = "Filing",
}

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // Alias for startDate
  type:
    | CalendarEventType
    | "case"
    | "deadline"
    | "hearing"
    | "task"
    | "compliance"; // Backend: enum (default: REMINDER)
  description?: string;
  priority?: string;
  location?: string;

  // Backend additional fields
  eventType?: CalendarEventType; // Alias for type
  startDate?: string; // Backend: timestamp (required)
  endDate?: string; // Backend: timestamp (required)
  attendees?: string[]; // Backend: json
  reminder?: string; // Backend: varchar
  completed?: boolean; // Backend: boolean (default: false)
  caseId?: string; // Backend: uuid

  // Legacy frontend values (map to backend enum)
  // Old: 'deposition' | 'court_appearance' | 'trial' | 'conference' | 'filing_deadline'
  // Map: deposition -> MEETING, court_appearance -> COURT_DATE, trial -> HEARING
  //      conference -> MEETING, filing_deadline -> DEADLINE
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

export interface CommunicationItem extends BaseEntity {
  caseId: CaseId;
  userId: UserId;
  subject: string;
  date: string;
  type: string;
  direction: string;
  sender: string;
  recipient: string;
  preview: string;
  hasAttachment: boolean;
  status: string;
  isPrivileged: boolean;
}

export interface Conversation extends BaseEntity {
  name: string;
  role: string;
  status: string;
  unread: number;
  isExternal: boolean;
  messages: Message[];
  draft?: string;
}

export interface EntityRelationship extends BaseEntity {
  sourceId: EntityId;
  targetId: EntityId;
  type:
    | "Employment"
    | "Subsidiary"
    | "Counsel_For"
    | "Sued_By"
    | "Witness_For"
    | "Family"
    | "Conflict"
    | "Board_Member";
  description?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  weight?: number;
}

export interface JudgeMotionStat {
  name: string;
  grant: number;
  deny: number;
}

export interface JudgeProfile extends BaseEntity {
  name: string;
  court: string;
  jurisdiction?: string;
  appointedBy?: string;
  yearsOnBench?: number;
  priorExperience?: string;
  // Motion statistics
  motionStats: Array<{
    motionType: string;
    granted: number;
    denied: number;
    totalRuled: number;
    grantRate: number;
  }>;
  grantRateDismiss: number;
  grantRateSummary: number;
  grantRateDiscovery?: number;
  grantRateSanctions?: number;
  // Case statistics
  avgCaseDuration: number;
  casesAssigned?: number;
  casesResolved?: number;
  trialRate?: number;
  settlementRate?: number;
  // Behavioral tendencies
  tendencies: string[];
  rulingPatterns?: string[];
  preferredProcedures?: string[];
  strictness?: "Lenient" | "Moderate" | "Strict";
  // Additional context
  notableRulings?: Array<{
    caseTitle: string;
    year: number;
    summary: string;
    citation?: string;
  }>;
  standingOrders?: string[];
  localRules?: string[];
  notes?: string;
  metadata?: MetadataRecord;
}

// Counsel Analysis Types
export interface CounselProfile extends BaseEntity {
  name: string;
  firm: string;
  jurisdiction?: string;
  yearsOfPractice?: number;
  practiceAreas?: string[];
  // Performance metrics
  settlementRate: number;
  trialRate: number;
  winRate?: number;
  avgSettlementAmount?: number;
  avgSettlementVariance: number;
  // Strategy patterns
  aggressiveness?: "Low" | "Medium" | "High";
  motionFrequency?: number;
  discoveryTactics?: string[];
  negotiationStyle?: string;
  // Historical data
  casesHandled?: number;
  casesWon?: number;
  casesLost?: number;
  casesSettled?: number;
  notableVerdicts?: Array<{
    case: string;
    outcome: string;
    amount?: number;
    year: number;
  }>;
  // Opposing counsel insights
  commonOpponents?: string[];
  preferredExperts?: string[];
  notes?: string;
  metadata?: MetadataRecord;
}

// Prediction & Analysis Types
export interface OutcomePredictionData {
  caseId: CaseId;
  predictionDate: string;
  modelVersion?: string;
  // Probability estimates
  settlementProbability: number;
  trialProbability: number;
  dismissalProbability: number;
  plaintiffWinProbability?: number;
  defendantWinProbability?: number;
  // Value predictions
  estimatedSettlementRange: {
    low: number;
    median: number;
    high: number;
    confidence: number;
  };
  estimatedVerdictRange?: {
    low: number;
    median: number;
    high: number;
    confidence: number;
  };
  // Risk factors
  riskFactors: Array<{
    factor: string;
    impact: "Low" | "Medium" | "High";
    description: string;
  }>;
  strengthFactors: Array<{
    factor: string;
    impact: "Low" | "Medium" | "High";
    description: string;
  }>;
  // Timelines
  estimatedDurationMonths: number;
  estimatedCostRange: {
    low: number;
    median: number;
    high: number;
  };
  // Recommendations
  recommendations: string[];
  alternativeStrategies?: string[];
  notes?: string;
  metadata?: MetadataRecord;
}

// Analysis Session Types
export interface AnalysisSession extends BaseEntity {
  caseId?: CaseId;
  userId: UserId;
  sessionType: "Brief" | "Case" | "Motion" | "Discovery" | "Trial" | "General";
  startTime: string;
  endTime?: string;
  duration?: number; // minutes
  // Session data
  inputData?: string;
  outputData?: string;
  findings?: string[];
  recommendations?: string[];
  riskScore?: number;
  // AI/ML metadata
  modelUsed?: string;
  confidence?: number;
  processingTime?: number;
  metadata?: MetadataRecord;
}

export interface LegalEntity extends BaseEntity {
  id: EntityId;
  name: string;
  type: EntityType;
  roles: EntityRole[];
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  taxId?: string;
  company?: string;
  title?: string;
  barNumber?: string;
  jurisdiction?: string;
  status: "Active" | "Inactive" | "Prospect" | "Blacklisted" | "Deceased";
  riskScore: number;
  tags: string[];
  notes?: string;
  linkedUserId?: UserId;
  avatar?: string;
  externalIds?: Record<string, string>;
  aliases?: string[];
  metadata?: MetadataRecord;
}

export interface Message extends BaseEntity {
  conversationId?: string;
  senderId: UserId | "me" | string;
  text: string;
  content?: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  read?: boolean;
  isPrivileged?: boolean;
  attachments?: Attachment[];
}

export interface ModuleDefinition {
  id: string;
  label: string;
  component: LazyExoticComponent<React.ComponentType<unknown>>;
  requiresAdmin?: boolean;
  requiresAttorney?: boolean;
  requiresStaff?: boolean;
  hidden?: boolean; // If true, don't show in sidebar navigation (e.g., Create Case)
  intentMatcher?: (intent: string, context: unknown) => boolean;
  category: NavCategory;
  icon?: React.ComponentType<{ className?: string }>;
  children?: ModuleDefinition[];
}

export interface NexusNodeData {
  id: string;
  type: "root" | "org" | "party" | "evidence" | "motion";
  label: string;
  original: Case | Party | EvidenceItem | Motion | object;
  status?: string;
}

// Alias for backward compatibility
export interface OpposingCounselProfile extends CounselProfile {}

// Full counsel profile - defined above in comprehensive section

export interface OutcomePredictionData {
  subject: string;
  A: number;
  fullMark: number;
}

export interface ParsedDocket {
  caseInfo: Partial<Case>;
  parties: Party[];
  docketEntries: DocketEntry[];
  deadlines?: Array<{ type: string; date: string; description?: string }>;
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
  status: "Delivered" | "Staging" | "Failed";
}

export interface RealizationStat {
  id?: string;
  name: string;
  value: number;
  color: string;
}

export interface ServiceJob extends BaseEntity {
  caseId: CaseId;
  requestorId: UserId;
  documentTitle: string;
  targetPerson: string;
  targetAddress: string;
  serverName: string;
  method: ServiceMethod;
  mailType?: string;
  trackingNumber?: string;
  addressedTo?: string;
  status: keyof typeof ServiceStatus;
  dueDate: string;
  attempts: number;
  servedDate?: string;
  gpsCoordinates?: string;
  notes?: string;
  signerName?: string;
  attemptHistory?: {
    date: string;
    result: string;
    lat?: number;
    long?: number;
  }[];
  [key: string]: unknown;
}

export interface StaffMember {
  id: string;
  userId: UserId;
  name: string;
  email: string;
  role: "Associate" | "Paralegal" | "Senior Partner" | "Administrator";
  phone: string;
  billableTarget: number;
  currentBillable: number;
  utilizationRate: number;
  salary: number;
  status: "Active" | "Inactive";
  startDate: string;
}

export interface MiscSystemNotification extends BaseEntity {
  text: string;
  time: string;
  read: boolean;
  type?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type:
    | "milestone"
    | "document"
    | "billing"
    | "motion"
    | "hearing"
    | "task"
    | "planning";
  description?: string;
  relatedId?: string;
}

export interface WIPStat {
  name: string;
  wip: number;
  billed: number;
}

export interface WarRoomData {
  case: Case;
  witnesses: Party[];
  documents: LegalDocument[];
  motions: Motion[];
  docket: DocketEntry[];
  evidence: EvidenceItem[];
  tasks: WorkflowTask[];
}
