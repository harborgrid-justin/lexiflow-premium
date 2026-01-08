import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CitationLink } from './citation-link.entity';

export enum CaseLawJurisdiction {
  FEDERAL = 'Federal',
  STATE = 'State',
  SUPREME_COURT = 'Supreme Court',
  CIRCUIT_COURT = 'Circuit Court',
  DISTRICT_COURT = 'District Court',
  STATE_SUPREME = 'State Supreme Court',
  STATE_APPELLATE = 'State Appellate Court',
  STATE_TRIAL = 'State Trial Court',
}

export enum CaseLawCourt {
  US_SUPREME_COURT = 'U.S. Supreme Court',
  FIRST_CIRCUIT = '1st Circuit',
  SECOND_CIRCUIT = '2nd Circuit',
  THIRD_CIRCUIT = '3rd Circuit',
  FOURTH_CIRCUIT = '4th Circuit',
  FIFTH_CIRCUIT = '5th Circuit',
  SIXTH_CIRCUIT = '6th Circuit',
  SEVENTH_CIRCUIT = '7th Circuit',
  EIGHTH_CIRCUIT = '8th Circuit',
  NINTH_CIRCUIT = '9th Circuit',
  TENTH_CIRCUIT = '10th Circuit',
  ELEVENTH_CIRCUIT = '11th Circuit',
  DC_CIRCUIT = 'D.C. Circuit',
  FEDERAL_CIRCUIT = 'Federal Circuit',
}

@Entity('case_law')
@Index(['citation'])
@Index(['court'])
@Index(['jurisdiction'])
@Index(['decisionDate'])
@Index(['isBinding'])
@Index(['keyNumber'])
export class CaseLaw extends BaseEntity {
  @ApiProperty({
    example: '410 U.S. 113',
    description: 'Bluebook citation format',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  citation!: string;

  @ApiProperty({
    example: 'Roe v. Wade',
    description: 'Case name/title',
  })
  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @ApiProperty({
    example: 'U.S. Supreme Court',
    description: 'Court that issued the decision',
  })
  @Column({
    type: 'enum',
    enum: CaseLawCourt,
  })
  court!: CaseLawCourt;

  @ApiProperty({
    example: '1973-01-22',
    description: 'Date of the court decision',
  })
  @Column({ name: 'decision_date', type: 'date' })
  decisionDate!: Date;

  @ApiProperty({
    example: 'This case established...',
    description: 'Summary of the case holding',
  })
  @Column({ type: 'text', nullable: true })
  summary?: string;

  @ApiProperty({
    example: 'The Supreme Court held that...',
    description: 'Full text of the opinion',
  })
  @Column({ name: 'full_text', type: 'text' })
  fullText!: string;

  @ApiProperty({
    example: 'Federal',
    description: 'Legal jurisdiction',
  })
  @Column({
    type: 'enum',
    enum: CaseLawJurisdiction,
  })
  jurisdiction!: CaseLawJurisdiction;

  @ApiProperty({
    example: 'Blackmun, J.',
    description: 'Author of the majority opinion',
  })
  @Column({ name: 'opinion_author', type: 'varchar', length: 255, nullable: true })
  opinionAuthor?: string;

  @ApiProperty({
    example: '7-2',
    description: 'Vote count on the decision',
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  vote?: string;

  @ApiProperty({
    example: 'Constitutional Law > Substantive Due Process',
    description: 'Legal headnotes and topics',
  })
  @Column({ type: 'text', array: true, nullable: true })
  headnotes?: string[];

  @ApiProperty({
    example: '92K1',
    description: 'West Key Number classification',
  })
  @Column({ name: 'key_number', type: 'varchar', length: 50, nullable: true })
  keyNumber?: string;

  @ApiProperty({
    example: ['Privacy', 'Due Process', 'Abortion Rights'],
    description: 'Legal topics covered',
  })
  @Column({ type: 'text', array: true, nullable: true })
  topics?: string[];

  @ApiProperty({
    example: true,
    description: 'Whether this case is still binding precedent',
  })
  @Column({ name: 'is_binding', type: 'boolean', default: true })
  isBinding!: boolean;

  @ApiProperty({
    example: 5000,
    description: 'Number of times cited by other cases',
  })
  @Column({ name: 'citation_count', type: 'int', default: 0 })
  citationCount!: number;

  @ApiProperty({
    example: 'positive',
    description: 'Overall treatment signal (positive, negative, neutral)',
  })
  @Column({ name: 'treatment_signal', type: 'varchar', length: 50, nullable: true })
  treatmentSignal?: string;

  @ApiProperty({
    description: 'Additional metadata',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    example: 'https://supreme.justia.com/cases/federal/us/410/113/',
    description: 'URL to external source',
  })
  @Column({ name: 'source_url', type: 'varchar', length: 500, nullable: true })
  sourceUrl?: string;

  @OneToMany(() => CitationLink, (citationLink) => citationLink.sourceCase)
  citingCases!: CitationLink[];

  @OneToMany(() => CitationLink, (citationLink) => citationLink.targetCase)
  citedByCases!: CitationLink[];
}
