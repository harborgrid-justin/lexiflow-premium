import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity';

export enum RetentionPolicyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum RetentionAction {
  ARCHIVE = 'archive',
  DELETE = 'delete',
  ANONYMIZE = 'anonymize',
  RETAIN = 'retain',
}

@Entity('data_retention_policies')
@Index(['entityType'])
@Index(['status'])
@Index(['nextReviewDate'])
export class DataRetentionPolicy extends BaseEntity {
  @ApiProperty({ description: 'Name of the retention policy' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Description of the policy' })
  @Column({ type: 'text', nullable: true })
  description!: string;

  @ApiProperty({ description: 'Entity type this policy applies to (e.g., case, document, user)' })
  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType!: string;

  @ApiProperty({ description: 'Retention period in days' })
  @Column({ name: 'retention_period_days', type: 'integer' })
  retentionPeriodDays!: number;

  @ApiProperty({ enum: RetentionAction, description: 'Action to take when retention period expires' })
  @Column({
    name: 'retention_action',
    type: 'enum',
    enum: RetentionAction,
    default: RetentionAction.ARCHIVE,
  })
  retentionAction!: RetentionAction;

  @ApiProperty({ enum: RetentionPolicyStatus, description: 'Status of the policy' })
  @Column({
    type: 'enum',
    enum: RetentionPolicyStatus,
    default: RetentionPolicyStatus.ACTIVE,
  })
  status!: RetentionPolicyStatus;

  @ApiProperty({ description: 'Legal or regulatory basis for this policy' })
  @Column({ name: 'legal_basis', type: 'text', nullable: true })
  legalBasis!: string;

  @ApiProperty({ description: 'Jurisdictions this policy applies to' })
  @Column({ type: 'text', array: true, default: '{}' })
  jurisdictions!: string[];

  @ApiProperty({ description: 'Conditions that must be met for policy to apply' })
  @Column({ type: 'jsonb', nullable: true })
  conditions!: Record<string, unknown>;

  @ApiProperty({ description: 'Priority level (higher number = higher priority)' })
  @Column({ type: 'integer', default: 0 })
  priority!: number;

  @ApiProperty({ description: 'Date policy becomes effective' })
  @Column({ name: 'effective_date', type: 'timestamp' })
  effectiveDate!: Date;

  @ApiProperty({ description: 'Date policy expires (if applicable)' })
  @Column({ name: 'expiration_date', type: 'timestamp', nullable: true })
  expirationDate!: Date | null;

  @ApiProperty({ description: 'Next date policy should be reviewed' })
  @Column({ name: 'next_review_date', type: 'timestamp', nullable: true })
  nextReviewDate!: Date | null;

  @ApiProperty({ description: 'Last date policy was reviewed' })
  @Column({ name: 'last_reviewed_at', type: 'timestamp', nullable: true })
  lastReviewedAt!: Date | null;

  @ApiProperty({ description: 'User who last reviewed the policy' })
  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string | null;

  @ApiProperty({ description: 'Additional configuration options' })
  @Column({ type: 'jsonb', nullable: true })
  configuration!: Record<string, unknown>;

  @ApiProperty({ description: 'Tags for categorizing policies' })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ description: 'Number of entities affected by this policy' })
  @Column({ name: 'entities_affected', type: 'integer', default: 0 })
  entitiesAffected!: number;

  @ApiProperty({ description: 'Last time policy was executed' })
  @Column({ name: 'last_execution_at', type: 'timestamp', nullable: true })
  lastExecutionAt!: Date | null;
}

@Entity('data_retention_records')
@Index(['entityType', 'entityId'])
@Index(['policyId'])
@Index(['status'])
@Index(['retentionExpiresAt'])
export class DataRetentionRecord extends BaseEntity {
  @ApiProperty({ description: 'Policy that governs this record' })
  @Column({ name: 'policy_id', type: 'uuid' })
  policyId!: string;

  @ApiProperty({ description: 'Entity type' })
  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType!: string;

  @ApiProperty({ description: 'Entity ID' })
  @Column({ name: 'entity_id', type: 'varchar', length: 100 })
  entityId!: string;

  @ApiProperty({ description: 'Date retention period expires' })
  @Column({ name: 'retention_expires_at', type: 'timestamp' })
  retentionExpiresAt!: Date;

  @ApiProperty({ enum: RetentionAction, description: 'Action to take when retention expires' })
  @Column({
    name: 'scheduled_action',
    type: 'enum',
    enum: RetentionAction,
  })
  scheduledAction!: RetentionAction;

  @ApiProperty({ description: 'Status of retention' })
  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'expired', 'processed', 'hold'],
    default: 'active',
  })
  status!: string;

  @ApiProperty({ description: 'Date action was executed (if applicable)' })
  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt!: Date | null;

  @ApiProperty({ description: 'User who processed the action' })
  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy!: string | null;

  @ApiProperty({ description: 'Legal hold flag - prevents automatic deletion' })
  @Column({ name: 'legal_hold', type: 'boolean', default: false })
  legalHold!: boolean;

  @ApiProperty({ description: 'Legal hold reason' })
  @Column({ name: 'legal_hold_reason', type: 'text', nullable: true })
  legalHoldReason!: string | null;

  @ApiProperty({ description: 'Legal hold placed by user' })
  @Column({ name: 'legal_hold_by', type: 'uuid', nullable: true })
  legalHoldBy!: string | null;

  @ApiProperty({ description: 'Legal hold placed at date' })
  @Column({ name: 'legal_hold_at', type: 'timestamp', nullable: true })
  legalHoldAt!: Date | null;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'Notes about retention' })
  @Column({ type: 'text', nullable: true })
  notes!: string;
}
