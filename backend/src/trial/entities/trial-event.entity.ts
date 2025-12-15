import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TrialEventType } from '../dto/create-trial-event.dto';

@Entity('trial_events')
export class TrialEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: TrialEventType })
  type: TrialEventType;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ nullable: true })
  location: string;

  @Column()
  caseId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  attendees: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
