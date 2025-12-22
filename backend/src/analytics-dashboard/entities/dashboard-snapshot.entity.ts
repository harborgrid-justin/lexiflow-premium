import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('dashboard_snapshots')
@Index(['userId', 'createdAt'])
@Index(['snapshotType', 'createdAt'])
export class DashboardSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId!: string;

  @Column({ type: 'varchar', length: 100 })
  snapshotType!: string; // 'kpis', 'case_metrics', 'financial', 'productivity'

  @Column({ type: 'jsonb' })
  data!: Record<string, unknown>;

  @Column({ type: 'date' })
  @Index()
  snapshotDate!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  period!: string; // '1d', '7d', '30d', '90d', '365d'

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
