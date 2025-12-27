import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Case } from '@cases/entities/case.entity';

@Entity('advisors')
export class Advisor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  firm!: string;

  @Column({ nullable: true })
  specialty!: string;

  @Column({ name: 'case_id', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

export enum ExpertType {
  TECHNICAL = 'Technical',
  MEDICAL = 'Medical',
  FINANCIAL = 'Financial',
  FORENSIC = 'Forensic',
  INDUSTRY = 'Industry',
  OTHER = 'Other'
}

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    name: 'expert_type',
    type: 'enum',
    enum: ExpertType,
    default: ExpertType.OTHER
  })
  expertType!: ExpertType;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate!: number;

  @Column({ nullable: true })
  credentials!: string;

  @Column({ name: 'case_id', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('case_strategies')
export class CaseStrategy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'case_id', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ type: 'text', nullable: true })
  objective!: string;

  @Column({ type: 'text', nullable: true })
  approach!: string;

  @Column({ name: 'key_arguments', type: 'text', nullable: true })
  keyArguments!: string;

  @Column({ type: 'json', nullable: true })
  notes: Record<string, unknown> | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
