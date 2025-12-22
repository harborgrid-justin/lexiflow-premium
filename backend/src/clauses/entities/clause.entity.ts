import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';

export enum ClauseCategory {
  GENERAL = 'general',
  CONTRACT = 'contract',
  MOTION = 'motion',
  PLEADING = 'pleading',
  DISCOVERY = 'discovery',
  CONFIDENTIALITY = 'confidentiality',
  INDEMNIFICATION = 'indemnification',
  LIMITATION_OF_LIABILITY = 'limitation_of_liability',
  TERMINATION = 'termination',
  PAYMENT = 'payment',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  DISPUTE_RESOLUTION = 'dispute_resolution',
  GOVERNING_LAW = 'governing_law',
  FORCE_MAJEURE = 'force_majeure',
  ASSIGNMENT = 'assignment',
  WARRANTIES = 'warranties',
  REPRESENTATIONS = 'representations',
  COVENANTS = 'covenants',
  DEFINITIONS = 'definitions',
  MISCELLANEOUS = 'miscellaneous',
  CUSTOM = 'custom',
  OTHER = 'other',
}

export enum RiskLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('clauses')
@Index(['category'])
@Index(['isActive'])
@Index(['title'])
export class Clause extends BaseEntity {
  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: ClauseCategory,
    default: ClauseCategory.GENERAL,
  })
  category!: ClauseCategory;

  @Column({ type: 'simple-array', nullable: true })
  tags!: string[];

  @Column({ type: 'jsonb', nullable: true })
  variables!: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount!: number;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  jurisdiction!: string;

  @Column({ name: 'practice_area', type: 'varchar', length: 200, nullable: true })
  practiceArea!: string;

  @Column({
    name: 'risk_level',
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.MEDIUM,
  })
  riskLevel!: RiskLevel;

  @Column({ name: 'is_standard', type: 'boolean', default: false })
  isStandard!: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  version!: string;

  @Column({ type: 'text', nullable: true })
  alternatives!: string;

  @Column({ name: 'legal_precedent', type: 'text', nullable: true })
  legalPrecedent!: string;

  @Column({ name: 'related_clauses', type: 'simple-array', nullable: true })
  relatedClauses!: string[];

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;
}
