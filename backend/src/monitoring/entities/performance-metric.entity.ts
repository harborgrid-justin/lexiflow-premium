import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('performance_metrics')
@Index(['metricName', 'timestamp'])
export class PerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  metricName!: string;

  @Column('float')
  value!: number;

  @Column({ nullable: true })
  unit!: string;

  @Column('jsonb', { nullable: true })
  tags!: Record<string, any>;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
