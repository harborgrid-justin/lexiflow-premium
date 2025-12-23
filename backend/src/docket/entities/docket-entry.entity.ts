import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum DocketEntryType {
  FILING = 'Filing',
  FILING_LOWER = 'filing',
  ORDER = 'Order',
  ORDER_LOWER = 'order',
  NOTICE = 'Notice',
  NOTICE_LOWER = 'notice',
  MOTION = 'Motion',
  MOTION_LOWER = 'motion',
  HEARING = 'Hearing',
  HEARING_LOWER = 'hearing',
  JUDGMENT = 'Judgment',
  JUDGMENT_LOWER = 'judgment',
  MINUTE_ENTRY = 'Minute Entry',
  MINUTE_ENTRY_LOWER = 'minute_entry',
  TRANSCRIPT = 'Transcript',
  EXHIBIT = 'Exhibit',
  CORRESPONDENCE = 'Correspondence',
  CORRESPONDENCE_LOWER = 'correspondence',
  PLEADING = 'pleading',
  DISCOVERY = 'discovery',
  OTHER = 'Other',
  OTHER_LOWER = 'other',
}

@Entity('docket_entries')
@Index(['caseId'])
@Index(['sequenceNumber'])
@Index(['dateFiled'])
@Index(['type'])
export class DocketEntry extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'sequence_number', type: 'int', nullable: true })
  sequenceNumber!: number;

  @Column({ name: 'docket_number', type: 'varchar', length: 100, nullable: true })
  docketNumber!: string;

  @Column({ name: 'ecf_document_number', type: 'varchar', length: 50, nullable: true })
  ecfDocumentNumber?: string;

  @Column({ name: 'date_filed', type: 'date', nullable: true })
  dateFiled!: Date;

  @Column({ name: 'entry_date', type: 'date', nullable: true })
  entryDate!: Date;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: DocketEntryType,
    default: DocketEntryType.FILING,
  })
  type!: DocketEntryType;

  @Column({ type: 'text', nullable: true })
  text!: string;

  @Column({ name: 'filed_by', type: 'varchar', length: 255, nullable: true })
  filedBy!: string;

  @Column({ name: 'document_title', type: 'varchar', length: 255, nullable: true })
  documentTitle!: string;

  @Column({ name: 'document_url', type: 'varchar', length: 2048, nullable: true })
  documentUrl!: string;

  @Column({ name: 'ecf_url', type: 'varchar', length: 2048, nullable: true })
  ecfUrl?: string;

  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments?: { number: number; url: string; description?: string }[];

  @Column({ name: 'filing_fee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  filingFee?: number;

  @Column({ name: 'fee_receipt_number', type: 'varchar', length: 100, nullable: true })
  feeReceiptNumber?: string;

  @Column({ name: 'judge_name', type: 'varchar', length: 255, nullable: true })
  judgeName?: string;

  @Column({ name: 'signed_by', type: 'varchar', length: 255, nullable: true })
  signedBy?: string;

  @Column({ name: 'docket_clerk_initials', type: 'varchar', length: 10, nullable: true })
  docketClerkInitials?: string;

  @Column({ name: 'is_restricted', type: 'boolean', default: false })
  isRestricted?: boolean;

  @Column({ name: 'related_docket_numbers', type: 'simple-array', nullable: true })
  relatedDocketNumbers?: string[];

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string;
}
