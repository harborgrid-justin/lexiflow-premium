import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum MotionType {
  MOTION_TO_DISMISS = 'Motion to Dismiss',
  MOTION_FOR_SUMMARY_JUDGMENT = 'Motion for Summary Judgment',
  MOTION_TO_COMPEL = 'Motion to Compel',
  MOTION_FOR_PROTECTIVE_ORDER = 'Motion for Protective Order',
  MOTION_IN_LIMINE = 'Motion in Limine',
  MOTION_FOR_CONTINUANCE = 'Motion for Continuance',
  MOTION_TO_AMEND = 'Motion to Amend',
  MOTION_FOR_SANCTIONS = 'Motion for Sanctions',
  MOTION_FOR_DEFAULT_JUDGMENT = 'Motion for Default Judgment',
  MOTION_TO_STRIKE = 'Motion to Strike',
  MOTION_FOR_RECONSIDERATION = 'Motion for Reconsideration',
  OTHER = 'Other',
}

export enum MotionStatus {
  DRAFT = 'Draft',
  FILED = 'Filed',
  PENDING = 'Pending',
  GRANTED = 'Granted',
  DENIED = 'Denied',
  PARTIALLY_GRANTED = 'Partially Granted',
  WITHDRAWN = 'Withdrawn',
  MOOT = 'Moot',
}

@Entity('motions')
export class Motion extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: MotionType,
  })
  type: MotionType;

  @Column({
    type: 'enum',
    enum: MotionStatus,
    default: MotionStatus.DRAFT,
  })
  status: MotionStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filedBy?: string;

  @Column({ type: 'date', nullable: true })
  filedDate?: Date;

  @Column({ type: 'date', nullable: true })
  filingDate: Date;

  @Column({ type: 'date', nullable: true })
  hearingDate: Date;

  @Column({ type: 'date', nullable: true })
  responseDeadline?: Date;

  @Column({ type: 'date', nullable: true })
  rulingDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  ruling?: any;

  @Column({ type: 'jsonb', nullable: true })
  supportingDocs?: string[];

  @Column({ type: 'jsonb', nullable: true })
  attachments?: string[];

  @Column({ type: 'jsonb', nullable: true })
  opposingPartyResponse?: any;

  @Column({ type: 'date', nullable: true })
  decisionDate: Date;

  @Column({ type: 'text', nullable: true })
  relief?: string;

  @Column({ type: 'text', nullable: true })
  decision?: string;

  @Column({ type: 'uuid', nullable: true })
  documentId?: string;

  @Column({ type: 'uuid', nullable: true })
  assignedAttorneyId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedDocuments?: Array<{
    id: string;
    name: string;
    type: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
