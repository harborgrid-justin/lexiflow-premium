export class PermissionDto {
  id: string;
  userId: string;
  userName: string;
  role: string;
  resource: string;
  resourceId?: string;
  actions: PermissionAction[];
  scope: PermissionScope;
  conditions?: PermissionCondition[];
  grantedBy: string;
  grantedByName: string;
  grantedAt: Date;
  expiresAt?: Date;
  organizationId: string;
}

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  EXPORT = 'EXPORT',
  SHARE = 'SHARE',
  ASSIGN = 'ASSIGN',
}

export enum PermissionScope {
  GLOBAL = 'GLOBAL',
  ORGANIZATION = 'ORGANIZATION',
  TEAM = 'TEAM',
  PERSONAL = 'PERSONAL',
  SPECIFIC = 'SPECIFIC',
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains';
  value: any;
}

export class GrantPermissionDto {
  userId: string;
  userName: string;
  role: string;
  resource: string;
  resourceId?: string;
  actions: PermissionAction[];
  scope: PermissionScope;
  conditions?: PermissionCondition[];
  grantedBy: string;
  grantedByName: string;
  expiresAt?: Date;
  organizationId: string;
}

export class RevokePermissionDto {
  reason?: string;
  revokedBy: string;
  revokedByName: string;
}

export class QueryPermissionsDto {
  userId?: string;
  role?: string;
  resource?: string;
  action?: PermissionAction;
  scope?: PermissionScope;
  includeExpired?: boolean;
  page?: number;
  limit?: number;
}

export class CheckAccessDto {
  userId: string;
  resource: string;
  resourceId?: string;
  action: PermissionAction;
  context?: Record<string, any>;
}

export class AccessCheckResult {
  allowed: boolean;
  matchedPermissions: PermissionDto[];
  reason?: string;
}

export class AccessMatrixDto {
  userId?: string;
  resources: string[];
}

export class AccessMatrixResult {
  userId: string;
  matrix: Record<string, Record<string, boolean>>;
}
