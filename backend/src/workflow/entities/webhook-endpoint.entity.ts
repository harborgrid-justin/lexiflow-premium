import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@/common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookEvent {
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  STEP_COMPLETED = 'step.completed',
  APPROVAL_REQUESTED = 'approval.requested',
  APPROVAL_GRANTED = 'approval.granted',
  APPROVAL_REJECTED = 'approval.rejected',
  DOCUMENT_UPLOADED = 'document.uploaded',
  MATTER_CREATED = 'matter.created',
  INVOICE_GENERATED = 'invoice.generated',
  TASK_CREATED = 'task.created',
  ALL = '*',
}

export enum WebhookMethod {
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

/**
 * WebhookEndpoint Entity
 * Manages webhook integrations for workflow events
 */
@Entity('webhook_endpoints')
@Index(['tenantId', 'active'])
export class WebhookEndpoint extends BaseEntity {
  @ApiProperty({ description: 'Webhook name' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Webhook description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Tenant/Organization ID' })
  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId!: string;

  @ApiProperty({ description: 'Webhook URL' })
  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @ApiProperty({ enum: WebhookMethod, description: 'HTTP method' })
  @Column({ type: 'enum', enum: WebhookMethod, default: WebhookMethod.POST })
  method!: WebhookMethod;

  @ApiProperty({ description: 'Events to trigger webhook' })
  @Column({ type: 'simple-array' })
  events!: WebhookEvent[];

  @ApiProperty({ description: 'Webhook secret for signature verification' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  secret?: string;

  @ApiProperty({ description: 'Custom headers (JSON)' })
  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, string>;

  @ApiProperty({ description: 'Whether webhook is active' })
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @ApiProperty({ enum: WebhookStatus, description: 'Webhook status' })
  @Column({ type: 'enum', enum: WebhookStatus, default: WebhookStatus.ACTIVE })
  status!: WebhookStatus;

  @ApiProperty({ description: 'Retry count on failure' })
  @Column({ name: 'retry_count', type: 'int', default: 3 })
  retryCount!: number;

  @ApiProperty({ description: 'Timeout in seconds' })
  @Column({ name: 'timeout_seconds', type: 'int', default: 30 })
  timeoutSeconds!: number;

  @ApiProperty({ description: 'Number of successful deliveries' })
  @Column({ name: 'success_count', type: 'int', default: 0 })
  successCount!: number;

  @ApiProperty({ description: 'Number of failed deliveries' })
  @Column({ name: 'failure_count', type: 'int', default: 0 })
  failureCount!: number;

  @ApiProperty({ description: 'Last delivery attempt' })
  @Column({ name: 'last_delivered_at', type: 'timestamp with time zone', nullable: true })
  lastDeliveredAt?: Date;

  @ApiProperty({ description: 'Last delivery status code' })
  @Column({ name: 'last_status_code', type: 'int', nullable: true })
  lastStatusCode?: number;

  @ApiProperty({ description: 'Last delivery error' })
  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string;

  @ApiProperty({ description: 'Average response time in milliseconds' })
  @Column({ name: 'avg_response_time_ms', type: 'float', nullable: true })
  avgResponseTimeMs?: number;

  @ApiProperty({ description: 'Filter conditions for webhook (JSON)' })
  @Column({ type: 'jsonb', nullable: true })
  filters?: Record<string, any>;

  @ApiProperty({ description: 'Webhook metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Whether to verify SSL certificates' })
  @Column({ name: 'verify_ssl', type: 'boolean', default: true })
  verifySsl!: boolean;
}
