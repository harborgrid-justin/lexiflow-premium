/**
 * Case-related DTOs
 * Shared between frontend and backend
 */

import { CaseId, ClientId, UserId } from '../entities/base.entity';
import { CaseStatus, CaseType } from '../enums/case.enums';
import { EntityMetadata } from '../common/json-value.types';

/**
 * Create case request DTO
 */
export interface CreateCaseDto {
  title: string;
  caseNumber: string;
  description?: string;
  type?: CaseType;
  status?: CaseStatus;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: string;
  trialDate?: string;
  closeDate?: string;
  assignedTeamId?: string;
  leadAttorneyId?: string;
  clientId?: string;
  metadata?: EntityMetadata;
}

/**
 * Update case request DTO
 */
export interface UpdateCaseDto {
  title?: string;
  caseNumber?: string;
  description?: string;
  type?: CaseType;
  status?: CaseStatus;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: string;
  trialDate?: string;
  closeDate?: string;
  assignedTeamId?: string;
  leadAttorneyId?: string;
  metadata?: EntityMetadata;
  isArchived?: boolean;
}

/**
 * Case filter parameters
 */
export interface CaseFilterParams {
  search?: string;
  status?: CaseStatus | CaseStatus[];
  type?: CaseType | CaseType[];
  practiceArea?: string;
  jurisdiction?: string;
  leadAttorneyId?: UserId;
  clientId?: ClientId;
  isArchived?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Case response DTO
 */
export interface CaseResponseDto {
  id: CaseId;
  title: string;
  caseNumber: string;
  description?: string;
  type: CaseType;
  status: CaseStatus;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: string;
  trialDate?: string;
  closeDate?: string;
  assignedTeamId?: string;
  leadAttorneyId?: UserId;
  clientId: ClientId;
  metadata?: EntityMetadata;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Bulk case operation DTO
 */
export interface BulkCaseOperationDto {
  caseIds: CaseId[];
  operation: 'archive' | 'unarchive' | 'delete' | 'updateStatus';
  params?: {
    status?: CaseStatus;
    isArchived?: boolean;
  };
}
