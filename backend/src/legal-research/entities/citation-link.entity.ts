import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CaseLaw } from './case-law.entity';

/**
 * Shepard's-style citation treatment categories
 * Based on Shepard's Citations and KeyCite systems
 */
export enum CitationTreatment {
  // Positive treatments
  FOLLOWED = 'Followed',
  AFFIRMED = 'Affirmed',
  APPROVED = 'Approved',
  CITED_FAVORABLY = 'Cited Favorably',

  // Neutral treatments
  CITED = 'Cited',
  MENTIONED = 'Mentioned',
  QUOTED = 'Quoted',

  // Negative treatments (Critical for attorneys)
  DISTINGUISHED = 'Distinguished',
  CRITICIZED = 'Criticized',
  QUESTIONED = 'Questioned',
  LIMITED = 'Limited',
  OVERRULED = 'Overruled',
  OVERRULED_IN_PART = 'Overruled in Part',
  REVERSED = 'Reversed',
  REVERSED_IN_PART = 'Reversed in Part',
  SUPERSEDED = 'Superseded',
  SUPERSEDED_BY_STATUTE = 'Superseded by Statute',
  ABROGATED = 'Abrogated',
  MODIFIED = 'Modified',
  VACATED = 'Vacated',

  // Procedural
  REMANDED = 'Remanded',
  APPEAL_FILED = 'Appeal Filed',
  CERTIORARI_GRANTED = 'Certiorari Granted',
  CERTIORARI_DENIED = 'Certiorari Denied',

  // Other
  DISTINGUISHED_ON_FACTS = 'Distinguished on Facts',
  NOT_FOLLOWED = 'Not Followed',
  DECLINED_TO_FOLLOW = 'Declined to Follow',
}

/**
 * Signal strength for quick visual assessment (like Shepard's signals)
 */
export enum CitationSignal {
  RED_FLAG = 'red_flag',           // Negative treatment (overruled, reversed)
  YELLOW_FLAG = 'yellow_flag',     // Possible negative treatment (questioned, criticized)
  BLUE_A = 'blue_a',               // Affirmed
  GREEN_C = 'green_c',             // Cited favorably
  ORANGE_Q = 'orange_q',           // Questioned
  NEUTRAL = 'neutral',             // Neutral citation
}

@Entity('citation_links')
@Index(['sourceCaseId'])
@Index(['targetCaseId'])
@Index(['treatment'])
@Index(['citationDate'])
@Index(['signal'])
@Index(['isNegativeTreatment'])
export class CitationLink extends BaseEntity {
  @ApiProperty({
    description: 'The case that cites another case (citing case)',
  })
  @Column({ name: 'source_case_id', type: 'uuid' })
  sourceCaseId!: string;

  @ApiProperty({
    description: 'The case being cited (cited case)',
  })
  @Column({ name: 'target_case_id', type: 'uuid' })
  targetCaseId!: string;

  @ApiProperty({
    example: 'Followed',
    description: 'How the citing case treats the cited case',
  })
  @Column({
    type: 'enum',
    enum: CitationTreatment,
  })
  treatment!: CitationTreatment;

  @ApiProperty({
    example: 'red_flag',
    description: 'Visual signal for quick assessment',
  })
  @Column({
    type: 'enum',
    enum: CitationSignal,
    nullable: true,
  })
  signal?: CitationSignal;

  @ApiProperty({
    example: '2020-05-15',
    description: 'Date when the citation occurred',
  })
  @Column({ name: 'citation_date', type: 'date' })
  citationDate!: Date;

  @ApiProperty({
    example: 'The court followed the reasoning in Smith v. Jones...',
    description: 'Context snippet where citation appears',
  })
  @Column({ name: 'context_snippet', type: 'text', nullable: true })
  contextSnippet?: string;

  @ApiProperty({
    example: 25,
    description: 'Page number where citation appears',
  })
  @Column({ name: 'page_number', type: 'int', nullable: true })
  pageNumber?: number;

  @ApiProperty({
    example: true,
    description: 'Whether this citation represents negative treatment',
  })
  @Column({ name: 'is_negative_treatment', type: 'boolean', default: false })
  isNegativeTreatment!: boolean;

  @ApiProperty({
    example: 8,
    description: 'Strength/weight of the citation (1-10)',
  })
  @Column({ name: 'citation_weight', type: 'int', nullable: true })
  citationWeight?: number;

  @ApiProperty({
    example: 'Constitutional Law',
    description: 'Legal topic/headnote for this citation',
  })
  @Column({ name: 'legal_topic', type: 'varchar', length: 500, nullable: true })
  legalTopic?: string;

  @ApiProperty({
    example: '92K1',
    description: 'West Key Number for this citation',
  })
  @Column({ name: 'key_number', type: 'varchar', length: 50, nullable: true })
  keyNumber?: string;

  @ApiProperty({
    example: true,
    description: 'Whether this is a critical citation for the case',
  })
  @Column({ name: 'is_critical', type: 'boolean', default: false })
  isCritical!: boolean;

  @ApiProperty({
    example: 'majority',
    description: 'Which opinion contains this citation',
  })
  @Column({ name: 'opinion_type', type: 'varchar', length: 50, nullable: true })
  opinionType?: string;

  @ApiProperty({
    description: 'Additional metadata',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => CaseLaw, (caseLaw) => caseLaw.citingCases)
  @JoinColumn({ name: 'source_case_id' })
  sourceCase!: CaseLaw;

  @ManyToOne(() => CaseLaw, (caseLaw) => caseLaw.citedByCases)
  @JoinColumn({ name: 'target_case_id' })
  targetCase!: CaseLaw;
}
