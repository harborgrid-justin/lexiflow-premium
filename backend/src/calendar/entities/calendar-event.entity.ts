import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
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
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: CalendarEventType,
    default: CalendarEventType.REMINDER
  })
  eventType: CalendarEventType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'json', nullable: true })
  attendees: string[];

  @Column({ nullable: true })
  caseId: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ nullable: true })
  reminder: string;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
