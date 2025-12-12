import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ExpenseStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  BILLED = 'Billed',
  REIMBURSED = 'Reimbursed',
  REJECTED = 'Rejected',
}

export enum ExpenseCategory {
  COURT_FEES = 'Court Fees',
  FILING_FEES = 'Filing Fees',
  EXPERT_WITNESS = 'Expert Witness',
  DEPOSITION = 'Deposition',
  TRAVEL = 'Travel',
  MEALS = 'Meals',
  LODGING = 'Lodging',
  COPIES = 'Copies',
  POSTAGE = 'Postage',
  RESEARCH = 'Research',
  TRANSCRIPTS = 'Transcripts',
  PROCESS_SERVICE = 'Process Service',
  TECHNOLOGY = 'Technology',
  OTHER = 'Other',
}

@Entity('expenses')
@Index(['caseId', 'status'])
@Index(['userId', 'expenseDate'])
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'case_id', type: 'uuid' })
  @Index()
  caseId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'date' })
  @Index()
  expenseDate: string;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
  })
  category: ExpenseCategory;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.DRAFT,
  })
  @Index()
  status: ExpenseStatus;

  @Column({ type: 'boolean', default: true })
  billable: boolean;

  @Column({ type: 'boolean', default: false })
  reimbursable: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendor: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  receiptNumber: string;

  @Column({ type: 'simple-array', nullable: true })
  receiptUrls: string[];

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  markup: number; // percentage

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  markedUpAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  billedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  billedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  reimbursedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reimbursedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  glCode: string; // General Ledger code

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
