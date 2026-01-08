import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Case } from './case.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum DeadlineType {
  FILING = 'filing',
  RESPONSE = 'response',
  DISCOVERY = 'discovery',
  MOTION = 'motion',
  TRIAL = 'trial',
  APPEAL = 'appeal',
  STATUTE_OF_LIMITATIONS = 'statute_of_limitations',
  SCHEDULING_ORDER = 'scheduling_order',
  EXPERT_DISCLOSURE = 'expert_disclosure',
  PRETRIAL = 'pretrial',
  SETTLEMENT_CONFERENCE = 'settlement_conference',
  MEDIATION = 'mediation',
  ARBITRATION = 'arbitration',
  CUSTOM = 'custom',
}

export enum DeadlineStatus {
  PENDING = 'pending',
  UPCOMING = 'upcoming',
  DUE_TODAY = 'due_today',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXTENDED = 'extended',
}

export enum DeadlinePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('case_deadlines')
@Index(['caseId'])
@Index(['deadlineDate'])
@Index(['status'])
@Index(['deadlineType'])
@Index(['assignedTo'])
@Index(['jurisdictionRuleId'])
@Index(['caseId', 'status', 'deadlineDate'])
export class CaseDeadline extends BaseEntity {
  @ApiProperty({ description: 'Associated case ID' })
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @ApiProperty({ description: 'Deadline title/description' })
  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @ApiProperty({ description: 'Detailed description of the deadline' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: DeadlineType, description: 'Type of deadline' })
  @Column({
    name: 'deadline_type',
    type: 'enum',
    enum: DeadlineType,
    default: DeadlineType.CUSTOM,
  })
  deadlineType!: DeadlineType;

  @ApiProperty({ description: 'The actual deadline date and time' })
  @Column({ name: 'deadline_date', type: 'timestamp with time zone' })
  deadlineDate!: Date;

  @ApiProperty({ description: 'Original deadline date before any extensions' })
  @Column({ name: 'original_deadline_date', type: 'timestamp with time zone', nullable: true })
  originalDeadlineDate?: Date;

  @ApiProperty({ enum: DeadlineStatus, description: 'Current status of the deadline' })
  @Column({
    type: 'enum',
    enum: DeadlineStatus,
    default: DeadlineStatus.PENDING,
  })
  status!: DeadlineStatus;

  @ApiProperty({ enum: DeadlinePriority, description: 'Priority level of the deadline' })
  @Column({
    type: 'enum',
    enum: DeadlinePriority,
    default: DeadlinePriority.MEDIUM,
  })
  priority!: DeadlinePriority;

  @ApiProperty({ description: 'Jurisdiction rule ID that generated this deadline' })
  @Column({ name: 'jurisdiction_rule_id', type: 'uuid', nullable: true })
  jurisdictionRuleId?: string;

  @ApiProperty({ description: 'Rule citation (e.g., FRCP 26(a)(1))' })
  @Column({ name: 'rule_citation', type: 'varchar', length: 255, nullable: true })
  ruleCitation?: string;

  @ApiProperty({ description: 'The triggering event that started the deadline calculation' })
  @Column({ name: 'trigger_event', type: 'varchar', length: 500, nullable: true })
  triggerEvent?: string;

  @ApiProperty({ description: 'Date when the triggering event occurred' })
  @Column({ name: 'trigger_date', type: 'date', nullable: true })
  triggerDate?: Date;

  @ApiProperty({ description: 'Number of days from trigger event to deadline' })
  @Column({ name: 'days_from_trigger', type: 'int', nullable: true })
  daysFromTrigger?: number;

  @ApiProperty({ description: 'Whether to calculate using business days only' })
  @Column({ name: 'business_days_only', type: 'boolean', default: false })
  businessDaysOnly!: boolean;

  @ApiProperty({ description: 'Holidays to exclude from calculation' })
  @Column({ name: 'excluded_dates', type: 'jsonb', nullable: true })
  excludedDates?: Date[];

  @ApiProperty({ description: 'User or team assigned to this deadline' })
  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo?: string;

  @ApiProperty({ description: 'Team ID assigned to this deadline' })
  @Column({ name: 'assigned_team_id', type: 'uuid', nullable: true })
  assignedTeamId?: string;

  @ApiProperty({ description: 'Reminder dates before the deadline' })
  @Column({ name: 'reminder_dates', type: 'jsonb', nullable: true })
  reminderDates?: Date[];

  @ApiProperty({ description: 'Whether reminders have been sent' })
  @Column({ name: 'reminders_sent', type: 'jsonb', nullable: true })
  remindersSent?: { date: Date; sent: boolean; sentAt?: Date }[];

  @ApiProperty({ description: 'Date when the deadline was completed' })
  @Column({ name: 'completed_date', type: 'timestamp with time zone', nullable: true })
  completedDate?: Date;

  @ApiProperty({ description: 'User who completed the deadline' })
  @Column({ name: 'completed_by', type: 'uuid', nullable: true })
  completedBy?: string;

  @ApiProperty({ description: 'Completion notes' })
  @Column({ name: 'completion_notes', type: 'text', nullable: true })
  completionNotes?: string;

  @ApiProperty({ description: 'Extension request information' })
  @Column({ name: 'extension_request', type: 'jsonb', nullable: true })
  extensionRequest?: {
    requestedBy: string;
    requestedDate: Date;
    requestedExtensionDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'denied';
    reviewedBy?: string;
    reviewedDate?: Date;
  };

  @ApiProperty({ description: 'Related document IDs' })
  @Column({ name: 'related_document_ids', type: 'jsonb', nullable: true })
  relatedDocumentIds?: string[];

  @ApiProperty({ description: 'Related task IDs' })
  @Column({ name: 'related_task_ids', type: 'jsonb', nullable: true })
  relatedTaskIds?: string[];

  @ApiProperty({ description: 'Notes about the deadline' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: 'Whether this is a court-imposed deadline' })
  @Column({ name: 'is_court_imposed', type: 'boolean', default: false })
  isCourtImposed!: boolean;

  @ApiProperty({ description: 'Whether this is a statutory deadline' })
  @Column({ name: 'is_statutory', type: 'boolean', default: false })
  isStatutory!: boolean;

  @ApiProperty({ description: 'Whether this deadline can be extended' })
  @Column({ name: 'is_extendable', type: 'boolean', default: true })
  isExtendable!: boolean;

  /**
   * Calculate days remaining until deadline
   */
  get daysRemaining(): number {
    const now = new Date();
    const deadline = new Date(this.deadlineDate);
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if deadline is overdue
   */
  get isOverdue(): boolean {
    return this.daysRemaining < 0 && this.status !== DeadlineStatus.COMPLETED;
  }

  /**
   * Check if deadline is upcoming (within 7 days)
   */
  get isUpcoming(): boolean {
    const days = this.daysRemaining;
    return days >= 0 && days <= 7;
  }
}
