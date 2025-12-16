import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
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
export class DocketEntry extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'int', nullable: true })
  sequenceNumber: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  docketNumber: string;

  @Column({ type: 'date', nullable: true })
  dateFiled: Date;

  @Column({ type: 'date', nullable: true })
  entryDate: Date;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({
    type: 'enum',
    enum: DocketEntryType,
    default: DocketEntryType.FILING,
  })
  type: DocketEntryType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filedBy?: string;

  @Column({ type: 'text', nullable: true })
  text?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  documentTitle: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  documentUrl: string;

  @Column({ type: 'uuid', nullable: true })
  documentId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pacerDocketNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pacerDocumentNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  pacerLastSyncAt?: Date;

  @Column({ type: 'boolean', default: false })
  isSealed: boolean;

  @Column({ type: 'boolean', default: false })
  isRestricted: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: Array<{
    id: string;
    name: string;
    documentNumber?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
