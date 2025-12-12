import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';

export enum StepType {
  START = 'start',
  TASK = 'task',
  DECISION = 'decision',
  PARALLEL = 'parallel',
  SUBPROCESS = 'subprocess',
  END = 'end',
  WAIT = 'wait',
  NOTIFICATION = 'notification',
  SCRIPT = 'script',
}

export enum StepStatus {
  PENDING = 'pending',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  BLOCKED = 'blocked',
}

/**
 * Workflow Step Definition Entity
 * Defines individual steps in a workflow process
 */
@Entity('workflow_steps')
export class WorkflowStep extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: StepType,
    default: StepType.TASK,
  })
  type: StepType;

  @Column({ type: 'uuid', nullable: true })
  workflowDefinitionId?: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'jsonb', nullable: true })
  config?: {
    // For TASK type
    assigneeType?: 'user' | 'role' | 'dynamic';
    assigneeId?: string;
    assigneeRole?: string;
    assigneeExpression?: string;
    dueInDays?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    formFields?: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;

    // For DECISION type
    decisionVariable?: string;
    branches?: Array<{
      condition: string;
      nextStepId: string;
      label: string;
    }>;

    // For PARALLEL type
    parallelBranches?: Array<{
      branchName: string;
      steps: string[];
    }>;
    joinType?: 'all' | 'any' | 'one';

    // For WAIT type
    waitType?: 'time' | 'event' | 'condition';
    waitDuration?: number;
    waitEvent?: string;
    waitCondition?: string;

    // For NOTIFICATION type
    notificationTemplate?: string;
    recipients?: string[];
    channel?: 'email' | 'sms' | 'push' | 'in-app';

    // For SCRIPT type
    scriptLanguage?: 'javascript' | 'python';
    scriptCode?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  inputMappings?: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  outputMappings?: Record<string, string>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nextStepId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  errorHandlerStepId?: string;

  @Column({ type: 'boolean', default: false })
  isOptional: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
