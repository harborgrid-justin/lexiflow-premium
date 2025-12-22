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
  config: {
    source: { type: string; config: any };
    transformations: any[];
    destination: { type: string; config: any };
    schedule?: string;
  };

  @Column({ type: 'int', default: 0 })
  runsTotal!: number;

  @Column({ type: 'int', default: 0 })
  runsSuccessful!: number;

  @Column({ type: 'int', default: 0 })
  runsFailed!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt!: Date;

  @Column()
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
