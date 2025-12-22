import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { EvidenceItem } from './evidence-item.entity';

export enum ChainOfCustodyAction {
  COLLECTED = 'collected',
  TRANSFERRED = 'transferred',
  RECEIVED = 'received',
  ANALYZED = 'analyzed',
  STORED = 'stored',
  ACCESSED = 'accessed',
  PHOTOGRAPHED = 'photographed',
  TESTED = 'tested',
  PRESENTED = 'presented',
  RETURNED = 'returned',
  SEALED = 'sealed',
  UNSEALED = 'unsealed',
  DISPOSED = 'disposed',
  OTHER = 'other',
}

@Entity('chain_of_custody_events')
@Index(['evidenceId'])
@Index(['eventDate'])
@Index(['action'])
export class ChainOfCustodyEvent extends BaseEntity {
  @Column({ name: 'evidence_id', type: 'uuid' })
  evidenceId!: string;

  @ManyToOne(() => EvidenceItem, evidence => evidence.chainOfCustodyEvents)
  @JoinColumn({ name: 'evidence_id' })
  evidenceItem!: EvidenceItem;

  @Column({
    type: 'enum',
    enum: ChainOfCustodyAction,
  })
  action!: ChainOfCustodyAction;

  @Column({ name: 'event_date', type: 'timestamp' })
  eventDate!: Date;

  @Column({ type: 'varchar', length: 255 })
  handler!: string;

  @Column({ name: 'handler_id', type: 'uuid', nullable: true })
  handlerId!: string;

  @Column({ name: 'transferred_from', type: 'varchar', length: 255, nullable: true })
  transferredFrom!: string;

  @Column({ name: 'transferred_to', type: 'varchar', length: 255, nullable: true })
  transferredTo!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
