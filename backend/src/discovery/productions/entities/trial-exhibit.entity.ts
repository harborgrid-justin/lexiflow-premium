import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../entities/base.entity';
import { EvidenceItem } from './evidence-item.entity';

@Entity('trial_exhibits')
export class TrialExhibit extends BaseEntity {
  @ManyToOne(() => EvidenceItem)
  @JoinColumn({ name: 'evidenceItemId' })
  evidenceItem: EvidenceItem;

  @Column()
  evidenceItemId: string;

  @Column()
  exhibitNumber: string;

  @Column({ nullable: true })
  description?: string;
}
