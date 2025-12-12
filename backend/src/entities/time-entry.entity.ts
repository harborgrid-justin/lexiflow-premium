import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';
import { User } from './user.entity';
import { Invoice } from './invoice.entity';

@Entity('time_entries')
@Index(['caseId'])
@Index(['userId'])
@Index(['date'])
@Index(['status'])
@Index(['billable'])
export class TimeEntry extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hours: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'boolean', default: true })
  billable: boolean;

  @Column({
    type: 'enum',
    enum: ['draft', 'submitted', 'approved', 'invoiced', 'rejected'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  activityCode: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  taskCode: string;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  phaseId: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'boolean', default: false })
  isOvertime: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.timeEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @ManyToOne(() => User, (user) => user.timeEntries)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Invoice, (invoice) => invoice.timeEntries, {
    nullable: true,
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;
}
