import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { LegalDocumentCategory } from './document-classification.entity';

/**
 * Retention Actions after policy expiration
 */
export enum RetentionAction {
  DELETE = 'delete',
  ARCHIVE = 'archive',
  REVIEW = 'review',
  NOTIFY = 'notify',
  TRANSFER = 'transfer',
}

/**
 * Policy Status
 */
export enum PolicyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

/**
 * RetentionPolicy Entity
 * Defines document retention rules and compliance policies
 *
 * Features:
 * - Flexible retention periods
 * - Category-based rules
 * - Automated actions on expiration
 * - Legal hold support
 * - Compliance tracking
 */
@Entity('retention_policies')
@Index(['name'])
@Index(['status'])
@Index(['appliesTo'])
export class RetentionPolicy extends BaseEntity {
  @ApiProperty({ example: 'Litigation Hold - 7 Years', description: 'Policy name' })
  @Column({ unique: true })
  name!: string;

  @ApiProperty({ description: 'Policy description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: 2555, description: 'Retention period in days' })
  @Column({ name: 'retention_days', type: 'int' })
  retentionDays!: number;

  @ApiProperty({
    description: 'Action to take after retention period',
    enum: RetentionAction
  })
  @Column({
    type: 'enum',
    enum: RetentionAction,
  })
  action!: RetentionAction;

  @ApiProperty({
    description: 'Document categories this policy applies to',
    enum: LegalDocumentCategory,
    isArray: true
  })
  @Column({ name: 'applies_to', type: 'simple-array' })
  appliesTo!: string[];

  @ApiProperty({ description: 'Status of policy' })
  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.ACTIVE,
  })
  status!: PolicyStatus;

  @ApiProperty({ description: 'Priority (higher number = higher priority)' })
  @Column({ type: 'int', default: 0 })
  priority!: number;

  @ApiProperty({ description: 'Legal hold flag - prevents deletion' })
  @Column({ name: 'is_legal_hold', type: 'boolean', default: false })
  isLegalHold!: boolean;

  @ApiProperty({ description: 'Legal hold reason/case reference' })
  @Column({ name: 'legal_hold_reason', type: 'text', nullable: true })
  legalHoldReason?: string;

  @ApiProperty({ description: 'Legal hold start date' })
  @Column({ name: 'legal_hold_start', type: 'timestamp', nullable: true })
  legalHoldStart?: Date;

  @ApiProperty({ description: 'Legal hold end date' })
  @Column({ name: 'legal_hold_end', type: 'timestamp', nullable: true })
  legalHoldEnd?: Date;

  @ApiProperty({ description: 'Policy applies to specific jurisdictions' })
  @Column({ type: 'simple-array', nullable: true })
  jurisdictions?: string[];

  @ApiProperty({ description: 'Policy applies to specific practice areas' })
  @Column({ name: 'practice_areas', type: 'simple-array', nullable: true })
  practiceAreas?: string[];

  @ApiProperty({ description: 'Compliance framework reference' })
  @Column({ name: 'compliance_framework', type: 'simple-array', nullable: true })
  complianceFramework?: string[]; // e.g., ['GDPR', 'HIPAA', 'SOX']

  @ApiProperty({ description: 'Auto-apply to new documents matching criteria' })
  @Column({ name: 'auto_apply', type: 'boolean', default: true })
  autoApply!: boolean;

  @ApiProperty({ description: 'Policy activation date' })
  @Column({ name: 'effective_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  effectiveDate!: Date;

  @ApiProperty({ description: 'Policy expiration date' })
  @Column({ name: 'expiration_date', type: 'timestamp', nullable: true })
  expirationDate?: Date;

  @ApiProperty({ description: 'Notification settings' })
  @Column({ name: 'notification_settings', type: 'jsonb', nullable: true })
  notificationSettings?: {
    notifyBefore?: number; // days before action
    notifyUsers?: string[]; // user IDs
    notifyRoles?: string[]; // role names
    emailTemplate?: string;
  };

  @ApiProperty({ description: 'Archive location if action is ARCHIVE' })
  @Column({ name: 'archive_location', nullable: true })
  archiveLocation?: string;

  @ApiProperty({ description: 'Transfer destination if action is TRANSFER' })
  @Column({ name: 'transfer_destination', nullable: true })
  transferDestination?: string;

  @ApiProperty({ description: 'Review workflow ID if action is REVIEW' })
  @Column({ name: 'review_workflow_id', type: 'uuid', nullable: true })
  reviewWorkflowId?: string;

  @ApiProperty({ description: 'Policy creator' })
  @Column({ name: 'created_by_id', type: 'uuid' })
  @Index()
  createdById!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdByUser!: User;

  @ApiProperty({ description: 'Last policy updater' })
  @Column({ name: 'updated_by_id', type: 'uuid', nullable: true })
  updatedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedByUser?: User;

  @ApiProperty({ description: 'Number of documents affected' })
  @Column({ name: 'documents_count', type: 'int', default: 0 })
  documentsCount!: number;

  @ApiProperty({ description: 'Last executed timestamp' })
  @Column({ name: 'last_executed_at', type: 'timestamp', nullable: true })
  lastExecutedAt?: Date;

  @ApiProperty({ description: 'Additional policy metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
