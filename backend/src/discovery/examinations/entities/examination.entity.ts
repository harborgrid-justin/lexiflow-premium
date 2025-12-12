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
  id: string;

  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 300 })
  examinationTitle: string;

  @Column({
    type: 'enum',
    enum: ExaminationType,
  })
  type: ExaminationType;

  @Column({
    type: 'enum',
    enum: ExaminationStatus,
    default: ExaminationStatus.REQUESTED,
  })
  status: ExaminationStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 300 })
  examinee: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  examiner: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  examinerOrganization: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  examinerSpecialty: string;

  @Column({ type: 'date', nullable: true })
  requestDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  requestingParty: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ type: 'jsonb', nullable: true })
  conditions: string[];

  @Column({ type: 'text', nullable: true })
  findings: string;

  @Column({ type: 'text', nullable: true })
  conclusions: string;

  @Column({ type: 'boolean', default: false })
  isReportReceived: boolean;

  @Column({ type: 'date', nullable: true })
  reportReceivedDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  reportPath: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @Column({ type: 'text', nullable: true })
  disputeReason: string;

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
