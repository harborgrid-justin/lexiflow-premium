import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export type SnapshotType =
  | 'executive_summary'
  | 'firm_overview'
  | 'practice_group'
  | 'attorney_performance'
  | 'client_analytics'
  | 'financial_summary'
  | 'operational'
  | 'custom';

export type SnapshotPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface SnapshotMetrics {
  // Financial metrics
  revenue?: number;
  expenses?: number;
  profit?: number;
  profitMargin?: number;
  billingRealization?: number;
  collectionRealization?: number;
  workInProgress?: number;
  accountsReceivable?: number;

  // Productivity metrics
  billableHours?: number;
  nonBillableHours?: number;
  utilizationRate?: number;
  realizationRate?: number;

  // Case metrics
  activeCases?: number;
  newCases?: number;
  closedCases?: number;
  caseSuccessRate?: number;
  averageCaseDuration?: number;

  // Client metrics
  activeClients?: number;
  newClients?: number;
  clientRetentionRate?: number;
  clientSatisfactionScore?: number;

  // Attorney metrics
  totalAttorneys?: number;
  averageHourlyRate?: number;
  averageBillableHours?: number;

  // Custom metrics
  [key: string]: number | string | boolean | undefined;
}

export interface SnapshotDimensions {
  organizationId?: string;
  practiceGroupId?: string;
  departmentId?: string;
  officeId?: string;
  region?: string;
  [key: string]: string | undefined;
}

@Entity('analytics_snapshots')
@Index(['snapshotType', 'snapshotDate'])
@Index(['organizationId', 'snapshotDate'])
@Index(['snapshotDate'])
@Index(['period'])
export class AnalyticsSnapshot extends BaseEntity {
  @ApiProperty({ description: 'Snapshot date' })
  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate!: string;

  @ApiProperty({ description: 'Snapshot type', enum: ['executive_summary', 'firm_overview', 'practice_group', 'attorney_performance', 'client_analytics', 'financial_summary', 'operational', 'custom'] })
  @Column({
    name: 'snapshot_type',
    type: 'enum',
    enum: ['executive_summary', 'firm_overview', 'practice_group', 'attorney_performance', 'client_analytics', 'financial_summary', 'operational', 'custom'],
  })
  snapshotType!: SnapshotType;

  @ApiProperty({ description: 'Snapshot period', enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'] })
  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
  })
  period!: SnapshotPeriod;

  @ApiProperty({ description: 'Metrics data' })
  @Column({ type: 'jsonb' })
  metrics!: SnapshotMetrics;

  @ApiProperty({ description: 'Dimensions for filtering and grouping' })
  @Column({ type: 'jsonb', nullable: true })
  dimensions?: SnapshotDimensions;

  @ApiProperty({ description: 'Organization ID', required: false })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId?: string;

  @ApiProperty({ description: 'Start date of the snapshot period', required: false })
  @Column({ name: 'period_start', type: 'date', nullable: true })
  periodStart?: string;

  @ApiProperty({ description: 'End date of the snapshot period', required: false })
  @Column({ name: 'period_end', type: 'date', nullable: true })
  periodEnd?: string;

  @ApiProperty({ description: 'Comparison to previous period', required: false })
  @Column({ type: 'jsonb', nullable: true })
  comparison?: {
    previousPeriod?: SnapshotMetrics;
    changePercentage?: Record<string, number>;
    trends?: Record<string, 'up' | 'down' | 'stable'>;
  };

  @ApiProperty({ description: 'Additional metadata', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: 'Snapshot version for tracking changes' })
  @Column({ name: 'snapshot_version', type: 'int', default: 1 })
  snapshotVersion!: number;

  @ApiProperty({ description: 'Whether this snapshot is finalized' })
  @Column({ name: 'is_finalized', type: 'boolean', default: false })
  isFinalized!: boolean;

  @ApiProperty({ description: 'Data quality score (0-100)', required: false })
  @Column({ name: 'data_quality_score', type: 'int', nullable: true })
  dataQualityScore?: number;
}
