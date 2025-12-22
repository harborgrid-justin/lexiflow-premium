import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InterviewType {
  IN_PERSON = 'IN_PERSON',
  TELEPHONIC = 'TELEPHONIC',
  VIDEO_CONFERENCE = 'VIDEO_CONFERENCE',
  INFORMAL = 'INFORMAL',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW',
}

@Entity('custodian_interviews')
export class CustodianInterview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  caseId!: string;

  @Column({ type: 'uuid' })
  custodianId!: string;

  @Column({ type: 'varchar', length: 300 })
  custodianName!: string;

  @Column({
    type: 'enum',
    enum: InterviewType,
  })
  type!: InterviewType;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status!: InterviewStatus;

  @Column({ type: 'timestamp' })
  scheduledDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime!: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime!: Date;

  @Column({ type: 'int', nullable: true })
  durationMinutes!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location!: string;

  @Column({ type: 'jsonb', nullable: true })
  interviewers: Array<{
    userId: string;
    name: string;
    role: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  attendees: Array<{
    name: string;
    role: string;
    organization?: string;
  }>;

  @Column({ type: 'text', nullable: true })
  purpose!: string;

  @Column({ type: 'jsonb', nullable: true })
  topics!: string[];

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ type: 'text', nullable: true })
  keyFindings!: string;

  @Column({ type: 'jsonb', nullable: true })
  dataSourcesDiscussed: Array<{
    sourceName: string;
    sourceType: string;
    location?: string;
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  documentsIdentified: Array<{
    description: string;
    location?: string;
    custodian?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  followUpActions: Array<{
    action: string;
    assignedTo?: string;
    dueDate?: Date;
    status: string;
  }>;

  @Column({ type: 'boolean', default: false })
  isRecorded!: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  recordingPath!: string;

  @Column({ type: 'boolean', default: false })
  isTranscribed!: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  transcriptPath!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  conductedBy!: string;

  @Column({ type: 'uuid' })
  createdBy!: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date;
}
