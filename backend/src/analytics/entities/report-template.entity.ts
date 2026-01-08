import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@shared-types/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export type ReportType =
  | 'executive_summary'
  | 'financial_report'
  | 'attorney_performance'
  | 'practice_group_metrics'
  | 'client_profitability'
  | 'case_analytics'
  | 'billing_summary'
  | 'time_analysis'
  | 'custom';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on_demand';

export interface ReportConfig {
  title: string;
  description?: string;
  sections: {
    id: string;
    type: string;
    title: string;
    dataSource: string;
    config?: Record<string, unknown>;
  }[];
  filters?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  styling?: {
    theme?: string;
    logo?: string;
    colors?: Record<string, string>;
  };
}

export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time?: string; // HH:mm format
  timezone?: string;
  enabled: boolean;
}

@Entity('report_templates')
@Index(['type', 'createdAt'])
@Index(['organizationId'])
@Index(['createdBy'])
@Index(['isActive'])
export class ReportTemplate extends BaseEntity {
  @ApiProperty({ description: 'Report name' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Report type', enum: ['executive_summary', 'financial_report', 'attorney_performance', 'practice_group_metrics', 'client_profitability', 'case_analytics', 'billing_summary', 'time_analysis', 'custom'] })
  @Column({
    type: 'enum',
    enum: ['executive_summary', 'financial_report', 'attorney_performance', 'practice_group_metrics', 'client_profitability', 'case_analytics', 'billing_summary', 'time_analysis', 'custom'],
  })
  type!: ReportType;

  @ApiProperty({ description: 'Report description', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Report configuration' })
  @Column({ type: 'jsonb' })
  config!: ReportConfig;

  @ApiProperty({ description: 'Schedule configuration', required: false })
  @Column({ type: 'jsonb', nullable: true })
  schedule?: ScheduleConfig;

  @ApiProperty({ description: 'Output format', enum: ['pdf', 'excel', 'csv', 'json', 'html'] })
  @Column({
    type: 'enum',
    enum: ['pdf', 'excel', 'csv', 'json', 'html'],
    default: 'pdf',
  })
  format!: ReportFormat;

  @ApiProperty({ description: 'Organization ID', required: false })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId?: string;

  @ApiProperty({ description: 'Owner user ID' })
  @Column({ name: 'owner_id', type: 'uuid' })
  @Index()
  ownerId!: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @ApiProperty({ description: 'Recipients for scheduled reports', required: false })
  @Column({ type: 'jsonb', nullable: true })
  recipients?: {
    emails?: string[];
    userIds?: string[];
    roleIds?: string[];
  };

  @ApiProperty({ description: 'Whether template is active' })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Whether template is public/shared' })
  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic!: boolean;

  @ApiProperty({ description: 'Last execution timestamp', required: false })
  @Column({ name: 'last_executed_at', type: 'timestamp with time zone', nullable: true })
  lastExecutedAt?: Date;

  @ApiProperty({ description: 'Next scheduled execution', required: false })
  @Column({ name: 'next_execution_at', type: 'timestamp with time zone', nullable: true })
  nextExecutionAt?: Date;

  @ApiProperty({ description: 'Execution count' })
  @Column({ name: 'execution_count', type: 'int', default: 0 })
  executionCount!: number;

  @ApiProperty({ description: 'Tags for categorization', required: false })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Access control', required: false })
  @Column({ type: 'jsonb', nullable: true })
  permissions?: {
    allowedUsers?: string[];
    allowedRoles?: string[];
    department?: string[];
  };
}
