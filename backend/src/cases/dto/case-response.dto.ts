import { CaseType, CaseStatus } from '../entities/case.entity';

export class CaseResponseDto {
  id: string;
  title: string;
  caseNumber: string;
  description?: string;
  type: CaseType;
  status: CaseStatus;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: Date;
  trialDate?: Date;
  closeDate?: Date;
  assignedTeamId?: string;
  leadAttorneyId?: string;
  metadata?: Record<string, any>;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  parties?: any[];
  team?: any[];
  phases?: any[];
}

export class PaginatedCaseResponseDto {
  data: CaseResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
