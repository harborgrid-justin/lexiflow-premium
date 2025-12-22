import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { JobType, JobStatus } from '../dto/job-status.dto';

@Entity('processing_jobs')
@Index(['status'])
@Index(['type'])
export class ProcessingJob {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: JobType,
  })
  type!: JobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  status!: JobStatus;

  @Column({ type: 'uuid' })
  @Index()
  documentId!: string;

  @Column({ type: 'int', default: 0 })
  progress!: number;

  @Column({ type: 'jsonb', nullable: true })
  parameters!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  result!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  error!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date;

  @Column({ type: 'int', nullable: true })
  processingTime!: number;

  @Column({ type: 'uuid', nullable: true })
  createdBy!: string;
}
