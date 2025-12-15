import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from '../cases/entities/case.entity';

@Entity('witnesses')
@Index(['caseId'])
@Index(['witnessType'])
@Index(['status'])
export class Witness extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: [
      'fact_witness',
      'expert_witness',
      'character_witness',
      'rebuttal_witness',
      'impeachment_witness',
    ],
  })
  witnessType: string;

  @Column({
    type: 'enum',
    enum: [
      'identified',
      'contacted',
      'interviewed',
      'subpoenaed',
      'deposed',
      'testifying',
      'testified',
      'unavailable',
      'withdrawn',
    ],
    default: 'identified',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  alternatePhone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  occupation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  employer: string;

  @Column({ type: 'text', nullable: true })
  relevanceToCase: string;

  @Column({ type: 'text', nullable: true })
  expectedTestimony: string;

  @Column({ type: 'text', nullable: true })
  keyFacts: string;

  @Column({ type: 'jsonb', nullable: true })
  topicsOfTestimony: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  retainedBy: string;

  @Column({ type: 'boolean', default: false })
  isExpert: boolean;

  @Column({ type: 'text', nullable: true })
  expertQualifications: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  expertiseArea: string;

  @Column({ type: 'text', nullable: true })
  expertOpinion: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cvPath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  expertReportPath: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  expertFee: number;

  @Column({ type: 'date', nullable: true })
  depositionDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  depositionTranscriptPath: string;

  @Column({ type: 'date', nullable: true })
  interviewDate: Date;

  @Column({ type: 'uuid', nullable: true })
  interviewedBy: string;

  @Column({ type: 'text', nullable: true })
  interviewSummary: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  interviewNotesPath: string;

  @Column({ type: 'boolean', default: false })
  isSubpoenaed: boolean;

  @Column({ type: 'date', nullable: true })
  subpoenaDate: Date;

  @Column({ type: 'date', nullable: true })
  subpoenaServedDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subpoenaServedBy: string;

  @Column({ type: 'date', nullable: true })
  scheduledTestimonyDate: Date;

  @Column({ type: 'date', nullable: true })
  actualTestimonyDate: Date;

  @Column({ type: 'text', nullable: true })
  testimonyOutline: string;

  @Column({ type: 'jsonb', nullable: true })
  exhibits: string[];

  @Column({ type: 'boolean', default: false })
  isHostile: boolean;

  @Column({ type: 'boolean', default: false })
  needsProtection: boolean;

  @Column({ type: 'text', nullable: true })
  protectionDetails: string;

  @Column({ type: 'text', nullable: true })
  credibilityIssues: string;

  @Column({ type: 'text', nullable: true })
  biasOrPrejudice: string;

  @Column({ type: 'text', nullable: true })
  priorStatements: string;

  @Column({ type: 'jsonb', nullable: true })
  contactHistory: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  preparationNotes: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
