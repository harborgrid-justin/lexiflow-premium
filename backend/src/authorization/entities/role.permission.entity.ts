import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Permission } from './permission.entity';
import { UserRole } from '@users/entities/user.entity';

export enum GrantType {
  ALLOW = 'allow',
  DENY = 'deny',
}

export enum InheritanceType {
  DIRECT = 'direct',
  INHERITED = 'inherited',
  OVERRIDE = 'override',
}

@Entity('role_permissions')
@Index(['role', 'permissionId'])
@Index(['role', 'grantType'])
@Index(['effectiveFrom', 'effectiveTo'])
export class RolePermission extends BaseEntity {
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  @Index()
  role!: UserRole;

  @Column({ name: 'permission_id', type: 'uuid' })
  @Index()
  permissionId!: string;

  @Column({
    name: 'grant_type',
    type: 'enum',
    enum: GrantType,
    default: GrantType.ALLOW,
  })
  grantType!: GrantType;

  @Column({
    name: 'inheritance_type',
    type: 'enum',
    enum: InheritanceType,
    default: InheritanceType.DIRECT,
  })
  inheritanceType!: InheritanceType;

  @Column({ name: 'inherited_from_role', type: 'varchar', length: 50, nullable: true })
  inheritedFromRole!: string;

  @Column({ name: 'effective_from', type: 'timestamp', nullable: true })
  effectiveFrom!: Date;

  @Column({ name: 'effective_to', type: 'timestamp', nullable: true })
  effectiveTo!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  conditions!: {
    organizationIds?: string[];
    departmentIds?: string[];
    locationIds?: string[];
    timeWindows?: {
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
      timezone: string;
    }[];
    ipWhitelist?: string[];
    ipBlacklist?: string[];
    customConditions?: Record<string, unknown>;
  };

  @Column({ type: 'jsonb', nullable: true })
  overrides!: {
    maxRecords?: number;
    maxFileSize?: number;
    allowedActions?: string[];
    deniedActions?: string[];
    customOverrides?: Record<string, unknown>;
  };

  @Column({ name: 'requires_mfa', type: 'boolean', default: false })
  requiresMfa!: boolean;

  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval!: boolean;

  @Column({ name: 'approval_roles', type: 'text', array: true, default: '{}' })
  approvalRoles!: string[];

  @Column({ name: 'audit_required', type: 'boolean', default: false })
  auditRequired!: boolean;

  @Column({ name: 'priority', type: 'integer', default: 0 })
  priority!: number;

  @Column({ type: 'text', nullable: true })
  reason!: string;

  @Column({ name: 'granted_by', type: 'uuid', nullable: true })
  grantedBy!: string;

  @Column({ name: 'revoked_by', type: 'uuid', nullable: true })
  revokedBy!: string;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: {
    source?: string;
    context?: string;
    tags?: string[];
    notes?: string;
    [key: string]: unknown;
  };

  @ManyToOne(() => Permission, permission => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission!: Permission;
}
