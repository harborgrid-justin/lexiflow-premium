import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('compliance_checks')
export class ComplianceCheck {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'case_id' })
  caseId!: string;

  @Column({ name: 'rule_id' })
  ruleId!: string;

  @Column()
  status!: string;

  @Column({ name: 'checked_at', type: 'timestamp' })
  checkedAt!: Date;

  @Column('jsonb', { nullable: true })
  details: Record<string, unknown> | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
