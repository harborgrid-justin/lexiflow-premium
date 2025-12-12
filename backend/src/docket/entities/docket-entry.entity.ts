import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum DocketEntryType {
  FILING = 'Filing',
  ORDER = 'Order',
  NOTICE = 'Notice',
  MOTION = 'Motion',
  HEARING = 'Hearing',
  JUDGMENT = 'Judgment',
  MINUTE_ENTRY = 'Minute Entry',
  TRANSCRIPT = 'Transcript',
  EXHIBIT = 'Exhibit',
  CORRESPONDENCE = 'Correspondence',
  OTHER = 'Other',
}

@Entity('docket_entries')
export class DocketEntry extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'int' })
  sequenceNumber: number;

  @Column({ type: 'date' })
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
