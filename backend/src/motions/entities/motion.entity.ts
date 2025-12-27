import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Case } from '@cases/entities/case.entity';

export enum MotionType {
  MOTION_TO_DISMISS = 'Motion to Dismiss',
  MOTION_TO_DISMISS_LOWER = 'motion_to_dismiss',
  MOTION_FOR_SUMMARY_JUDGMENT = 'Motion for Summary Judgment',
  MOTION_FOR_SUMMARY_JUDGMENT_LOWER = 'motion_for_summary_judgment',
  MOTION_TO_COMPEL = 'Motion to Compel',
  MOTION_TO_COMPEL_LOWER = 'motion_to_compel',
  MOTION_FOR_PROTECTIVE_ORDER = 'Motion for Protective Order',
  MOTION_FOR_PROTECTIVE_ORDER_LOWER = 'motion_for_protective_order',
  MOTION_IN_LIMINE = 'Motion in Limine',
  MOTION_IN_LIMINE_LOWER = 'motion_in_limine',
  MOTION_FOR_CONTINUANCE = 'Motion for Continuance',
  MOTION_FOR_CONTINUANCE_LOWER = 'motion_for_continuance',
  MOTION_TO_AMEND = 'Motion to Amend',
  MOTION_TO_AMEND_LOWER = 'motion_to_amend',
  MOTION_FOR_SANCTIONS = 'Motion for Sanctions',
  MOTION_FOR_DEFAULT_JUDGMENT = 'Motion for Default Judgment',
  MOTION_TO_STRIKE = 'Motion to Strike',
  MOTION_FOR_RECONSIDERATION = 'Motion for Reconsideration',
  MOTION_FOR_EXTENSION = 'motion_for_extension',
  EMERGENCY_MOTION = 'emergency_motion',
  OTHER = 'Other',
  OTHER_LOWER = 'other',
}

export enum MotionStatus {
  DRAFT = 'Draft',
  DRAFT_LOWER = 'draft',
  FILED = 'Filed',
  FILED_LOWER = 'filed',
  PENDING = 'Pending',
  PENDING_LOWER = 'pending',
  GRANTED = 'Granted',
  GRANTED_LOWER = 'granted',
  DENIED = 'Denied',
  DENIED_LOWER = 'denied',
  PARTIALLY_GRANTED = 'Partially Granted',
  PARTIALLY_GRANTED_LOWER = 'partially_granted',
  WITHDRAWN = 'Withdrawn',
  WITHDRAWN_LOWER = 'withdrawn',
  MOOT = 'Moot',
}

@Entity('motions')
@Index(['caseId'])
@Index(['status'])
@Index(['filingDate'])
export class Motion extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({
    type: 'enum',
    enum: MotionType,
  })
  type!: MotionType;

  @Column({
    type: 'enum',
    enum: MotionStatus,
    default: MotionStatus.DRAFT,
  })
  status!: MotionStatus;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'filed_by', type: 'varchar', length: 255, nullable: true })
  filedBy?: string;

  @Column({ name: 'filed_date', type: 'date', nullable: true })
  filedDate?: Date;

  @Column({ name: 'filing_date', type: 'date', nullable: true })
  filingDate!: Date;

  @Column({ name: 'hearing_date', type: 'date', nullable: true })
  hearingDate!: Date;

  @Column({ name: 'response_deadline', type: 'date', nullable: true })
  responseDeadline?: Date;

  @Column({ name: 'ruling_date', type: 'date', nullable: true })
  rulingDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  ruling?: Record<string, unknown>;

  @Column({ name: 'supporting_docs', type: 'jsonb', nullable: true })
  supportingDocs?: string[];

  @Column({ type: 'jsonb', nullable: true })
  attachments?: string[];

  @Column({ name: 'opposing_party_response', type: 'jsonb', nullable: true })
  opposingPartyResponse?: Record<string, unknown>;

  @Column({ name: 'decision_date', type: 'date', nullable: true })
  decisionDate!: Date;

  @Column({ type: 'text', nullable: true })
  relief?: string;

  @Column({ type: 'text', nullable: true })
  decision?: string;

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId?: string;

  @Column({ name: 'assigned_attorney_id', type: 'uuid', nullable: true })
  assignedAttorneyId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'related_documents', type: 'jsonb', nullable: true })
  relatedDocuments?: Array<{
    id: string;
    name: string;
    type: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
