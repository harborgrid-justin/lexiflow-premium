import { BaseEntity, CaseId, ClientId, UserId } from './base.entity';
import { CaseStatus, CaseType } from '../enums/case.enums';
import { EntityMetadata } from '../common/json-value.types';

/**
 * Case entity interface
 * Shared between frontend and backend
 */
export interface Case extends BaseEntity {
  title: string;
  caseNumber: string;
  description?: string;
  type: CaseType;
  status: CaseStatus;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: string; // ISO date string
  trialDate?: string; // ISO date string
  closeDate?: string; // ISO date string
  assignedTeamId?: string;
  leadAttorneyId?: UserId;
  clientId: ClientId;
  metadata?: EntityMetadata;
  isArchived?: boolean;
}

/**
 * Minimal case information for lists and references
 */
export interface CaseSummary {
  id: CaseId;
  title: string;
  caseNumber: string;
  status: CaseStatus;
  type: CaseType;
}

/**
 * Case statistics for dashboard
 */
export interface CaseStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  casesByStatus: Record<CaseStatus, number>;
  casesByType: Record<CaseType, number>;
}
