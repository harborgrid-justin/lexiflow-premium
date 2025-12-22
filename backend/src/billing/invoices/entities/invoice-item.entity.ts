import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Invoice } from './invoice.entity';

export enum InvoiceItemType {
  TIME = 'Time',
  EXPENSE = 'Expense',
  FLAT_FEE = 'Flat Fee',
  ADJUSTMENT = 'Adjustment',
  CREDIT = 'Credit',
}

@Entity('invoice_items')
@Index(['invoiceId', 'type'])
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'invoice_id' })
  @Index()
  invoiceId!: string;

  @Column({
    type: 'enum',
    enum: InvoiceItemType,
  })
  type!: InvoiceItemType;

  @Column({ type: 'date', nullable: true })
  date!: string;

  @Column({ type: 'varchar', length: 500 })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number; // hours for time, units for expenses

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'uuid', nullable: true })
  timeEntryId!: string;

  @Column({ type: 'uuid', nullable: true })
  expenseId!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  activity!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ledesCode!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phaseCode!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taskCode!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
