import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum MonitoringMetricType {
  PERFORMANCE = 'performance',
  RESOURCE = 'resource',
  ERROR = 'error',
  LATENCY = 'latency',
}

@Entity('monitoring_metrics')
export class MonitoringMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: MonitoringMetricType })
  type!: MonitoringMetricType;

  @Column()
  name!: string;

  @Column({ type: 'float' })
  value!: number;

  @Column({ nullable: true })
  unit!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  recordedAt!: Date;
}

@Entity('monitoring_alerts')
export class MonitoringAlert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 20 })
  severity!: 'info' | 'warning' | 'error' | 'critical';

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'acknowledged' | 'resolved';

  @Column({ nullable: true })
  source!: string;

  @Column({ type: 'jsonb', nullable: true })
  context: any;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt!: Date;

  @Column({ nullable: true })
  acknowledgedBy!: string;
}
