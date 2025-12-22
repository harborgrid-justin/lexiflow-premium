import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AIOperationType {
  SUMMARIZATION = 'summarization',
  CLASSIFICATION = 'classification',
  EXTRACTION = 'extraction',
  PREDICTION = 'prediction',
  GENERATION = 'generation',
}

export enum AIOperationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('ai_operations')
export class AIOperation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: AIOperationType,
  })
  operationType!: AIOperationType;

  @Column()
  model!: string;

  @Column({ type: 'jsonb' })
  input!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  output?: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: AIOperationStatus,
    default: AIOperationStatus.PENDING,
  })
  status!: AIOperationStatus;

  @Column({ type: 'float', nullable: true })
  confidence?: number;

  @Column({ type: 'int', nullable: true })
  processingTime?: number;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  completedAt?: Date;
}
