import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Client } from './client.entity';
import { TimeEntry } from './time-entry.entity';

@Entity('invoices')
@Index(['invoiceNumber'], { unique: true })
@Index(['caseId'])
@Index(['clientId'])
@Index(['status'])
@Index(['invoiceDate'])
@Index(['dueDate'])
export class Invoice extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  clientId: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  invoiceNumber: string;

  @Column({ type: 'date', nullable: true })
  invoiceDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({
    type: 'enum',
    enum: [
      'draft',
      'sent',
      'viewed',
      'partial',
      'paid',
      'overdue',
      'cancelled',
      'refunded',
    ],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  sentDate: Date;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentReference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  pdfPath: string;

  @Column({ type: 'jsonb', nullable: true })
  lineItems: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  paymentHistory: Record<string, any>[];

  @Column({ type: 'uuid', nullable: true })
  billingContactId: string;

  @Column({ type: 'text', nullable: true })
  billingAddress: string;

  // Relations
  // Note: No ManyToOne to Case - caseId is a string reference only, not a foreign key

  @ManyToOne(() => Client, (client) => client.invoices)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @OneToMany(() => TimeEntry, (entry) => entry.invoice)
  timeEntries: TimeEntry[];
}
