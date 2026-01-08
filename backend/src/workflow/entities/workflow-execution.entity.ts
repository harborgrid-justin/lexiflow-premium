import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Workflow } from './workflow.entity';

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * WorkflowExecution Entity
 * Tracks individual workflow execution instances
 */
@Entity('workflow_executions')
@Index(['workflowId', 'status'])
@Index(['tenantId', 'status'])
@Index(['startedAt'])
export class WorkflowExecution extends BaseEntity {
  @ApiProperty({ description: 'Workflow ID' })
  @Column({ name: 'workflow_id', type: 'uuid' })
  @Index()
  workflowId!: string;

  @ApiProperty({ description: 'Tenant/Organization ID' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId!: string;

  @ApiProperty({ description: 'Related entity type (matter, document, invoice, etc.)' })
  @Column({ name: 'entity_type', type: 'varchar', length: 100, nullable: true })
  entityType?: string;

  @ApiProperty({ description: 'Related entity ID' })
  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  @Index()
  entityId?: string;

  @ApiProperty({ enum: ExecutionStatus, description: 'Execution status' })
  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.PENDING })
  status!: ExecutionStatus;

  @ApiProperty({ description: 'Trigger data that initiated the workflow (JSON)' })
  @Column({ name: 'trigger_data', type: 'jsonb', nullable: true })
  triggerData?: Record<string, any>;

  @ApiProperty({ description: 'Current step ID being executed' })
  @Column({ name: 'current_step_id', type: 'uuid', nullable: true })
  currentStepId?: string;

  @ApiProperty({ description: 'Current step number' })
  @Column({ name: 'current_step_number', type: 'int', default: 0 })
  currentStepNumber!: number;

  @ApiProperty({ description: 'Total number of steps' })
  @Column({ name: 'total_steps', type: 'int', default: 0 })
  totalSteps!: number;

  @ApiProperty({ description: 'Execution context/variables (JSON)' })
  @Column({ type: 'jsonb', nullable: true })
  context?: Record<string, any>;

  @ApiProperty({ description: 'Step execution history (JSON)' })
  @Column({ name: 'step_history', type: 'jsonb', nullable: true })
  stepHistory?: Array<{
    stepId: string;
    stepName: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    output?: any;
    error?: string;
  }>;

  @ApiProperty({ description: 'Workflow started at' })
  @Column({ name: 'started_at', type: 'timestamp with time zone', nullable: true })
  startedAt?: Date;

  @ApiProperty({ description: 'Workflow completed at' })
  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Workflow paused at' })
  @Column({ name: 'paused_at', type: 'timestamp with time zone', nullable: true })
  pausedAt?: Date;

  @ApiProperty({ description: 'Execution duration in seconds' })
  @Column({ name: 'duration_seconds', type: 'float', nullable: true })
  durationSeconds?: number;

  @ApiProperty({ description: 'Error message if failed' })
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @ApiProperty({ description: 'Error details (JSON)' })
  @Column({ name: 'error_details', type: 'jsonb', nullable: true })
  errorDetails?: Record<string, any>;

  @ApiProperty({ description: 'User who initiated execution' })
  @Column({ name: 'initiated_by', type: 'uuid', nullable: true })
  initiatedBy?: string;

  @ApiProperty({ description: 'User who cancelled execution' })
  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy?: string;

  @ApiProperty({ description: 'Cancellation reason' })
  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @ApiProperty({ description: 'Priority (1-10, 10 = highest)' })
  @Column({ type: 'int', default: 5 })
  priority!: number;

  @ApiProperty({ description: 'Execution metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @ManyToOne(() => Workflow, (workflow) => workflow.executions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow?: Workflow;
}
