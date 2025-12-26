import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PipelineStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
}

@Entity('etl_pipelines')
export class ETLPipeline {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'enum', enum: PipelineStatus, default: PipelineStatus.DRAFT })
  status!: PipelineStatus;

  @Column({ type: 'jsonb' })
  config!: {
    source: { type: string; config: Record<string, unknown> };
    transformations: Record<string, unknown>[];
    destination: { type: string; config: Record<string, unknown> };
    schedule?: string;
  };

  @Column({ type: 'int', default: 0, name: 'runs_total' })
  runsTotal!: number;

  @Column({ type: 'int', default: 0, name: 'runs_successful' })
  runsSuccessful!: number;

  @Column({ type: 'int', default: 0, name: 'runs_failed' })
  runsFailed!: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_run_at' })
  lastRunAt!: Date;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
