/**
 * Case-related API Types
 */

import type { PaginatedResponse, AuditFields, UserReference, ID } from './common';

// Case status
export type CaseStatus =
  | 'active'
  | 'pending'
  | 'in_progress'
  | 'on_hold'
  | 'settled'
  | 'dismissed'
  | 'closed'
  | 'archived';

// Case type
export type CaseType =
  | 'civil'
  | 'criminal'
  | 'family'
  | 'corporate'
  | 'intellectual_property'
  | 'employment'
  | 'real_estate'
  | 'bankruptcy'
  | 'tax'
  | 'immigration'
  | 'other';

// Case priority
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

// Case item (summary)
export interface CaseItem extends AuditFields {
  id: ID;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  caseType: CaseType;
  priority: CasePriority;
  courtName?: string;
  courtDivision?: string;
  judge?: string;
  filingDate?: Date;
  trialDate?: Date;
  closedDate?: Date;
  estimatedValue?: number;
  actualValue?: number;
  clientId: ID;
  clientName?: string;
  assignedAttorneyId?: ID;
  assignedAttorneyName?: string;
  tags?: string[];
  isArchived: boolean;
  lastActivityAt?: Date;
}

// Case details (full)
export interface CaseDetails extends CaseItem {
  client: {
    id: ID;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  assignedAttorney?: UserReference;
  parties: CaseParty[];
  team: CaseTeamMember[];
  phases: CasePhase[];
  relatedCases: RelatedCase[];
  customFields?: Record<string, any>;
}

// Case party
export interface CaseParty {
  id: ID;
  caseId: ID;
  type: 'plaintiff' | 'defendant' | 'witness' | 'expert' | 'attorney' | 'other';
  firstName?: string;
  lastName?: string;
  fullName?: string;
  organizationName?: string;
  isOrganization: boolean;
  role: string;
  email?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  isPrimary: boolean;
  isActive: boolean;
  dateAdded: Date;
}

// Case team member
export interface CaseTeamMember {
  id: ID;
  caseId: ID;
  userId: ID;
  user: UserReference;
  role: 'lead_attorney' | 'co_counsel' | 'paralegal' | 'legal_assistant' | 'consultant';
  isPrimary: boolean;
  hourlyRate?: number;
  permissions: string[];
  joinedAt: Date;
}

// Case phase
export interface CasePhase {
  id: ID;
  caseId: ID;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'pending' | 'active' | 'completed';
  order: number;
}

// Related case
export interface RelatedCase {
  id: ID;
  caseId: ID;
  relatedCaseId: ID;
  relatedCaseNumber: string;
  relatedCaseTitle: string;
  relationship: 'parent' | 'child' | 'sibling' | 'consolidated' | 'related';
  notes?: string;
  createdAt: Date;
}

// Case timeline event
export interface CaseTimelineEvent {
  id: ID;
  caseId: ID;
  eventType: 'filing' | 'hearing' | 'motion' | 'deadline' | 'document' | 'note' | 'status_change' | 'other';
  title: string;
  description?: string;
  eventDate: Date;
  userId?: ID;
  user?: UserReference;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Create case request
export interface CreateCaseRequest {
  caseNumber?: string;
  title: string;
  description?: string;
  caseType: CaseType;
  status?: CaseStatus;
  priority?: CasePriority;
  courtName?: string;
  courtDivision?: string;
  judge?: string;
  filingDate?: Date;
  trialDate?: Date;
  estimatedValue?: number;
  clientId: ID;
  assignedAttorneyId?: ID;
  tags?: string[];
}

// Update case request
export interface UpdateCaseRequest {
  title?: string;
  description?: string;
  status?: CaseStatus;
  caseType?: CaseType;
  priority?: CasePriority;
  courtName?: string;
  courtDivision?: string;
  judge?: string;
  filingDate?: Date;
  trialDate?: Date;
  closedDate?: Date;
  estimatedValue?: number;
  actualValue?: number;
  assignedAttorneyId?: ID;
  tags?: string[];
}

// Case filters
export interface CaseFilters {
  status?: CaseStatus | CaseStatus[];
  caseType?: CaseType | CaseType[];
  priority?: CasePriority | CasePriority[];
  clientId?: ID;
  assignedAttorneyId?: ID;
  search?: string;
  filingDateFrom?: string;
  filingDateTo?: string;
  tags?: string[];
  isArchived?: boolean;
}

// Case list response
export interface CaseListResponse extends PaginatedResponse<CaseItem> {}

// Case details response
export interface CaseDetailsResponse {
  success: true;
  data: CaseDetails;
}

// Case statistics
export interface CaseStatistics {
  total: number;
  byStatus: Array<{ status: CaseStatus; count: number }>;
  byType: Array<{ type: CaseType; count: number }>;
  byPriority: Array<{ priority: CasePriority; count: number }>;
  totalValue: number;
  averageValue: number;
  averageDuration: number;
  activeCases: number;
  closedThisMonth: number;
  upcomingDeadlines: number;
}
