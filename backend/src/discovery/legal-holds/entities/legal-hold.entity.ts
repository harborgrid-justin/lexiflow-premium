import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Case } from '../../../cases/entities/case.entity';

export enum LegalHoldStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  RELEASED = 'RELEASED',
  EXPIRED = 'EXPIRED',
}

@Entity('legal_holds')
@Index(['caseId'])
@Index(['status'])
export class LegalHold extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'hold_name', type: 'varchar', length: 300 })
  holdName!: string;

  @Column({ name: 'hold_number', type: 'varchar', length: 100, nullable: true })
  holdNumber!: string;

  @Column({
    type: 'enum',
    enum: LegalHoldStatus,
    default: LegalHoldStatus.DRAFT,
  })
  status!: LegalHoldStatus;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'hold_instructions', type: 'text' })
  holdInstructions!: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: Date;

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate!: Date;

  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate!: Date;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate!: Date;

  @Column({ type: 'jsonb' })
  custodians!: Array<{
    custodianId: string;
    custodianName: string;
    email: string;
    notifiedDate?: Date;
    acknowledgedDate?: Date;
    status: string;
  }>;

  @Column({ name: 'total_custodians', type: 'int', default: 0 })
  totalCustodians!: number;

  @Column({ name: 'acknowledged_count', type: 'int', default: 0 })
  acknowledgedCount!: number;

  @Column({ name: 'pending_count', type: 'int', default: 0 })
  pendingCount!: number;

  @Column({ name: 'data_sources_to_preserve', type: 'jsonb', nullable: true })
  dataSourcesToPreserve!: Array<{
    sourceType: string;
    description: string;
    location?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  notifications!: Array<{
    date: Date;
    type: string;
    recipients: string[];
    subject: string;
    status: string;
  }>;

  @Column({ name: 'reminder_interval_days', type: 'int', default: 0 })
  reminderIntervalDays!: number;

  @Column({ name: 'scope_description', type: 'text', nullable: true })
  scopeDescription!: string;

  @Column({ name: 'data_sources', type: 'jsonb', nullable: true })
  dataSources!: string[];

  @Column({ name: 'document_types', type: 'jsonb', nullable: true })
  documentTypes!: string[];

  @Column({ name: 'date_range_start', type: 'date', nullable: true })
  dateRangeStart!: Date;

  @Column({ name: 'date_range_end', type: 'date', nullable: true })
  dateRangeEnd!: Date;

  @Column({ name: 'search_terms', type: 'jsonb', nullable: true })
  searchTerms!: string[];

  @Column({ name: 'issued_by', type: 'uuid', nullable: true })
  issuedBy!: string;

  @Column({ name: 'released_by', type: 'uuid', nullable: true })
  releasedBy!: string;

  @Column({ name: 'release_reason', type: 'text', nullable: true })
  releaseReason!: string;

  @Column({ name: 'release_notes', type: 'text', nullable: true })
  releaseNotes!: string;
}
