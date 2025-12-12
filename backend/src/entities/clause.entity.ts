import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('clauses')
@Index(['category'])
@Index(['isActive'])
@Index(['title'])
export class Clause extends BaseEntity {
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: [
      'confidentiality',
      'indemnification',
      'limitation_of_liability',
      'termination',
      'payment',
      'intellectual_property',
      'dispute_resolution',
      'governing_law',
      'force_majeure',
      'assignment',
      'warranties',
      'representations',
      'covenants',
      'definitions',
      'miscellaneous',
      'other',
    ],
  })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', length: 200, nullable: true })
  jurisdiction: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  practiceArea: string;

  @Column({
    type: 'enum',
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  })
  riskLevel: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isStandard: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  lastModifiedBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  version: string;

  @Column({ type: 'text', nullable: true })
  usage: string;

  @Column({ type: 'text', nullable: true })
  alternatives: string;

  @Column({ type: 'text', nullable: true })
  legalPrecedent: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedClauses: string[];

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'jsonb', nullable: true })
  variables: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
