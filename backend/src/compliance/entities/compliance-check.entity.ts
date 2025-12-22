import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('compliance_checks')
export class ComplianceCheck {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  caseId!: string;

  @Column()
  ruleId!: string;

  @Column()
  status!: string;

  @Column({ type: 'timestamp' })
  checkedAt!: Date;

  @Column('jsonb', { nullable: true })
  details: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
