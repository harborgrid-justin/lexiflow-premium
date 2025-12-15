import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum OCRStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Entity('ocr_jobs')
@Index(['documentId', 'status'])
@Index(['status', 'createdAt'])
export class OCRJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  documentId: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({
    type: 'enum',
    enum: OCRStatus,
    default: OCRStatus.PENDING
  })
  @Index()
  status: OCRStatus;

  @Column({ type: 'text', nullable: true })
  extractedText: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  pageCount: number;

  @Column({ type: 'int', default: 0 })
  processedPages: number;

  @Column({ type: 'float', nullable: true })
  confidence: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
