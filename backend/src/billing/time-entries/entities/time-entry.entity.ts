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
import { User } from '../../../entities/user.entity';

export enum TimeEntryStatus {
  DRAFT = 'Draft',
  DRAFT_LOWER = 'draft',
  SUBMITTED = 'Submitted',
  SUBMITTED_LOWER = 'submitted',
  APPROVED = 'Approved',
  APPROVED_LOWER = 'approved',
  BILLED = 'Billed',
  INVOICED = 'invoiced',
  WRITTEN_OFF = 'Written Off',
  REJECTED = 'rejected',
}

@Entity('time_entries')
@Index(['caseId', 'date'])
@Index(['userId', 'status'])
@Index(['status', 'billable'])
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'case_id', nullable: true })
  @Index()
  caseId: string;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string;

  @ManyToOne(() => User, (user) => user.timeEntries)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  duration: number; // in hours

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  activity: string; // e.g., "Research", "Court Appearance", "Client Meeting"

  @Column({ type: 'varchar', length: 20, nullable: true })
  ledesCode: string; // LEDES billing code

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rate: number; // hourly rate

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total: number; // duration * rate

  @Column({
    type: 'enum',
    enum: TimeEntryStatus,
    default: TimeEntryStatus.DRAFT,
  })
  @Index()
  status: TimeEntryStatus;

  @Column({ type: 'boolean', default: true })
  billable: boolean;

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string;

  @Column({ type: 'uuid', nullable: true })
  rateTableId: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  taskCode: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount: number; // percentage

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountedTotal: number;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  billedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  billedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phaseCode: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  expenseCategory: string;

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
