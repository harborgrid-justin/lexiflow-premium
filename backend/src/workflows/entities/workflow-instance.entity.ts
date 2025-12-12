import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TERMINATED = 'terminated',
}

export interface StepExecutionRecord {
  stepId: string;
  stepName: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  assignee?: string;
  result?: any;
  errorMessage?: string;
  duration?: number;
  retryCount?: number;
}

/**
 * Workflow Instance Entity
 * Represents a running instance of a workflow
 */
@Entity('workflow_instances')
export class WorkflowInstance extends BaseEntity {
  @Column({ type: 'uuid' })
  workflowDefinitionId: string;

  @Column({ type: 'varchar', length: 255 })
  workflowName: string;

  @Column({ type: 'uuid', nullable: true })
  caseId?: string;

  @Column({ type: 'uuid', nullable: true })
  documentId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityType?: string;

  @Column({ type: 'uuid', nullable: true })
  entityId?: string;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.ACTIVE,
  })
  status: WorkflowStatus;

  @Column({ type: 'uuid', nullable: true })
  currentStepId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currentStepName?: string;

  @Column({ type: 'uuid', nullable: true })
  initiatedBy?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  initiatedByName?: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  pausedAt?: Date;

  @Column({ type: 'int', default: 0 })
  executionTimeMs?: number;

  @Column({ type: 'jsonb', nullable: true })
  variables?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  executionHistory?: StepExecutionRecord[];

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'int', default: 0 })
  completedSteps: number;

  @Column({ type: 'int', default: 0 })
  totalSteps: number;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
