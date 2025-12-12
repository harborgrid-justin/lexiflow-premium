import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';
import { User } from './user.entity';

@Entity('pleading_documents')
@Index(['caseId'])
@Index(['type'])
@Index(['status'])
@Index(['filingDate'])
export class PleadingDocument extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({
    type: 'enum',
    enum: [
      'complaint',
      'answer',
      'counterclaim',
      'cross_claim',
      'reply',
      'petition',
      'response',
      'demurrer',
      'motion',
      'brief',
      'memorandum',
      'declaration',
      'affidavit',
      'other',
    ],
  })
  type: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'review', 'filed', 'served', 'archived'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  filingDate: Date;

  @Column({ type: 'date', nullable: true })
  servedDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  servedOn: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  courtFileNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentPath: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  docketNumber: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'integer', nullable: true })
  pageCount: number;

  @Column({ type: 'jsonb', nullable: true })
  exhibits: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  citations: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  legalArgument: string;

  @Column({ type: 'text', nullable: true })
  requestedRelief: string;

  @Column({ type: 'text', nullable: true })
  factsAlleged: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedPleadings: string[];

  @Column({ type: 'boolean', default: false })
  isAmended: boolean;

  @Column({ type: 'uuid', nullable: true })
  originalPleadingId: string;

  @Column({ type: 'integer', default: 1 })
  amendmentNumber: number;

  @Column({ type: 'text', nullable: true })
  proofOfService: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}
