import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Case } from '@cases/entities/case.entity';

export enum WitnessType {
  FACT_WITNESS = 'fact_witness',
  EXPERT_WITNESS = 'expert_witness',
  CHARACTER_WITNESS = 'character_witness',
  REBUTTAL_WITNESS = 'rebuttal_witness',
  IMPEACHMENT_WITNESS = 'impeachment_witness',
}

export enum WitnessStatus {
  IDENTIFIED = 'identified',
  CONTACTED = 'contacted',
  INTERVIEWED = 'interviewed',
  SUBPOENAED = 'subpoenaed',
  DEPOSED = 'deposed',
  TESTIFYING = 'testifying',
  TESTIFIED = 'testified',
  UNAVAILABLE = 'unavailable',
  WITHDRAWN = 'withdrawn',
}

@Entity('witnesses')
@Index(['caseId'])
@Index(['witnessType'])
@Index(['status'])
export class Witness extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    name: 'witness_type',
    type: 'enum',
    enum: WitnessType,
  })
  witnessType!: WitnessType;

  @Column({
    type: 'enum',
    enum: WitnessStatus,
    default: WitnessStatus.IDENTIFIED,
  })
  status!: WitnessStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string;

  @Column({ name: 'alternate_phone', type: 'varchar', length: 50, nullable: true })
  alternatePhone!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  occupation!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  employer!: string;

  @Column({ name: 'relevance_to_case', type: 'text', nullable: true })
  relevanceToCase!: string;

  @Column({ name: 'expected_testimony', type: 'text', nullable: true })
  expectedTestimony!: string;

  @Column({ name: 'key_facts', type: 'text', nullable: true })
  keyFacts!: string;

  @Column({ name: 'topics_of_testimony', type: 'jsonb', nullable: true })
  topicsOfTestimony!: string[];

  @Column({ name: 'retained_by', type: 'varchar', length: 255, nullable: true })
  retainedBy!: string;

  @Column({ name: 'is_expert', type: 'boolean', default: false })
  isExpert!: boolean;

  @Column({ name: 'expert_qualifications', type: 'text', nullable: true })
  expertQualifications!: string;

  @Column({ name: 'expertise_area', type: 'varchar', length: 500, nullable: true })
  expertiseArea!: string;

  @Column({ name: 'expert_opinion', type: 'text', nullable: true })
  expertOpinion!: string;

  @Column({ name: 'cv_path', type: 'varchar', length: 500, nullable: true })
  cvPath!: string;

  @Column({ name: 'expert_report_path', type: 'varchar', length: 500, nullable: true })
  expertReportPath!: string;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate!: number;
}
