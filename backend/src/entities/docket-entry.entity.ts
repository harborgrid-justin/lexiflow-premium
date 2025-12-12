import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';

@Entity('docket_entries')
@Index(['caseId'])
@Index(['entryNumber'])
@Index(['date'])
@Index(['type'])
export class DocketEntry extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'integer' })
  entryNumber: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: [
      'filing',
      'order',
      'hearing',
      'motion',
      'notice',
      'judgment',
      'pleading',
      'discovery',
      'correspondence',
      'minute_entry',
      'other',
    ],
  })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  documentTitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentPath: string;

  @Column({ type: 'integer', nullable: true })
  pageCount: number;

  @Column({ type: 'boolean', default: false })
  isSealed: boolean;

  @Column({ type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  docketText: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedEntries: string[];

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.docketEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;
}
