import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('compliance_checks')
export class ComplianceCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  caseId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
