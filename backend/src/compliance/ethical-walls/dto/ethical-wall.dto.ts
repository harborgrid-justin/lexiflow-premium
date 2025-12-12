export class EthicalWallDto {
  id: string;
  name: string;
  description: string;
  restrictedUsers: string[];
  restrictedEntities: RestrictedEntity[];
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  status: EthicalWallStatus;
  organizationId: string;
}

export enum EthicalWallStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export interface RestrictedEntity {
  entityType: 'Case' | 'Client' | 'Document' | 'Matter';
  entityId: string;
  entityName: string;
}

export class CreateEthicalWallDto {
  name: string;
  description: string;
  restrictedUsers: string[];
  restrictedEntities: RestrictedEntity[];
  reason: string;
  createdBy: string;
  createdByName: string;
  expiresAt?: Date;
  organizationId: string;
}

export class UpdateEthicalWallDto {
  name?: string;
  description?: string;
  restrictedUsers?: string[];
  restrictedEntities?: RestrictedEntity[];
  reason?: string;
  status?: EthicalWallStatus;
  expiresAt?: Date;
}

export class QueryEthicalWallsDto {
  status?: EthicalWallStatus;
  userId?: string;
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
}

export class CheckEthicalWallDto {
  userId: string;
  entityType: string;
  entityId: string;
}

export class EthicalWallCheckResult {
  blocked: boolean;
  walls: EthicalWallDto[];
  message?: string;
}

export class EthicalWallNotificationDto {
  id: string;
  wallId: string;
  wallName: string;
  recipientUserId: string;
  recipientUserName: string;
  notificationType: 'wall_created' | 'wall_modified' | 'access_denied' | 'wall_expired' | 'wall_breach';
  message: string;
  metadata?: Record<string, any>;
  sentAt: Date;
  readAt?: Date;
}

export class EthicalWallAuditEntryDto {
  id: string;
  wallId: string;
  action: 'created' | 'modified' | 'deleted' | 'access_granted' | 'access_denied' | 'breach_detected';
  performedBy: string;
  performedByName: string;
  details: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export class WallBreachDto {
  id: string;
  wallId: string;
  wallName: string;
  userId: string;
  userName: string;
  entityType: string;
  entityId: string;
  attemptedAction: string;
  detectedAt: Date;
  ipAddress?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export class WallEffectivenessMetricsDto {
  wallId: string;
  wallName: string;
  createdAt: Date;
  daysActive: number;
  accessAttempts: number;
  blockedAttempts: number;
  breachAttempts: number;
  affectedUsersCount: number;
  restrictedEntitiesCount: number;
  effectivenessScore: number; // 0-100
}
