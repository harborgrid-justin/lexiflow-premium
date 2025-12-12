import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DepositionType {
  ORAL = 'ORAL',
  WRITTEN = 'WRITTEN',
  VIDEO = 'VIDEO',
  TELEPHONIC = 'TELEPHONIC',
}

export enum DepositionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
  TRANSCRIPTION_PENDING = 'TRANSCRIPTION_PENDING',
  TRANSCRIPTION_COMPLETE = 'TRANSCRIPTION_COMPLETE',
}

@Entity('depositions')
export class Deposition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 300 })
  deponentName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deponentTitle: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  deponentOrganization: string;

  @Column({
    type: 'enum',
    enum: DepositionType,
    default: DepositionType.ORAL,
  })
  type: DepositionType;

  @Column({
    type: 'enum',
    enum: DepositionStatus,
    default: DepositionStatus.SCHEDULED,
  })
  status: DepositionStatus;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  courtReporter: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  videographer: string;

  @Column({ type: 'jsonb', nullable: true })
  attendees: Array<{
    name: string;
    role: string;
    organization?: string;
  }>;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  keyTestimony: string;

  @Column({ type: 'jsonb', nullable: true })
  exhibits: Array<{
    exhibitNumber: string;
    description: string;
    documentId?: string;
  }>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  transcriptPath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoPath: string;

  @Column({ type: 'boolean', default: false })
  isTranscriptOrdered: boolean;

  @Column({ type: 'date', nullable: true })
  transcriptOrderedDate: Date;

  @Column({ type: 'date', nullable: true })
  transcriptReceivedDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  assignedAttorney: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
