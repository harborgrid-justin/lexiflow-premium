import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';

export type SnapshotType = 'kpis' | 'case_metrics' | 'financial' | 'productivity' | 'team_performance' | 'billing_metrics';
export type SnapshotPeriod = '1d' | '7d' | '30d' | '90d' | '365d' | 'ytd' | 'custom';

@Entity('dashboard_snapshots')
@Index(['userId', 'createdAt'])
@Index(['snapshotType', 'createdAt'])
@Index(['snapshotDate'])
@Index(['organizationId'])
export class DashboardSnapshot extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({
    name: 'snapshot_type',
    type: 'enum',
    enum: ['kpis', 'case_metrics', 'financial', 'productivity', 'team_performance', 'billing_metrics'],
  })
  snapshotType!: SnapshotType;

  @Column({ type: 'jsonb' })
  data!: Record<string, unknown>;

  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate!: string;

  @Column({
    type: 'enum',
    enum: ['1d', '7d', '30d', '90d', '365d', 'ytd', 'custom'],
    nullable: true,
  })
  period!: SnapshotPeriod | null;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null;

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  caseId!: string | null;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId!: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate!: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: string | null;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  filters!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;
}
