import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '@/common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { WorkflowStep } from './workflow-step.entity';
import { WorkflowExecution } from './workflow-execution.entity';

export enum WorkflowTriggerType {
  MANUAL = 'manual',
  DOCUMENT_UPLOAD = 'document_upload',
  MATTER_CREATED = 'matter_created',
  INVOICE_GENERATED = 'invoice_generated',
  DEADLINE_APPROACHING = 'deadline_approaching',
  APPROVAL_REQUESTED = 'approval_requested',
  TASK_COMPLETED = 'task_completed',
  CLIENT_INTAKE = 'client_intake',
  SCHEDULE = 'schedule',
  WEBHOOK = 'webhook',
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

/**
 * Workflow Entity
 * Defines reusable workflow templates with triggers, steps, and conditions
 */
@Entity('workflows')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'active'])
export class Workflow extends BaseEntity {
  @ApiProperty({ description: 'Workflow name' })
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name!: string;

  @ApiProperty({ description: 'Workflow description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Tenant/Organization ID' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId!: string;

  @ApiProperty({ enum: WorkflowTriggerType, description: 'Trigger type for workflow execution' })
  @Column({ type: 'enum', enum: WorkflowTriggerType, default: WorkflowTriggerType.MANUAL })
  trigger!: WorkflowTriggerType;

  @ApiProperty({ description: 'Trigger configuration (JSON)' })
  @Column({ name: 'trigger_config', type: 'jsonb', nullable: true })
  triggerConfig?: Record<string, any>;

  @ApiProperty({ description: 'Workflow category/type' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  category?: string;

  @ApiProperty({ enum: WorkflowStatus, description: 'Workflow status' })
  @Column({ type: 'enum', enum: WorkflowStatus, default: WorkflowStatus.DRAFT })
  status!: WorkflowStatus;

  @ApiProperty({ description: 'Whether workflow is active' })
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @ApiProperty({ description: 'Tags for organization' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Number of times workflow has been executed' })
  @Column({ name: 'execution_count', type: 'int', default: 0 })
  executionCount!: number;

  @ApiProperty({ description: 'Average execution time in seconds' })
  @Column({ name: 'avg_execution_time', type: 'float', nullable: true })
  avgExecutionTime?: number;

  @ApiProperty({ description: 'Success rate (percentage)' })
  @Column({ name: 'success_rate', type: 'float', nullable: true })
  successRate?: number;

  @ApiProperty({ description: 'Workflow metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @OneToMany(() => WorkflowStep, (step) => step.workflow)
  steps?: WorkflowStep[];

  @OneToMany(() => WorkflowExecution, (execution) => execution.workflow)
  executions?: WorkflowExecution[];
}
