import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';

@Entity('motions')
@Index(['caseId'])
@Index(['status'])
@Index(['filingDate'])
@Index(['dueDate'])
export class Motion extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({
    type: 'enum',
    enum: [
      'motion_to_dismiss',
      'motion_for_summary_judgment',
      'motion_in_limine',
      'motion_to_compel',
      'motion_for_protective_order',
      'motion_to_amend',
      'motion_for_extension',
      'motion_for_continuance',
      'emergency_motion',
      'other',
    ],
  })
  type: string;

  @Column({ type: 'date' })
  filingDate: Date;

  @Column({
    type: 'enum',
    enum: [
      'draft',
      'filed',
      'pending',
      'granted',
      'denied',
      'partially_granted',
      'withdrawn',
    ],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  hearingDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  opposedBy: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  legalBasis: string;

  @Column({ type: 'text', nullable: true })
  requestedRelief: string;

  @Column({ type: 'text', nullable: true })
  courtDecision: string;

  @Column({ type: 'date', nullable: true })
  decisionDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentPath: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedDocuments: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.motions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;
}
