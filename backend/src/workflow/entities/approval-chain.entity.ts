import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@/common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ApprovalStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ApprovalType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  UNANIMOUS = 'unanimous',
  MAJORITY = 'majority',
}

export interface Approver {
  userId: string;
  userName: string;
  role?: string;
  order: number;
  required: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedAt?: Date;
  rejectedAt?: Date;
  comments?: string;
  delegatedTo?: string;
}

/**
 * ApprovalChain Entity
 * Manages approval workflows for documents, invoices, matters, etc.
 */
@Entity('approval_chains')
@Index(['workflowExecutionId', 'status'])
@Index(['entityType', 'entityId'])
@Index(['currentStep'])
export class ApprovalChain extends BaseEntity {
  @ApiProperty({ description: 'Workflow execution ID' })
  @Column({ name: 'workflow_execution_id', type: 'uuid', nullable: true })
  @Index()
  workflowExecutionId?: string;

  @ApiProperty({ description: 'Entity type being approved' })
  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType!: string;

  @ApiProperty({ description: 'Entity ID being approved' })
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @ApiProperty({ description: 'Tenant/Organization ID' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId!: string;

  @ApiProperty({ description: 'Approval chain name' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Approval chain description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: ApprovalType, description: 'Type of approval chain' })
  @Column({ name: 'approval_type', type: 'enum', enum: ApprovalType, default: ApprovalType.SEQUENTIAL })
  approvalType!: ApprovalType;

  @ApiProperty({ description: 'List of approvers' })
  @Column({ type: 'jsonb' })
  approvers!: Approver[];

  @ApiProperty({ description: 'Current approval step' })
  @Column({ name: 'current_step', type: 'int', default: 0 })
  currentStep!: number;

  @ApiProperty({ enum: ApprovalStatus, description: 'Overall approval status' })
  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status!: ApprovalStatus;

  @ApiProperty({ description: 'Number of approvals required' })
  @Column({ name: 'required_approvals', type: 'int' })
  requiredApprovals!: number;

  @ApiProperty({ description: 'Number of approvals received' })
  @Column({ name: 'received_approvals', type: 'int', default: 0 })
  receivedApprovals!: number;

  @ApiProperty({ description: 'Number of rejections' })
  @Column({ name: 'rejection_count', type: 'int', default: 0 })
  rejectionCount!: number;

  @ApiProperty({ description: 'Auto-approve after timeout (in hours)' })
  @Column({ name: 'auto_approve_timeout_hours', type: 'int', nullable: true })
  autoApproveTimeoutHours?: number;

  @ApiProperty({ description: 'Deadline for approval' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  deadline?: Date;

  @ApiProperty({ description: 'Started at' })
  @Column({ name: 'started_at', type: 'timestamp with time zone', nullable: true })
  startedAt?: Date;

  @ApiProperty({ description: 'Completed at' })
  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'User who requested approval' })
  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy!: string;

  @ApiProperty({ description: 'Reason for request' })
  @Column({ name: 'request_reason', type: 'text', nullable: true })
  requestReason?: string;

  @ApiProperty({ description: 'Final decision reason' })
  @Column({ name: 'decision_reason', type: 'text', nullable: true })
  decisionReason?: string;

  @ApiProperty({ description: 'Additional approval metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Whether to notify on approval' })
  @Column({ name: 'notify_on_approval', type: 'boolean', default: true })
  notifyOnApproval!: boolean;

  @ApiProperty({ description: 'Whether to notify on rejection' })
  @Column({ name: 'notify_on_rejection', type: 'boolean', default: true })
  notifyOnRejection!: boolean;

  @ApiProperty({ description: 'Escalation user ID if deadline missed' })
  @Column({ name: 'escalate_to', type: 'uuid', nullable: true })
  escalateTo?: string;
}
