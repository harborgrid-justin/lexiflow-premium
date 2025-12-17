import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ETLPipeline } from './pipeline.entity';

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('etl_jobs')
export class ETLJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pipelineId: string;

  @ManyToOne(() => ETLPipeline)
  @JoinColumn({ name: 'pipelineId' })
  pipeline: ETLPipeline;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Column({ type: 'int', nullable: true })
  recordsProcessed: number;

  @Column({ type: 'int', nullable: true })
  recordsFailed: number;

  @Column({ type: 'int', nullable: true })
  durationMs: number;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'jsonb', nullable: true })
  metrics: any;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
