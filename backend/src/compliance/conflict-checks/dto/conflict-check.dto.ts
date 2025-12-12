export class ConflictCheckDto {
  id: string;
  requestedBy: string;
  requestedByName: string;
  checkType: ConflictCheckType;
  targetName: string;
  targetEntity?: string;
  conflicts: ConflictResult[];
  status: ConflictCheckStatus;
  resolution?: ConflictResolution;
  waiver?: ConflictWaiver;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export enum ConflictCheckType {
  CLIENT_VS_CLIENT = 'CLIENT_VS_CLIENT',
  CLIENT_VS_OPPOSING = 'CLIENT_VS_OPPOSING',
  MATTER_OVERLAP = 'MATTER_OVERLAP',
  PRIOR_REPRESENTATION = 'PRIOR_REPRESENTATION',
}

export enum ConflictCheckStatus {
  PENDING = 'PENDING',
  CLEAR = 'CLEAR',
  CONFLICT_FOUND = 'CONFLICT_FOUND',
  RESOLVED = 'RESOLVED',
  WAIVED = 'WAIVED',
}

export interface ConflictResult {
  conflictType: ConflictCheckType;
  matchedEntity: string;
  matchedEntityId: string;
  matchScore: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConflictResolution {
  resolvedBy: string;
  resolvedByName: string;
  resolvedAt: Date;
  resolutionMethod: string;
  notes: string;
}

export interface ConflictWaiver {
  waivedBy: string;
  waivedByName: string;
  waivedAt: Date;
  reason: string;
  approvedBy?: string;
}

export class RunConflictCheckDto {
  requestedBy: string;
  requestedByName: string;
  checkType: ConflictCheckType;
  targetName: string;
  targetEntity?: string;
  additionalNames?: string[];
  caseId?: string;
  organizationId: string;
}

export class ResolveConflictDto {
  resolvedBy: string;
  resolvedByName: string;
  resolutionMethod: string;
  notes: string;
}

export class WaiveConflictDto {
  waivedBy: string;
  waivedByName: string;
  reason: string;
  approvedBy?: string;
}

export class QueryConflictChecksDto {
  status?: ConflictCheckStatus;
  checkType?: ConflictCheckType;
  requestedBy?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
