import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Case } from '@cases/entities/case.entity';
import { ComplianceRule } from './compliance-rule.entity';

export type ComplianceCheckStatus = 'pending' | 'passed' | 'failed' | 'warning' | 'skipped' | 'in_progress';

@Entity('compliance_checks')
@Index(['caseId', 'createdAt'])
@Index(['ruleId', 'status'])
@Index(['status'])
@Index(['checkedAt'])
export class ComplianceCheck extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  @Index()
  caseId!: string;

  @ManyToOne(() => Case, { nullable: true })
  @JoinColumn({ name: 'case_id' })
  case!: Case | null;

  @Column({ name: 'rule_id', type: 'uuid' })
  @Index()
  ruleId!: string;

  @ManyToOne(() => ComplianceRule, { nullable: true })
  @JoinColumn({ name: 'rule_id' })
  rule!: ComplianceRule | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'passed', 'failed', 'warning', 'skipped', 'in_progress'],
    default: 'pending',
  })
  status!: ComplianceCheckStatus;

  @Column({ name: 'checked_at', type: 'timestamp' })
  checkedAt!: Date;

  @Column({ name: 'checked_by', type: 'uuid', nullable: true })
  checkedBy!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details!: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  findings!: string | null;

  @Column({ type: 'text', nullable: true })
  recommendation!: string | null;

  @Column({ name: 'risk_level', type: 'varchar', length: 50, nullable: true })
  riskLevel!: string | null;

  @Column({ name: 'remediation_required', type: 'boolean', default: false })
  remediationRequired!: boolean;

  @Column({ name: 'remediation_deadline', type: 'date', nullable: true })
  remediationDeadline!: string | null;

  @Column({ name: 'remediated_at', type: 'timestamp', nullable: true })
  remediatedAt!: Date | null;

  @Column({ name: 'remediated_by', type: 'uuid', nullable: true })
  remediatedBy!: string | null;
}
