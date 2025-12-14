import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../entities/base.entity';
import { Production } from './production.entity';

@Entity('evidence_items')
export class EvidenceItem extends BaseEntity {
  @Column()
  batesNumber: string;

  @ManyToOne(() => Production, (production) => production.evidenceItems)
  @JoinColumn({ name: 'productionId' })
  production: Production;

  @Column()
  productionId: string;
}
