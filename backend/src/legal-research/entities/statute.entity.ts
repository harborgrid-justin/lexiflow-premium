import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum StatuteJurisdiction {
  FEDERAL = 'Federal',
  STATE = 'State',
  LOCAL = 'Local',
  INTERNATIONAL = 'International',
}

export enum StatuteType {
  USC = 'U.S. Code',
  CFR = 'Code of Federal Regulations',
  STATE_CODE = 'State Code',
  MUNICIPAL_CODE = 'Municipal Code',
  MODEL_CODE = 'Model Code',
}

@Entity('statutes')
@Index(['code'])
@Index(['section'])
@Index(['jurisdiction'])
@Index(['effectiveDate'])
@Index(['isActive'])
export class Statute extends BaseEntity {
  @ApiProperty({
    example: '42 U.S.C.',
    description: 'Code designation (e.g., 42 U.S.C., Cal. Civ. Code)',
  })
  @Column({ type: 'varchar', length: 255 })
  code!: string;

  @ApiProperty({
    example: '1983',
    description: 'Section number within the code',
  })
  @Column({ type: 'varchar', length: 255 })
  section!: string;

  @ApiProperty({
    example: 'Civil Action for Deprivation of Rights',
    description: 'Title or heading of the statute',
  })
  @Column({ type: 'varchar', length: 1000 })
  title!: string;

  @ApiProperty({
    example: 'Every person who, under color of any statute...',
    description: 'Full text of the statute',
  })
  @Column({ type: 'text' })
  text!: string;

  @ApiProperty({
    example: 'Federal',
    description: 'Jurisdiction of the statute',
  })
  @Column({
    type: 'enum',
    enum: StatuteJurisdiction,
  })
  jurisdiction!: StatuteJurisdiction;

  @ApiProperty({
    example: 'California',
    description: 'Specific state for state statutes',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  state?: string;

  @ApiProperty({
    example: 'U.S. Code',
    description: 'Type of statute',
  })
  @Column({
    type: 'enum',
    enum: StatuteType,
  })
  type!: StatuteType;

  @ApiProperty({
    example: '1871-04-20',
    description: 'Date the statute became effective',
  })
  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate?: Date;

  @ApiProperty({
    example: '2023-01-01',
    description: 'Date of last amendment',
  })
  @Column({ name: 'last_amended', type: 'date', nullable: true })
  lastAmended?: Date;

  @ApiProperty({
    example: true,
    description: 'Whether the statute is currently active',
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Date the statute was repealed or expired',
  })
  @Column({ name: 'sunset_date', type: 'date', nullable: true })
  sunsetDate?: Date;

  @ApiProperty({
    example: ['Civil Rights', 'Federal Jurisdiction', '42 U.S.C. § 1988'],
    description: 'Related statutes and cross-references',
  })
  @Column({ name: 'cross_references', type: 'text', array: true, nullable: true })
  crossReferences?: string[];

  @ApiProperty({
    example: ['Civil Rights', 'Constitutional Law', 'Federal Remedies'],
    description: 'Legal topics and categories',
  })
  @Column({ type: 'text', array: true, nullable: true })
  topics?: string[];

  @ApiProperty({
    example: 'Pub. L. 96-170, § 1, 93 Stat. 1284',
    description: 'Legislative history reference',
  })
  @Column({ name: 'legislative_history', type: 'text', nullable: true })
  legislativeHistory?: string;

  @ApiProperty({
    example: 'This section was enacted to provide...',
    description: 'Notes and annotations',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    example: 'Chapter 21 - Civil Rights',
    description: 'Chapter in the code',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  chapter?: string;

  @ApiProperty({
    example: 'Subchapter I - Generally',
    description: 'Subchapter in the code',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  subchapter?: string;

  @ApiProperty({
    description: 'Additional metadata',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    example: 'https://www.law.cornell.edu/uscode/text/42/1983',
    description: 'URL to external source',
  })
  @Column({ name: 'source_url', type: 'varchar', length: 500, nullable: true })
  sourceUrl?: string;

  @ApiProperty({
    example: 150,
    description: 'Number of cases citing this statute',
  })
  @Column({ name: 'citation_count', type: 'int', default: 0 })
  citationCount!: number;
}
