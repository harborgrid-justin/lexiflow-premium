import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum PleadingType {
  COMPLAINT = 'complaint',
  ANSWER = 'answer',
  MOTION = 'motion',
  BRIEF = 'brief',
  MEMORANDUM = 'memorandum',
  REPLY = 'reply',
  OPPOSITION = 'opposition',
  PETITION = 'petition',
  RESPONSE = 'response',
}

export enum PleadingStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  FILED = 'filed',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('pleadings')
@Index(['caseId', 'type'])
@Index(['status'])
@Index(['filedDate'])
export class Pleading extends BaseEntity {
  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: PleadingType,
  })
  type!: PleadingType;

  @Column({ name: 'case_id', type: 'uuid' })
  @Index()
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string;

  @Column({
    type: 'enum',
    enum: PleadingStatus,
    default: PleadingStatus.DRAFT,
  })
  status!: PleadingStatus;

  @Column({ name: 'filed_date', type: 'timestamp', nullable: true })
  filedDate!: Date;

  @Column({ name: 'filed_by', nullable: true })
  filedBy!: string;

  @Column({ name: 'court_name', nullable: true })
  courtName!: string;

  @Column({ name: 'case_number', nullable: true })
  caseNumber!: string;

  @Column({ name: 'docket_number', nullable: true })
  docketNumber!: string;

  @Column({ name: 'hearing_date', type: 'timestamp', nullable: true })
  hearingDate!: Date;

  @Column({ name: 'served_date', type: 'timestamp', nullable: true })
  servedDate!: Date;

  @Column({ name: 'service_method', nullable: true })
  serviceMethod!: string;

  @Column({ nullable: true })
  judge!: string;

  @Column({ type: 'simple-array', nullable: true })
  parties!: string[];

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields!: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags!: string[];

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string;
}
