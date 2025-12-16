import { BaseEntity, CaseId, ClientId, UserId } from './base.entity';
import { CaseStatus, CaseType } from '../enums/case.enums';
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
    filingDate?: string;
    trialDate?: string;
    closeDate?: string;
    assignedTeamId?: string;
    leadAttorneyId?: UserId;
    clientId: ClientId;
    metadata?: Record<string, any>;
    isArchived?: boolean;
}
export interface CaseSummary {
    id: CaseId;
    title: string;
    caseNumber: string;
    status: CaseStatus;
    type: CaseType;
}
export interface CaseStats {
    totalCases: number;
    activeCases: number;
    closedCases: number;
    casesByStatus: Record<CaseStatus, number>;
    casesByType: Record<CaseType, number>;
}
