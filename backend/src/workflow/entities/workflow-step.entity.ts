import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Workflow } from './workflow.entity';

export enum StepType {
  TASK = 'task',
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  WEBHOOK = 'webhook',
  CONDITION = 'condition',
  DELAY = 'delay',
  DOCUMENT_GENERATION = 'document_generation',
  EMAIL = 'email',
  ASSIGNMENT = 'assignment',
  CONFLICT_CHECK = 'conflict_check',
  DATA_VALIDATION = 'data_validation',
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed',
}

/**
 * WorkflowStep Entity
 * Defines individual steps within a workflow
 */
@Entity('workflow_steps')
@Index(['workflowId', 'order'])
export class WorkflowStep extends BaseEntity {
  @ApiProperty({ description: 'Workflow ID' })
  @Column({ name: 'workflow_id', type: 'uuid' })
  @Index()
  workflowId!: string;

  @ApiProperty({ description: 'Step name' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Step description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: StepType, description: 'Type of step' })
  @Column({ type: 'enum', enum: StepType })
  type!: StepType;

  @ApiProperty({ description: 'Step execution order' })
  @Column({ type: 'int' })
  order!: number;

  @ApiProperty({ description: 'Step configuration (JSON)' })
  @Column({ type: 'jsonb' })
  config!: Record<string, any>;

  @ApiProperty({ description: 'Conditions for step execution (JSON)' })
  @Column({ type: 'jsonb', nullable: true })
  conditions?: {
    field?: string;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value?: any;
    logic?: 'and' | 'or';
  }[];

  @ApiProperty({ description: 'Whether step is required' })
  @Column({ type: 'boolean', default: true })
  required!: boolean;

  @ApiProperty({ description: 'Whether step can be skipped manually' })
  @Column({ name: 'allow_skip', type: 'boolean', default: false })
  allowSkip!: boolean;

  @ApiProperty({ description: 'Timeout in seconds' })
  @Column({ name: 'timeout_seconds', type: 'int', nullable: true })
  timeoutSeconds?: number;

  @ApiProperty({ description: 'Retry attempts on failure' })
  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount!: number;

  @ApiProperty({ description: 'Assigned user ID' })
  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo?: string;

  @ApiProperty({ description: 'Assigned role' })
  @Column({ name: 'assigned_role', type: 'varchar', length: 100, nullable: true })
  assignedRole?: string;

  @ApiProperty({ description: 'Estimated duration in hours' })
  @Column({ name: 'estimated_duration_hours', type: 'float', nullable: true })
  estimatedDurationHours?: number;

  @ApiProperty({ description: 'Step dependencies (step IDs that must complete first)' })
  @Column({ type: 'simple-array', nullable: true })
  dependencies?: string[];

  @ApiProperty({ description: 'Next step IDs on success' })
  @Column({ name: 'next_steps', type: 'simple-array', nullable: true })
  nextSteps?: string[];

  @ApiProperty({ description: 'Step on failure' })
  @Column({ name: 'on_failure_step', type: 'uuid', nullable: true })
  onFailureStep?: string;

  // Relations
  @ManyToOne(() => Workflow, (workflow) => workflow.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow?: Workflow;
}
