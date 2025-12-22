export class RlsPolicyDto {
  id: string;
  name: string;
  description: string;
  table: string;
  operation: RlsOperation;
  roles: string[];
  condition: string;
  priority: number;
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export enum RlsOperation {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ALL = 'ALL',
}

export class CreateRlsPolicyDto {
  name: string;
  description: string;
  table: string;
  operation: RlsOperation;
  roles: string[];
  condition: string;
  priority?: number;
  enabled?: boolean;
  createdBy: string;
  organizationId: string;
}

export class UpdateRlsPolicyDto {
  name?: string;
  description?: string;
  roles?: string[];
  condition?: string;
  priority?: number;
  enabled?: boolean;
}

export class QueryRlsPoliciesDto {
  table?: string;
  operation?: RlsOperation;
  role?: string;
  enabled?: boolean;
  page?: number;
  limit?: number;
}

export class EvaluateRlsPolicyDto {
  table: string;
  operation: RlsOperation;
  userRole: string;
  context: Record<string, unknown>;
}

export class RlsPolicyEvaluationResult {
  allowed: boolean;
  appliedPolicies: RlsPolicyDto[];
  finalCondition?: string;
  message?: string;
}
