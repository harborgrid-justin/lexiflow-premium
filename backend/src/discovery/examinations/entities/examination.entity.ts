import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExaminationType {
  INDEPENDENT_MEDICAL = 'INDEPENDENT_MEDICAL',
  MENTAL = 'MENTAL',
  PHYSICAL = 'PHYSICAL',
  PROPERTY_INSPECTION = 'PROPERTY_INSPECTION',
  DOCUMENT_INSPECTION = 'DOCUMENT_INSPECTION',
  FORENSIC = 'FORENSIC',
  OTHER = 'OTHER',
}

export enum ExaminationStatus {
  REQUESTED = 'REQUESTED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  REPORT_PENDING = 'REPORT_PENDING',
  REPORT_RECEIVED = 'REPORT_RECEIVED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}

@Entity('examinations')
export class Examination {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'case_id' })
  caseId!: string;

  @Column({ type: 'varchar', length: 300, name: 'examination_title' })
  examinationTitle!: string;

  @Column({
    type: 'enum',
    enum: ExaminationType,
  })
  type!: ExaminationType;

  @Column({
    type: 'enum',
    enum: ExaminationStatus,
    default: ExaminationStatus.REQUESTED,
  })
  status!: ExaminationStatus;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 300 })
  examinee!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  examiner!: string;

  @Column({ type: 'varchar', length: 300, nullable: true, name: 'examiner_organization' })
  examinerOrganization!: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'examiner_specialty' })
  examinerSpecialty!: string;

  @Column({ type: 'date', nullable: true, name: 'request_date' })
  requestDate!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'scheduled_date' })
  scheduledDate!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_date' })
  completedDate!: Date;

  @Column({ type: 'int', nullable: true, name: 'duration_minutes' })
  durationMinutes!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location!: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'requesting_party' })
  requestingParty!: string;

  @Column({ type: 'text', nullable: true })
  purpose!: string;

  @Column({ type: 'text', nullable: true })
  scope!: string;

  @Column({ type: 'jsonb', nullable: true })
  conditions!: string[];

  @Column({ type: 'text', nullable: true })
  findings!: string;

  @Column({ type: 'text', nullable: true })
  conclusions!: string;

  @Column({ type: 'boolean', default: false, name: 'is_report_received' })
  isReportReceived!: boolean;

  @Column({ type: 'date', nullable: true, name: 'report_received_date' })
  reportReceivedDate!: Date;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'report_path' })
  reportPath!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'estimated_cost' })
  estimatedCost!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'actual_cost' })
  actualCost!: number;

  @Column({ type: 'text', nullable: true, name: 'dispute_reason' })
  disputeReason!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @Column({ type: 'uuid', nullable: true, name: 'assigned_attorney' })
  assignedAttorney!: string;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy!: string;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt!: Date;
}
