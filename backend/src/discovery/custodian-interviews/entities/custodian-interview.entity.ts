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

  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'custodian_id', type: 'uuid' })
  custodianId!: string;

  @Column({ name: 'custodian_name', type: 'varchar', length: 300 })
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

  @Column({ name: 'scheduled_date', type: 'timestamp' })
  scheduledDate!: Date;

  @Column({ name: 'actual_start_time', type: 'timestamp', nullable: true })
  actualStartTime!: Date;

  @Column({ name: 'actual_end_time', type: 'timestamp', nullable: true })
  actualEndTime!: Date;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location!: string;

  @Column({ type: 'jsonb', nullable: true })
  interviewers!: Array<{
    userId: string;
    name: string;
    role: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  attendees!: Array<{
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

  @Column({ name: 'key_findings', type: 'text', nullable: true })
  keyFindings!: string;

  @Column({ name: 'data_sources_discussed', type: 'jsonb', nullable: true })
  dataSourcesDiscussed!: Array<{
    sourceName: string;
    sourceType: string;
    location?: string;
    notes?: string;
  }>;

  @Column({ name: 'documents_identified', type: 'jsonb', nullable: true })
  documentsIdentified!: Array<{
    description: string;
    location?: string;
    custodian?: string;
  }>;

  @Column({ name: 'follow_up_actions', type: 'jsonb', nullable: true })
  followUpActions!: Array<{
    action: string;
    assignedTo?: string;
    dueDate?: Date;
    status: string;
  }>;

  @Column({ name: 'is_recorded', type: 'boolean', default: false })
  isRecorded!: boolean;

  @Column({ name: 'recording_path', type: 'varchar', length: 500, nullable: true })
  recordingPath!: string;

  @Column({ name: 'is_transcribed', type: 'boolean', default: false })
  isTranscribed!: boolean;

  @Column({ name: 'transcript_path', type: 'varchar', length: 500, nullable: true })
  transcriptPath!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @Column({ name: 'conducted_by', type: 'uuid', nullable: true })
  conductedBy!: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date;
}
