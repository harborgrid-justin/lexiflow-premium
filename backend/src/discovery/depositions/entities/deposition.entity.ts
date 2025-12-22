import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Case } from '../../../cases/entities/case.entity';

export enum DepositionMethod {
  ORAL = 'ORAL',
  WRITTEN = 'WRITTEN',
  VIDEO = 'VIDEO',
  TELEPHONIC = 'TELEPHONIC',
}

export enum DepositionStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
  TRANSCRIPTION_PENDING = 'TRANSCRIPTION_PENDING',
  TRANSCRIPTION_COMPLETE = 'TRANSCRIPTION_COMPLETE',
}

export enum DeponentType {
  FACT_WITNESS = 'fact_witness',
  EXPERT_WITNESS = 'expert_witness',
  PARTY = 'party',
  CORPORATE_REPRESENTATIVE = 'corporate_representative',
}

@Entity('depositions')
@Index(['caseId'])
@Index(['witnessId'])
@Index(['scheduledDate'])
@Index(['status'])
export class Deposition extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'witness_id', type: 'uuid', nullable: true })
  witnessId!: string;

  @Column({ name: 'deponent_name', type: 'varchar', length: 300 })
  deponentName!: string;

  @Column({ name: 'deponent_title', type: 'varchar', length: 100, nullable: true })
  deponentTitle!: string;

  @Column({ name: 'deponent_organization', type: 'varchar', length: 200, nullable: true })
  deponentOrganization!: string;

  @Column({
    name: 'method',
    type: 'enum',
    enum: DepositionMethod,
    default: DepositionMethod.ORAL,
  })
  method!: DepositionMethod;

  @Column({
    name: 'deponent_type',
    type: 'enum',
    enum: DeponentType,
    nullable: true
  })
  deponentType!: DeponentType;

  @Column({
    type: 'enum',
    enum: DepositionStatus,
    default: DepositionStatus.SCHEDULED,
  })
  status!: DepositionStatus;

  @Column({ name: 'scheduled_date', type: 'timestamp', nullable: true })
  scheduledDate!: Date;

  @Column({ name: 'actual_start_time', type: 'timestamp', nullable: true })
  actualStartTime!: Date;

  @Column({ name: 'actual_end_time', type: 'timestamp', nullable: true })
  actualEndTime!: Date;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location!: string;

  @Column({ name: 'court_reporter', type: 'varchar', length: 300, nullable: true })
  courtReporter!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  videographer!: string;

  @Column({ type: 'jsonb', nullable: true })
  attendees: Array<{
    name: string;
    role: string;
    organization?: string;
  }>;

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ name: 'conducted_by', type: 'varchar', length: 255, nullable: true })
  conductedBy!: string;

  @Column({ name: 'defended_by', type: 'varchar', length: 255, nullable: true })
  defendedBy!: string;

  @Column({ name: 'is_video_recorded', type: 'boolean', default: false })
  isVideoRecorded!: boolean;

  @Column({ name: 'is_remote', type: 'boolean', default: false })
  isRemote!: boolean;

  @Column({ name: 'remote_link', type: 'varchar', length: 500, nullable: true })
  remoteLink!: string;

  @Column({ name: 'deposition_notice', type: 'text', nullable: true })
  depositionNotice!: string;

  @Column({ name: 'subject_matter', type: 'text', nullable: true })
  subjectMatter!: string;

  @Column({ name: 'topics_discussed', type: 'jsonb', nullable: true })
  topicsDiscussed!: string[];

  @Column({ name: 'exhibits_used', type: 'jsonb', nullable: true })
  exhibitsUsed: Record<string, any>[];

  @Column({ name: 'transcript_path', type: 'varchar', length: 500, nullable: true })
  transcriptPath!: string;

  @Column({ name: 'transcript_received_date', type: 'date', nullable: true })
  transcriptReceivedDate!: Date;

  @Column({ name: 'video_path', type: 'varchar', length: 500, nullable: true })
  videoPath!: string;

  @Column({ name: 'estimated_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost!: number;
}
