import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['entityType'])
@Index(['timestamp'])
@Index(['entityId'])
export class AuditLog extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_name', type: 'varchar', length: 255, nullable: true })
  userName!: string;

  @Column({
    type: 'enum',
    enum: [
      'create',
      'read',
      'update',
      'delete',
      'login',
      'logout',
      'access',
      'download',
      'upload',
      'export',
      'import',
      'approve',
      'reject',
      'submit',
      'archive',
      'restore',
      'share',
      'unshare',
      'other',
    ],
  })
  action!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 100, nullable: true })
  entityId!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ name: 'ip_address', type: 'varchar', length: 100, nullable: true })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  method!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint!: string;

  @Column({ name: 'status_code', type: 'integer', nullable: true })
  statusCode!: number;

  @Column({ type: 'jsonb', nullable: true })
  changes!: Record<string, unknown>;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues!: Record<string, unknown>;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true })
  details!: string;

  @Column({
    type: 'enum',
    enum: ['success', 'failure', 'warning', 'info'],
    default: 'success',
  })
  result!: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string;

  @Column({ name: 'stack_trace', type: 'text', nullable: true })
  stackTrace!: string;

  @Column({ type: 'integer', nullable: true })
  duration!: number;

  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId!: string;

  @Column({ name: 'request_id', type: 'varchar', length: 100, nullable: true })
  @Index()
  requestId!: string;

  @Column({ name: 'correlation_id', type: 'varchar', length: 100, nullable: true })
  @Index()
  correlationId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resource!: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 100, nullable: true })
  resourceId!: string;

  @Column({
    type: 'enum',
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'info',
  })
  severity!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  organization!: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  department!: string;

  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId!: string;

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string;

  @Column({ name: 'compliance_framework', type: 'text', array: true, default: '{}' })
  complianceFramework!: string[];

  @Column({ name: 'data_classification', type: 'varchar', length: 50, nullable: true })
  dataClassification!: string;

  @Column({ name: 'retention_period_days', type: 'integer', nullable: true })
  retentionPeriodDays!: number;

  @Column({ name: 'is_sensitive', type: 'boolean', default: false })
  isSensitive!: boolean;

  @Column({ name: 'requires_review', type: 'boolean', default: false })
  requiresReview!: boolean;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt!: Date;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string;

  @Column({ name: 'hash_chain', type: 'text', nullable: true })
  hashChain!: string;

  @Column({ name: 'previous_hash', type: 'text', nullable: true })
  previousHash!: string;

  @Column({ name: 'signature', type: 'text', nullable: true })
  signature!: string;

  @Column({ name: 'tamper_detected', type: 'boolean', default: false })
  tamperDetected!: boolean;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @Column({ name: 'archived_at', type: 'timestamp', nullable: true })
  archivedAt!: Date;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  @Index()
  isArchived!: boolean;
}
