import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@/common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum RuleTrigger {
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_APPROVED = 'document_approved',
  MATTER_STATUS_CHANGED = 'matter_status_changed',
  DEADLINE_APPROACHING = 'deadline_approaching',
  INVOICE_GENERATED = 'invoice_generated',
  TASK_COMPLETED = 'task_completed',
  CLIENT_CREATED = 'client_created',
  CONFLICT_DETECTED = 'conflict_detected',
  TIME_BASED = 'time_based',
  MANUAL_TRIGGER = 'manual_trigger',
}

export enum ActionType {
  SEND_EMAIL = 'send_email',
  CREATE_TASK = 'create_task',
  UPDATE_STATUS = 'update_status',
  ASSIGN_USER = 'assign_user',
  GENERATE_DOCUMENT = 'generate_document',
  SEND_NOTIFICATION = 'send_notification',
  WEBHOOK = 'webhook',
  RUN_WORKFLOW = 'run_workflow',
  UPDATE_FIELD = 'update_field',
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logic?: 'and' | 'or';
}

export interface AutomationAction {
  type: ActionType;
  config: Record<string, any>;
  order: number;
  continueOnError?: boolean;
}

/**
 * AutomationRule Entity
 * Defines automated actions triggered by specific events
 */
@Entity('automation_rules')
@Index(['tenantId', 'active'])
@Index(['trigger'])
export class AutomationRule extends BaseEntity {
  @ApiProperty({ description: 'Rule name' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Rule description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Tenant/Organization ID' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId!: string;

  @ApiProperty({ enum: RuleTrigger, description: 'Trigger event' })
  @Column({ type: 'enum', enum: RuleTrigger })
  trigger!: RuleTrigger;

  @ApiProperty({ description: 'Trigger configuration' })
  @Column({ name: 'trigger_config', type: 'jsonb', nullable: true })
  triggerConfig?: Record<string, any>;

  @ApiProperty({ description: 'Conditions that must be met' })
  @Column({ type: 'jsonb', nullable: true })
  conditions?: AutomationCondition[];

  @ApiProperty({ description: 'Actions to execute' })
  @Column({ type: 'jsonb' })
  actions!: AutomationAction[];

  @ApiProperty({ description: 'Whether rule is active' })
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @ApiProperty({ description: 'Priority (1-10, 10 = highest)' })
  @Column({ type: 'int', default: 5 })
  priority!: number;

  @ApiProperty({ description: 'Number of times rule has been triggered' })
  @Column({ name: 'execution_count', type: 'int', default: 0 })
  executionCount!: number;

  @ApiProperty({ description: 'Number of successful executions' })
  @Column({ name: 'success_count', type: 'int', default: 0 })
  successCount!: number;

  @ApiProperty({ description: 'Number of failed executions' })
  @Column({ name: 'failure_count', type: 'int', default: 0 })
  failureCount!: number;

  @ApiProperty({ description: 'Last execution time' })
  @Column({ name: 'last_executed_at', type: 'timestamp with time zone', nullable: true })
  lastExecutedAt?: Date;

  @ApiProperty({ description: 'Last execution status' })
  @Column({ name: 'last_execution_status', type: 'varchar', length: 50, nullable: true })
  lastExecutionStatus?: string;

  @ApiProperty({ description: 'Last execution error' })
  @Column({ name: 'last_execution_error', type: 'text', nullable: true })
  lastExecutionError?: string;

  @ApiProperty({ description: 'Schedule for time-based triggers (cron expression)' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  schedule?: string;

  @ApiProperty({ description: 'Tags for organization' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Rule metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Whether to stop processing other rules after this one' })
  @Column({ name: 'stop_on_match', type: 'boolean', default: false })
  stopOnMatch!: boolean;
}
