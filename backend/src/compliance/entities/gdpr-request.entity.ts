import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';

export enum GDPRRequestType {
  ACCESS = 'access', // Right to access (Art. 15)
  RECTIFICATION = 'rectification', // Right to rectification (Art. 16)
  ERASURE = 'erasure', // Right to erasure / Right to be forgotten (Art. 17)
  RESTRICTION = 'restriction', // Right to restriction of processing (Art. 18)
  PORTABILITY = 'portability', // Right to data portability (Art. 20)
  OBJECTION = 'objection', // Right to object (Art. 21)
  AUTOMATED_DECISION = 'automated_decision', // Rights related to automated decision making (Art. 22)
}

export enum GDPRRequestStatus {
  RECEIVED = 'received',
  VERIFIED = 'verified',
  IN_PROGRESS = 'in_progress',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum GDPRRequestPriority {
  URGENT = 'urgent', // Legal deadline < 7 days
  HIGH = 'high', // Legal deadline < 15 days
  NORMAL = 'normal', // Standard 30-day deadline
  LOW = 'low',
}

@Entity('gdpr_requests')
@Index(['type'])
@Index(['status'])
@Index(['requesterId'])
@Index(['dueDate'])
@Index(['priority'])
export class GDPRRequest extends BaseEntity {
  @ApiProperty({ enum: GDPRRequestType, description: 'Type of GDPR request' })
  @Column({
    type: 'enum',
    enum: GDPRRequestType,
  })
  type!: GDPRRequestType;

  @ApiProperty({ description: 'User making the request (data subject)' })
  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'requester_id' })
  requester!: User;

  @ApiProperty({ description: 'Requester email' })
  @Column({ name: 'requester_email', type: 'varchar', length: 255 })
  requesterEmail!: string;

  @ApiProperty({ description: 'Requester full name' })
  @Column({ name: 'requester_name', type: 'varchar', length: 255 })
  requesterName!: string;

  @ApiProperty({ enum: GDPRRequestStatus, description: 'Current status of the request' })
  @Column({
    type: 'enum',
    enum: GDPRRequestStatus,
    default: GDPRRequestStatus.RECEIVED,
  })
  status!: GDPRRequestStatus;

  @ApiProperty({ enum: GDPRRequestPriority, description: 'Priority level' })
  @Column({
    type: 'enum',
    enum: GDPRRequestPriority,
    default: GDPRRequestPriority.NORMAL,
  })
  priority!: GDPRRequestPriority;

  @ApiProperty({ description: 'Request details and justification' })
  @Column({ type: 'text' })
  details!: string;

  @ApiProperty({ description: 'Specific data categories requested' })
  @Column({ name: 'data_categories', type: 'text', array: true, default: '{}' })
  dataCategories!: string[];

  @ApiProperty({ description: 'Date request was received' })
  @Column({ name: 'received_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  receivedAt!: Date;

  @ApiProperty({ description: 'Due date (typically 30 days from receipt per GDPR)' })
  @Column({ name: 'due_date', type: 'timestamp' })
  dueDate!: Date;

  @ApiProperty({ description: 'Date request was completed' })
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt!: Date;

  @ApiProperty({ description: 'User assigned to handle this request' })
  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee!: User;

  @ApiProperty({ description: 'Identity verification method used' })
  @Column({ name: 'verification_method', type: 'varchar', length: 100, nullable: true })
  verificationMethod!: string;

  @ApiProperty({ description: 'Date identity was verified' })
  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt!: Date;

  @ApiProperty({ description: 'Verified by user ID' })
  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy!: string;

  @ApiProperty({ description: 'Legal basis for processing this request' })
  @Column({ name: 'legal_basis', type: 'text', nullable: true })
  legalBasis!: string;

  @ApiProperty({ description: 'Evidence documents or verification materials' })
  @Column({ type: 'jsonb', nullable: true })
  evidence!: {
    type?: string;
    description?: string;
    fileId?: string;
    uploadedAt?: Date;
    uploadedBy?: string;
  }[];

  @ApiProperty({ description: 'Data sources checked' })
  @Column({ name: 'data_sources_checked', type: 'text', array: true, default: '{}' })
  dataSourcesChecked!: string[];

  @ApiProperty({ description: 'Records found across systems' })
  @Column({ name: 'records_found', type: 'integer', default: 0 })
  recordsFound!: number;

  @ApiProperty({ description: 'Records processed/actioned' })
  @Column({ name: 'records_processed', type: 'integer', default: 0 })
  recordsProcessed!: number;

  @ApiProperty({ description: 'Export file information (for access/portability requests)' })
  @Column({ name: 'export_file', type: 'jsonb', nullable: true })
  exportFile!: {
    fileId?: string;
    fileName?: string;
    format?: string;
    size?: number;
    generatedAt?: Date;
    expiresAt?: Date;
    downloadUrl?: string;
  };

  @ApiProperty({ description: 'Deletion summary (for erasure requests)' })
  @Column({ name: 'deletion_summary', type: 'jsonb', nullable: true })
  deletionSummary!: {
    entitiesDeleted?: Record<string, number>;
    totalRecordsDeleted?: number;
    retainedRecords?: string[];
    retentionReason?: string;
  };

  @ApiProperty({ description: 'Response to the data subject' })
  @Column({ name: 'response_text', type: 'text', nullable: true })
  responseText!: string;

  @ApiProperty({ description: 'Response sent date' })
  @Column({ name: 'response_sent_at', type: 'timestamp', nullable: true })
  responseSentAt!: Date;

  @ApiProperty({ description: 'Reason for rejection (if applicable)' })
  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string;

  @ApiProperty({ description: 'Internal notes and progress tracking' })
  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes!: string;

  @ApiProperty({ description: 'Activity log for this request' })
  @Column({ name: 'activity_log', type: 'jsonb', nullable: true })
  activityLog!: {
    timestamp?: Date;
    userId?: string;
    action?: string;
    details?: string;
  }[];

  @ApiProperty({ description: 'Approval required flag' })
  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval!: boolean;

  @ApiProperty({ description: 'Approved by user ID' })
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string;

  @ApiProperty({ description: 'Approval date' })
  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @ApiProperty({ description: 'Approval notes' })
  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes!: string;

  @ApiProperty({ description: 'Extensions granted (in days)' })
  @Column({ name: 'extension_days', type: 'integer', default: 0 })
  extensionDays!: number;

  @ApiProperty({ description: 'Extension justification' })
  @Column({ name: 'extension_reason', type: 'text', nullable: true })
  extensionReason!: string;

  @ApiProperty({ description: 'Communication history with requester' })
  @Column({ type: 'jsonb', nullable: true })
  communications!: {
    date?: Date;
    type?: string;
    subject?: string;
    content?: string;
    sentBy?: string;
  }[];

  @ApiProperty({ description: 'Related case or matter ID' })
  @Column({ name: 'related_case_id', type: 'uuid', nullable: true })
  relatedCaseId!: string;

  @ApiProperty({ description: 'Related organization ID' })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string;

  @ApiProperty({ description: 'Tags for categorization' })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'Audit trail reference' })
  @Column({ name: 'audit_trail_id', type: 'varchar', length: 100, nullable: true })
  auditTrailId!: string;
}
