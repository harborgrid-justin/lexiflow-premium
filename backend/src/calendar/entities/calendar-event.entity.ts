import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { Case } from '../../cases/entities/case.entity';

export enum CalendarEventType {
  HEARING = 'Hearing',
  DEADLINE = 'Deadline',
  MEETING = 'Meeting',
  REMINDER = 'Reminder',
  COURT_DATE = 'CourtDate',
  FILING = 'Filing'
}

@Entity('calendar_events')
@Index(['caseId'])
@Index(['startDate'])
@Index(['eventType'])
export class CalendarEvent extends BaseEntity {
  @Column()
  title!: string;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: CalendarEventType,
    default: CalendarEventType.REMINDER
  })
  eventType!: CalendarEventType;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate!: Date;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  location!: string;

  @Column({ type: 'json', nullable: true })
  attendees!: string[];

  @Column({ name: 'case_id', nullable: true })
  caseId!: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ nullable: true })
  reminder!: string;

  @Column({ default: false })
  completed!: boolean;
}
