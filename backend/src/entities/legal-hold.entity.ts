import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('legal_holds')
@Index(['caseId'])
@Index(['custodianId'])
@Index(['status'])
@Index(['startDate'])
export class LegalHold extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  custodianId: string;

  @Column({ type: 'varchar', length: 255 })
  custodianName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  custodianEmail: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  custodianDepartment: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: [
      'active',
      'acknowledged',
      'compliant',
      'non_compliant',
      'released',
      'expired',
    ],
    default: 'active',
  })
  status: string;

  @Column({ type: 'text' })
  holdNotice: string;

  @Column({ type: 'date', nullable: true })
  noticeIssuedDate: Date;

  @Column({ type: 'date', nullable: true })
  acknowledgmentDate: Date;

  @Column({ type: 'boolean', default: false })
  isAcknowledged: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  acknowledgmentMethod: string;

  @Column({ type: 'text', nullable: true })
  scopeDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  dataSources: string[];

  @Column({ type: 'jsonb', nullable: true })
  documentTypes: string[];

  @Column({ type: 'date', nullable: true })
  dateRangeStart: Date;

  @Column({ type: 'date', nullable: true })
  dateRangeEnd: Date;

  @Column({ type: 'jsonb', nullable: true })
  searchTerms: string[];

  @Column({ type: 'uuid', nullable: true })
  issuedBy: string;

  @Column({ type: 'uuid', nullable: true })
  releasedBy: string;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ type: 'text', nullable: true })
  releaseReason: string;

  @Column({ type: 'integer', default: 0 })
  reminderCount: number;

  @Column({ type: 'date', nullable: true })
  lastReminderDate: Date;

  @Column({ type: 'integer', nullable: true })
  reminderFrequencyDays: number;

  @Column({ type: 'boolean', default: false })
  requiresEscalation: boolean;

  @Column({ type: 'date', nullable: true })
  escalationDate: Date;

  @Column({ type: 'uuid', nullable: true })
  escalatedTo: string;

  @Column({ type: 'text', nullable: true })
  complianceNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  communicationHistory: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
