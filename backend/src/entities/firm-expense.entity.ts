import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';
import { User } from './user.entity';

@Entity('firm_expenses')
@Index(['caseId'])
@Index(['category'])
@Index(['expenseDate'])
@Index(['status'])
@Index(['billable'])
export class FirmExpense extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  expenseDate: Date;

  @Column({
    type: 'enum',
    enum: [
      'travel',
      'meals',
      'accommodation',
      'filing_fees',
      'court_costs',
      'expert_fees',
      'research',
      'copying',
      'postage',
      'courier',
      'technology',
      'office_supplies',
      'professional_services',
      'other',
    ],
  })
  category: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendor: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  receiptNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ type: 'boolean', default: false })
  billable: boolean;

  @Column({ type: 'boolean', default: false })
  reimbursable: boolean;

  @Column({
    type: 'enum',
    enum: ['draft', 'submitted', 'approved', 'invoiced', 'paid', 'rejected'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  receiptPath: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amountInBaseCurrency: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @ManyToOne(() => User, (user) => user.expenses, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
