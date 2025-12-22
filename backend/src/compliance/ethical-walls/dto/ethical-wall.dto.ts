export class EthicalWallDto {
  id!: string;
  name!: string;
  description!: string;
  restrictedUsers!: string[];
  restrictedEntities!: RestrictedEntity[];
  reason!: string;
  createdBy!: string;
  createdByName!: string;
  createdAt!: Date;
  updatedAt!: Date;
  expiresAt?: Date;
  status!: EthicalWallStatus;
  organizationId!: string;
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
  name!: string;
  description!: string;
  restrictedUsers!: string[];
  restrictedEntities!: RestrictedEntity[];
  reason!: string;
  createdBy!: string;
  createdByName!: string;
  expiresAt?: Date;
  organizationId!: string;
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
  userId!: string;
  entityType!: string;
  entityId!: string;
}

export class EthicalWallCheckResult {
  blocked!: boolean;
  walls!: EthicalWallDto[];
  message?: string;
}
