/**
 * TypeScript types and interfaces for NewCase component
 */

import { type CaseStatus, type MatterPriority, type MatterStatus, type MatterType, type PracticeArea, type User } from '@/types';

/**
 * Federal Case Type enum
 */
export enum CaseType {
  CIVIL = 'Civil',
  CRIMINAL = 'Criminal',
  FAMILY = 'Family',
  BANKRUPTCY = 'Bankruptcy',
  IMMIGRATION = 'Immigration',
  INTELLECTUAL_PROPERTY = 'Intellectual Property',
  CORPORATE = 'Corporate',
  REAL_ESTATE = 'Real Estate',
  LABOR = 'Labor',
  ENVIRONMENTAL = 'Environmental',
  TAX = 'Tax',
}

/**
 * Tab identifiers
 */
export type TabId = 'intake' | 'court' | 'parties' | 'financial' | 'related';

/**
 * NewCase component props
 */
export interface NewMatterProps {
  /** Matter/Case ID for editing (omit for create mode) */
  id?: string;

  /** Callback when user navigates back */
  onBack?: () => void;

  /** Callback after successful save */
  onSaved?: (id: string) => void;

  /** Current user context */
  currentUser?: User;
}

/**
 * Form data structure combining Matter and Case fields
 */
export interface FormData {
  // Core Information (aligned with CreateMatterDto & CreateCaseDto)
  title: string;
  caseNumber: string;
  matterNumber: string;
  description: string;
  type: MatterType | CaseType;
  status: MatterStatus | CaseStatus;
  priority: MatterPriority;
  practiceArea: PracticeArea | string;
  tags?: string[];

  // Client & Team (aligned with backend)
  clientName: string;
  clientId: string | null;
  clientEmail?: string;
  clientPhone?: string;
  responsibleAttorneyName: string;
  leadAttorneyId: string | null;
  originatingAttorneyName: string;
  originatingAttorneyId?: string | null;
  assignedTeamId?: string | null;

  // Court Information (Federal Litigation - CreateCaseDto fields)
  court: string;
  jurisdiction: string;
  venue?: string;
  judge: string | null;
  referredJudge: string | null;
  magistrateJudge: string | null;
  causeOfAction: string;
  natureOfSuit: string;
  natureOfSuitCode: string;
  juryDemand: 'None' | 'Plaintiff' | 'Defendant' | 'Both';

  // Opposing Party (CreateMatterDto fields)
  opposingPartyName?: string;
  opposingCounsel?: string;
  opposingCounselFirm?: string;

  // Dates (aligned with backend Date types)
  intakeDate: string;
  openedDate: string;
  filingDate: string;
  trialDate: string | null;
  dateTerminated: string | null;
  targetCloseDate?: string | null;
  closedDate?: string | null;
  statuteOfLimitations?: string | null;

  // Financial (aligned with CreateMatterDto decimal fields)
  billingType?: string;
  estimatedValue: number;
  budgetAmount: number;
  hourlyRate: number;
  flatFee?: number;
  contingencyPercentage?: number;
  retainerAmount: number;

  // Conflict Check (CreateMatterDto fields)
  conflictCheckCompleted?: boolean;
  conflictCheckDate?: string | null;
  conflictCheckStatus?: string;
  conflictCheckNotes?: string;

  // Risk Management (CreateMatterDto fields)
  riskLevel?: string;
  riskNotes?: string;

  // Resources (CreateMatterDto & CreateCaseDto arrays)
  linkedCaseIds?: string[];
  linkedDocumentIds?: string[];
  relatedCases: Array<{ court: string; caseNumber: string; relationship?: string }>;

  // Notes & Metadata (CreateMatterDto fields)
  internalNotes?: string;
  customFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
