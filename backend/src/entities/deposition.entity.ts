import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';
import { Witness } from './witness.entity';

@Entity('depositions')
@Index(['caseId'])
@Index(['witnessId'])
@Index(['depositionDate'])
@Index(['status'])
export class Deposition extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  witnessId: string;

  @Column({ type: 'varchar', length: 255 })
  deponentName: string;

  @Column({ type: 'date' })
  depositionDate: Date;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'varchar', length: 500 })
  location: string;

  @Column({
    type: 'enum',
    enum: [
      'scheduled',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'postponed',
    ],
    default: 'scheduled',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['fact_witness', 'expert_witness', 'party', 'corporate_representative'],
  })
  deponentType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  conductedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  defendedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  courtReporter: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  videographer: string;

  @Column({ type: 'boolean', default: false })
  isVideoRecorded: boolean;

  @Column({ type: 'boolean', default: false })
  isRemote: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remoteLink: string;

  @Column({ type: 'text', nullable: true })
  depositionNotice: string;

  @Column({ type: 'text', nullable: true })
  subjectMatter: string;

  @Column({ type: 'jsonb', nullable: true })
  topicsDiscussed: string[];

  @Column({ type: 'jsonb', nullable: true })
  exhibitsUsed: Record<string, any>[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  transcriptPath: string;

  @Column({ type: 'date', nullable: true })
  transcriptReceivedDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoPath: string;

  @Column({ type: 'integer', nullable: true })
  durationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  keyTestimony: string;

  @Column({ type: 'jsonb', nullable: true })
  attendees: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.depositions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @ManyToOne(() => Witness, { nullable: true })
  @JoinColumn({ name: 'witnessId' })
  witness: Witness;
}
