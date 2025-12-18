import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { User } from '../../../users/entities/user.entity';
import { Case } from '../../../cases/entities/case.entity';

export enum ExpenseStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  BILLED = 'billed',
  REIMBURSED = 'reimbursed',
  REJECTED = 'rejected',
}

export enum ExpenseCategory {
  COURT_FEES = 'court_fees',
  FILING_FEES = 'filing_fees',
  EXPERT_WITNESS = 'expert_witness',
  DEPOSITION = 'deposition',
  TRAVEL = 'travel',
  MEALS = 'meals',
  LODGING = 'lodging',
  COPIES = 'copies',
  POSTAGE = 'postage',
  RESEARCH = 'research',
  TRANSCRIPTS = 'transcripts',
  PROCESS_SERVICE = 'process_service',
  TECHNOLOGY = 'technology',
  OFFICE_SUPPLIES = 'office_supplies',
  PROFESSIONAL_SERVICES = 'professional_services',
  OTHER = 'other',
}

@Entity('expenses')
@Index(['caseId', 'status'])
@Index(['userId', 'expenseDate'])
@Index(['category'])
@Index(['billable'])
export class Expense extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  @Index()
  caseId: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'expense_date', type: 'date' })
  @Index()
  expenseDate: Date;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
  })
  category: ExpenseCategory;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
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

  @Column({ name: 'receipt_number', type: 'varchar', length: 100, nullable: true })
  receiptNumber: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'invoice_id', type: 'uuid', nullable: true })
  invoiceId: string;

  @Column({ name: 'receipt_path', type: 'varchar', length: 500, nullable: true })
  receiptPath: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'amount_in_base_currency', type: 'decimal', precision: 15, scale: 2, nullable: true })
  amountInBaseCurrency: number;

  @Column({ name: 'markup', type: 'decimal', precision: 10, scale: 2, default: 0 })
  markup: number;

  @Column({ name: 'marked_up_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  markedUpAmount: number;

  @Column({ name: 'billed_by', type: 'uuid', nullable: true })
  billedBy: string;

  @Column({ name: 'billed_at', type: 'timestamp', nullable: true })
  billedAt: Date;

  @Column({ name: 'reimbursed_by', type: 'uuid', nullable: true })
  reimbursedBy: string;

  @Column({ name: 'reimbursed_at', type: 'timestamp', nullable: true })
  reimbursedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
