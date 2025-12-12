import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { EvidenceItem } from './evidence-item.entity';

@Entity('chain_of_custody_events')
@Index(['evidenceId'])
@Index(['eventDate'])
@Index(['action'])
export class ChainOfCustodyEvent extends BaseEntity {
  @Column({ type: 'uuid' })
  evidenceId: string;

  @Column({
    type: 'enum',
    enum: [
      'collected',
      'transferred',
      'received',
      'analyzed',
      'stored',
      'accessed',
      'photographed',
      'tested',
      'presented',
      'returned',
      'sealed',
      'unsealed',
      'disposed',
      'other',
    ],
  })
  action: string;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column({ type: 'varchar', length: 255 })
  handler: string;

  @Column({ type: 'uuid', nullable: true })
  handlerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transferredFrom: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transferredTo: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  witness: string;

  @Column({ type: 'uuid', nullable: true })
  witnessId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentPath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photographPath: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  conditionAtEvent: string;

  @Column({ type: 'text', nullable: true })
  conditionNotes: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sealNumber: string;

  @Column({ type: 'boolean', default: false })
  sealIntact: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  containerNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  storageFacility: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  storageUnit: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorizedBy: string;

  @Column({ type: 'uuid', nullable: true })
  authorizedById: string;

  @Column({ type: 'text', nullable: true })
  securityMeasures: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => EvidenceItem, (evidence) => evidence.custodyEvents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evidenceId' })
  evidenceItem: EvidenceItem;
}
