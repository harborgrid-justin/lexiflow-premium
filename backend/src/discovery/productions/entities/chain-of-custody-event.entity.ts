import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../entities/base.entity';
import { EvidenceItem } from './evidence-item.entity';

@Entity('chain_of_custody_events')
export class ChainOfCustodyEvent extends BaseEntity {
  @ManyToOne(() => EvidenceItem)
  @JoinColumn({ name: 'evidenceItemId' })
  evidenceItem: EvidenceItem;

  @Column()
  evidenceItemId: string;

  @Column()
  event: string;

  @Column()
  date: Date;

  @Column()
  userId: string;
}
