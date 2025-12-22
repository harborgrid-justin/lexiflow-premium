import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum FeeAgreementType {
  HOURLY = 'Hourly',
  FIXED_FEE = 'Fixed Fee',
  CONTINGENCY = 'Contingency',
  HYBRID = 'Hybrid',
  RETAINER = 'Retainer',
  SUBSCRIPTION = 'Subscription',
}

export enum FeeAgreementStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active',
  SUSPENDED = 'Suspended',
  TERMINATED = 'Terminated',
  COMPLETED = 'Completed',
}

@Entity('fee_agreements')
@Index(['clientId', 'status'])
@Index(['caseId', 'status'])
export class FeeAgreement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  agreementNumber!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  @Index()
  clientId!: string;

  @Column({ type: 'varchar', length: 255 })
  clientName!: string;

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  @Index()
  caseId!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  matterDescription!: string;

  @Column({
    type: 'enum',
    enum: FeeAgreementType,
  })
  agreementType!: FeeAgreementType;

  @Column({
    type: 'enum',
    enum: FeeAgreementStatus,
    default: FeeAgreementStatus.DRAFT,
  })
  @Index()
  status!: FeeAgreementStatus;

  @Column({ type: 'date' })
  effectiveDate!: string;

  @Column({ type: 'date', nullable: true })
  terminationDate!: string;

  // Hourly billing fields
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  standardRate!: number;

  @Column({ type: 'uuid', nullable: true })
  rateTableId!: string;

  // Fixed fee fields
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedFeeAmount!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentSchedule!: string; // e.g., "Monthly", "Upon Completion", "Milestone-based"

  // Contingency fields
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  contingencyPercentage!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumRecovery!: number;

  // Retainer fields
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  retainerAmount!: number;

  @Column({ type: 'boolean', default: false })
  retainerRefundable!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  retainerReplenishment!: string; // e.g., "Monthly", "Quarterly", "As needed"

  // Subscription fields
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyFee!: number;

  @Column({ type: 'integer', nullable: true })
  includedHours!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  overageRate!: number;

  // Expense handling
  @Column({ type: 'boolean', default: true })
  expensesBillable!: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  expenseMarkup!: number; // percentage

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  expenseCap!: number;

  // Billing terms
  @Column({ type: 'integer', default: 30 })
  paymentTermsDays!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  billingFrequency!: string; // e.g., "Monthly", "Bi-weekly", "Upon completion"

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  latePaymentRate!: number; // percentage

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPercentage!: number;

  @Column({ type: 'text', nullable: true })
  scopeOfWork!: string;

  @Column({ type: 'text', nullable: true })
  terms!: string;

  @Column({ type: 'text', nullable: true })
  specialProvisions!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentUrl!: string;

  @Column({ type: 'timestamp', nullable: true })
  signedDate!: Date;

  @Column({ type: 'uuid', nullable: true })
  signedBy!: string;

  @Column({ type: 'uuid', nullable: true })
  responsibleAttorney!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date;
}
