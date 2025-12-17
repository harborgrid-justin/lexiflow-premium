import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../../cases/entities/case.entity';

export enum LegalHoldStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  RELEASED = 'RELEASED',
  EXPIRED = 'EXPIRED',
}

@Entity('legal_holds')
export class LegalHold {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'varchar', length: 300 })
  holdName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  holdNumber: string;

  @Column({
    type: 'enum',
    enum: LegalHoldStatus,
    default: LegalHoldStatus.DRAFT,
  })
  status: LegalHoldStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  holdInstructions: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'jsonb' })
  custodians: Array<{
    custodianId: string;
    custodianName: string;
    email: string;
    notifiedDate?: Date;
    acknowledgedDate?: Date;
    status: string;
  }>;

  @Column({ type: 'int', default: 0 })
  totalCustodians: number;

  @Column({ type: 'int', default: 0 })
  acknowledgedCount: number;

  @Column({ type: 'int', default: 0 })
  pendingCount: number;

  @Column({ type: 'jsonb', nullable: true })
  dataSourcesToPreserve: Array<{
    sourceType: string;
    description: string;
    location?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  notifications: Array<{
    date: Date;
    type: string;
    recipients: string[];
    subject: string;
    status: string;
  }>;

  @Column({ type: 'int', default: 0 })
  reminderIntervalDays: number;

  @Column({ type: 'date', nullable: true })
  lastReminderDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReminderDate: Date;

  @Column({ type: 'boolean', default: true })
  isAutoReminder: boolean;

  @Column({ type: 'text', nullable: true })
  releaseReason: string;

  @Column({ type: 'text', nullable: true })
  releaseNotes: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  issuedBy: string;

  @Column({ type: 'uuid', nullable: true })
  releasedBy: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
