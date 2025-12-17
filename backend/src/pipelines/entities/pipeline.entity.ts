import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PipelineType, PipelineStatus } from '../dto/create-pipeline.dto';

@Entity('etl_pipelines')
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PipelineType,
    default: PipelineType.ETL,
  })
  type: PipelineType;

  @Column({ nullable: true })
  description: string;

  @Column()
  sourceConnector: string;

  @Column()
  targetConnector: string;

  @Column('jsonb')
  configuration: Record<string, any>;

  @Column({ nullable: true })
  schedule: string;

  @Column({
    type: 'enum',
    enum: PipelineStatus,
    default: PipelineStatus.DRAFT,
  })
  status: PipelineStatus;

  @Column({ type: 'bigint', default: 0 })
  recordsProcessed: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRun: Date;

  @Column({ nullable: true })
  lastRunStatus: string;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;
}
