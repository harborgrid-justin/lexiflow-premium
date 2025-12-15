import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('advisors')
export class Advisor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  firm: string;

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  caseId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
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
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ExpertType,
    default: ExpertType.OTHER
  })
  expertType: ExpertType;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ nullable: true })
  credentials: string;

  @Column({ nullable: true })
  caseId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('case_strategies')
export class CaseStrategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  caseId: string;

  @Column({ type: 'text', nullable: true })
  objective: string;

  @Column({ type: 'text', nullable: true })
  approach: string;

  @Column({ type: 'text', nullable: true })
  keyArguments: string;

  @Column({ type: 'json', nullable: true })
  notes: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
