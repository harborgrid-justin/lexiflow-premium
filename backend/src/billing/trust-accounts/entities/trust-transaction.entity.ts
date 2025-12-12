import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  TRANSFER = 'Transfer',
  INTEREST = 'Interest',
  FEE = 'Fee',
  ADJUSTMENT = 'Adjustment',
}

@Entity('trust_transactions')
@Index(['trustAccountId', 'transactionDate'])
@Index(['transactionType', 'transactionDate'])
export class TrustTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'trust_account_id', type: 'uuid' })
  @Index()
  trustAccountId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @Column({ type: 'date' })
  @Index()
  transactionDate: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  checkNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payee: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payor: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ type: 'uuid', nullable: true })
  relatedInvoiceId: string;

  @Column({ type: 'uuid', nullable: true })
  relatedCaseId: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'boolean', default: false })
  reconciled: boolean;

  @Column({ type: 'date', nullable: true })
  reconciledDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

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
