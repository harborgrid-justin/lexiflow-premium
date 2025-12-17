import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RiskImpact, RiskProbability, RiskStatus } from '../dto/create-risk.dto';
import { Case } from '../../cases/entities/case.entity';

@Entity('risks')
export class Risk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: RiskImpact })
  impact: RiskImpact;

  @Column({ type: 'enum', enum: RiskProbability })
  probability: RiskProbability;

  @Column({ type: 'enum', enum: RiskStatus, default: RiskStatus.OPEN })
  status: RiskStatus;

  @Column({ nullable: true })
  caseId: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'text', nullable: true })
  mitigationStrategy: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  riskScore: number;

  @Column({ nullable: true })
  identifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
