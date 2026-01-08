import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { PortalUser } from './portal-user.entity';

@Entity('appointments')
@Index(['portalUserId'])
@Index(['attorneyId'])
@Index(['datetime'])
@Index(['status'])
@Index(['appointmentType'])
export class Appointment extends BaseEntity {
  @Column({ name: 'portal_user_id', type: 'uuid' })
  portalUserId!: string;

  @Column({ name: 'attorney_id', type: 'uuid' })
  attorneyId!: string;

  @Column({ name: 'attorney_name', type: 'varchar', length: 255, nullable: true })
  attorneyName!: string;

  @Column({ name: 'matter_id', type: 'uuid', nullable: true })
  matterId!: string;

  @Column({ type: 'timestamp with time zone' })
  datetime!: Date;

  @Column({ name: 'duration_minutes', type: 'integer', default: 60 })
  durationMinutes!: number;

  @Column({ name: 'end_datetime', type: 'timestamp with time zone', nullable: true })
  endDatetime!: Date;

  @Column({
    name: 'appointment_type',
    type: 'enum',
    enum: ['consultation', 'review', 'phone_call', 'video_conference', 'in_person', 'court_appearance', 'other'],
    default: 'consultation',
  })
  appointmentType!: string;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'],
    default: 'scheduled',
  })
  status!: string;

  @Column({
    name: 'meeting_method',
    type: 'enum',
    enum: ['in_person', 'phone', 'video', 'client_choice'],
    default: 'client_choice',
  })
  meetingMethod!: string;

  @Column({ name: 'meeting_link', type: 'text', nullable: true })
  meetingLink!: string;

  @Column({ name: 'meeting_password', type: 'varchar', length: 255, nullable: true })
  meetingPassword!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 50, nullable: true })
  phoneNumber!: string;

  @Column({ type: 'text', nullable: true })
  location!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ name: 'client_notes', type: 'text', nullable: true })
  clientNotes!: string;

  @Column({ name: 'attorney_notes', type: 'text', nullable: true })
  attorneyNotes!: string;

  @Column({ type: 'text', nullable: true })
  agenda!: string;

  @Column({ name: 'preparation_instructions', type: 'text', nullable: true })
  preparationInstructions!: string;

  @Column({ name: 'documents_required', type: 'jsonb', nullable: true })
  documentsRequired!: string[];

  @Column({ name: 'cancelled_at', type: 'timestamp with time zone', nullable: true })
  cancelledAt!: Date;

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy!: string;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason!: string;

  @Column({ name: 'reminder_sent', type: 'boolean', default: false })
  reminderSent!: boolean;

  @Column({ name: 'reminder_sent_at', type: 'timestamp with time zone', nullable: true })
  reminderSentAt!: Date;

  @Column({ name: 'confirmation_sent', type: 'boolean', default: false })
  confirmationSent!: boolean;

  @Column({ name: 'confirmation_sent_at', type: 'timestamp with time zone', nullable: true })
  confirmationSentAt!: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp with time zone', nullable: true })
  confirmedAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt!: Date;

  @Column({ name: 'time_zone', type: 'varchar', length: 100, default: 'America/New_York' })
  timeZone!: string;

  @Column({ name: 'is_billable', type: 'boolean', default: true })
  isBillable!: boolean;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate!: number;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring!: boolean;

  @Column({ name: 'recurrence_pattern', type: 'jsonb', nullable: true })
  recurrencePattern!: Record<string, unknown>;

  @Column({ name: 'parent_appointment_id', type: 'uuid', nullable: true })
  parentAppointmentId!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  // Relations
  @ManyToOne(() => PortalUser, (user) => user.appointments, { nullable: false })
  @JoinColumn({ name: 'portal_user_id' })
  portalUser!: PortalUser;
}
