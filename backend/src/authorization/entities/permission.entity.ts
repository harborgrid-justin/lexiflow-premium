import { Entity, Column, Index, Unique, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { RolePermission } from './role.permission.entity';

export enum PermissionScope {
  GLOBAL = 'global',
  ORGANIZATION = 'organization',
  TEAM = 'team',
  OWN = 'own',
}

export enum PermissionStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  DISABLED = 'disabled',
}

@Entity('permissions')
@Unique(['code'])
@Index(['resource', 'action'])
@Index(['scope'])
@Index(['status'])
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  @Index()
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  resource!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({
    type: 'enum',
    enum: PermissionScope,
    default: PermissionScope.GLOBAL,
  })
  scope!: PermissionScope;

  @Column({
    type: 'enum',
    enum: PermissionStatus,
    default: PermissionStatus.ACTIVE,
  })
  status!: PermissionStatus;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem!: boolean;

  @Column({ name: 'requires_ownership', type: 'boolean', default: false })
  requiresOwnership!: boolean;

  @Column({ name: 'requires_delegation', type: 'boolean', default: false })
  requiresDelegation!: boolean;

  @Column({ name: 'parent_permission_id', type: 'uuid', nullable: true })
  @Index()
  parentPermissionId!: string;

  @Column({ name: 'child_permissions', type: 'text', array: true, default: '{}' })
  childPermissions!: string[];

  @Column({ type: 'jsonb', nullable: true })
  constraints!: {
    timeRestrictions?: {
      startTime?: string;
      endTime?: string;
      daysOfWeek?: number[];
      timezone?: string;
    };
    locationRestrictions?: {
      allowedCountries?: string[];
      allowedRegions?: string[];
      deniedCountries?: string[];
      deniedRegions?: string[];
      allowedIpRanges?: string[];
    };
    resourceRestrictions?: {
      maxRecords?: number;
      allowedStatuses?: string[];
      deniedStatuses?: string[];
      requiredFields?: string[];
    };
    customConstraints?: Record<string, unknown>;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata!: {
    category?: string;
    tags?: string[];
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    auditRequired?: boolean;
    mfaRequired?: boolean;
    approvalRequired?: boolean;
    expiresAfter?: number;
    [key: string]: unknown;
  };

  @ManyToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions!: RolePermission[];
}
