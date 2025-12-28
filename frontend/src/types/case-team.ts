/**
 * Case Team Types
 * Types for case team member assignments and collaboration
 */

import type { BaseEntity } from './primitives';

export interface CaseTeamMember extends BaseEntity {
  caseId: string;
  userId: string;
  userName?: string;
  role: 'lead_attorney' | 'associate' | 'paralegal' | 'legal_assistant' | 'consultant' | 'expert' | 'support';
  permissions?: string[];
  billableRate?: number;
  assignedDate: string;
  removedDate?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}
