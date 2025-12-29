import { CaseType, CaseStatus } from '@cases/entities/case.entity';

export interface ICase {
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
  metadata?: Record<string, unknown>;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ICaseService {
  findAll(filter: unknown): Promise<{ data: ICase[]; total: number }>;
  findOne(id: string): Promise<ICase>;
  create(data: unknown): Promise<ICase>;
  update(id: string, data: unknown): Promise<ICase>;
  remove(id: string): Promise<void>;
  archive(id: string): Promise<ICase>;
}
