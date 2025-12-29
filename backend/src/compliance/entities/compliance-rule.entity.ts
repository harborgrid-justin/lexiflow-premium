import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';

export type ComplianceCategory =
  | 'data_privacy'
  | 'ethics'
  | 'conflict_of_interest'
  | 'client_protection'
  | 'confidentiality'
  | 'document_retention'
  | 'financial'
  | 'reporting'
  | 'security'
  | 'other';

export type ComplianceSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

@Entity('compliance_rules')
@Index(['category', 'isActive'])
@Index(['severity', 'isActive'])
@Index(['isActive'])
export class ComplianceRule extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: [
      'data_privacy',
      'ethics',
      'conflict_of_interest',
      'client_protection',
      'confidentiality',
      'document_retention',
      'financial',
      'reporting',
      'security',
      'other',
    ],
  })
  category!: ComplianceCategory;

  @Column({
    type: 'enum',
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'medium',
  })
  severity!: ComplianceSeverity;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  conditions!: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  documentation!: string | null;

  @Column({ name: 'regulatory_framework', type: 'varchar', length: 100, nullable: true })
  regulatoryFramework!: string | null;

  @Column({ name: 'check_frequency', type: 'varchar', length: 50, nullable: true })
  checkFrequency!: string | null; // 'daily', 'weekly', 'monthly', 'quarterly', 'annually'

  @Column({ name: 'auto_check_enabled', type: 'boolean', default: false })
  autoCheckEnabled!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;
}
