import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
import { Case } from './case.entity';

export enum TimelineEventType {
  CASE_CREATED = 'Case Created',
  CASE_UPDATED = 'Case Updated',
  STATUS_CHANGED = 'Status Changed',
  PARTY_ADDED = 'Party Added',
  PARTY_REMOVED = 'Party Removed',
  TEAM_MEMBER_ASSIGNED = 'Team Member Assigned',
  TEAM_MEMBER_REMOVED = 'Team Member Removed',
  DOCUMENT_UPLOADED = 'Document Uploaded',
  MOTION_FILED = 'Motion Filed',
  MOTION_DECIDED = 'Motion Decided',
  DEADLINE_ADDED = 'Deadline Added',
  DEADLINE_MET = 'Deadline Met',
  DEADLINE_MISSED = 'Deadline Missed',
  NOTE_ADDED = 'Note Added',
  HEARING_SCHEDULED = 'Hearing Scheduled',
  DISCOVERY_EVENT = 'Discovery Event',
  SETTLEMENT_NEGOTIATION = 'Settlement Negotiation',
  TRIAL_DATE_SET = 'Trial Date Set',
  VERDICT_RENDERED = 'Verdict Rendered',
  CASE_CLOSED = 'Case Closed',
  CASE_ARCHIVED = 'Case Archived',
  CUSTOM = 'Custom',
}

@Entity('case_timeline')
export class CaseTimelineEvent extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({
    type: 'enum',
    enum: TimelineEventType,
  })
  eventType: TimelineEventType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  eventDate: Date;
}
