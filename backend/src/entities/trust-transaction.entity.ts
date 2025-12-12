import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('trust_transactions')
@Index(['accountId'])
@Index(['transactionDate'])
@Index(['type'])
@Index(['status'])
@Index(['caseId'])
export class TrustTransaction extends BaseEntity {
  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  clientId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: [
      'deposit',
      'withdrawal',
      'transfer',
      'fee',
      'refund',
      'adjustment',
      'interest',
    ],
  })
  type: string;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'cleared', 'reconciled', 'cancelled', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  checkNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payee: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payor: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'uuid', nullable: true })
  relatedTransactionId: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'date', nullable: true })
  reconciledDate: Date;

  @Column({ type: 'uuid', nullable: true })
  reconciledBy: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentPath: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
