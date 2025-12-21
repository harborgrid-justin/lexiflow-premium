import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { User } from '../../../users/entities/user.entity';
import { Case } from '../../../cases/entities/case.entity';

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
export class TimeEntry extends BaseEntity {
  @Column({ name: 'case_id', nullable: true })
  @Index()
  caseId: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string;

  @ManyToOne(() => User, (user) => user.timeEntries)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  date: Date;

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
  @Index()
  invoiceId: string; // Links time entry to invoice when billed

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

  // Note: createdAt, updatedAt, createdBy, updatedBy, and deletedAt are inherited from BaseEntity
}
