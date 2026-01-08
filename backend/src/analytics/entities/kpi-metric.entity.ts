import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export type MetricCategory =
  | 'financial'
  | 'productivity'
  | 'client_satisfaction'
  | 'case_performance'
  | 'attorney_utilization'
  | 'billing'
  | 'operational'
  | 'custom';

export type TrendDirection = 'up' | 'down' | 'stable';

export type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface MetricDimensions {
  organizationId?: string;
  practiceGroupId?: string;
  attorneyId?: string;
  clientId?: string;
  caseId?: string;
  departmentId?: string;
  [key: string]: string | undefined;
}

@Entity('kpi_metrics')
@Index(['name', 'period', 'recordedAt'])
@Index(['category', 'recordedAt'])
@Index(['organizationId', 'recordedAt'])
@Index(['recordedAt'])
export class KPIMetric extends BaseEntity {
  @ApiProperty({ description: 'KPI metric name' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Metric category', enum: ['financial', 'productivity', 'client_satisfaction', 'case_performance', 'attorney_utilization', 'billing', 'operational', 'custom'] })
  @Column({
    type: 'enum',
    enum: ['financial', 'productivity', 'client_satisfaction', 'case_performance', 'attorney_utilization', 'billing', 'operational', 'custom'],
  })
  category!: MetricCategory;

  @ApiProperty({ description: 'Current metric value' })
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  value!: number;

  @ApiProperty({ description: 'Target value for this metric', required: false })
  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  target?: number;

  @ApiProperty({ description: 'Previous period value for comparison', required: false })
  @Column({ name: 'previous_value', type: 'decimal', precision: 18, scale: 4, nullable: true })
  previousValue?: number;

  @ApiProperty({ description: 'Trend direction', enum: ['up', 'down', 'stable'], required: false })
  @Column({
    type: 'enum',
    enum: ['up', 'down', 'stable'],
    nullable: true,
  })
  trend?: TrendDirection;

  @ApiProperty({ description: 'Trend percentage change', required: false })
  @Column({ name: 'trend_percentage', type: 'decimal', precision: 10, scale: 2, nullable: true })
  trendPercentage?: number;

  @ApiProperty({ description: 'Time period', enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'] })
  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
  })
  period!: Period;

  @ApiProperty({ description: 'Date this metric was recorded' })
  @Column({ name: 'recorded_at', type: 'timestamp with time zone' })
  recordedAt!: Date;

  @ApiProperty({ description: 'Start date of the period', required: false })
  @Column({ name: 'period_start', type: 'date', nullable: true })
  periodStart?: string;

  @ApiProperty({ description: 'End date of the period', required: false })
  @Column({ name: 'period_end', type: 'date', nullable: true })
  periodEnd?: string;

  @ApiProperty({ description: 'Organization ID', required: false })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId?: string;

  @ApiProperty({ description: 'Metric dimensions for drill-down analysis' })
  @Column({ type: 'jsonb', nullable: true })
  dimensions?: MetricDimensions;

  @ApiProperty({ description: 'Unit of measurement (e.g., USD, hours, count)', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  unit?: string;

  @ApiProperty({ description: 'Additional metric metadata', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: 'Breakdown data for detailed analysis', required: false })
  @Column({ type: 'jsonb', nullable: true })
  breakdown?: Record<string, unknown>;

  @ApiProperty({ description: 'Whether this metric is a benchmark' })
  @Column({ name: 'is_benchmark', type: 'boolean', default: false })
  isBenchmark!: boolean;

  @ApiProperty({ description: 'Data source identifier', required: false })
  @Column({ name: 'data_source', type: 'varchar', length: 255, nullable: true })
  dataSource?: string;
}
