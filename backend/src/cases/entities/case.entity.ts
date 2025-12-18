import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../entities/base.entity';
import { Client } from '../../entities/client.entity';
import { EvidenceItem } from '../../entities/evidence-item.entity';
import { ConflictCheck } from '../../entities/conflict-check.entity';
import { Party } from '../../entities/party.entity';

export enum CaseType {
  CIVIL = 'Civil',
  CRIMINAL = 'Criminal',
  FAMILY = 'Family',
  BANKRUPTCY = 'Bankruptcy',
  IMMIGRATION = 'Immigration',
  INTELLECTUAL_PROPERTY = 'Intellectual Property',
  CORPORATE = 'Corporate',
  REAL_ESTATE = 'Real Estate',
  LABOR = 'Labor',
  ENVIRONMENTAL = 'Environmental',
  TAX = 'Tax',
}

export enum CaseStatus {
  OPEN = 'Open',
  OPEN_LOWER = 'open',
  ACTIVE = 'Active',
  PENDING = 'pending',
  DISCOVERY = 'Discovery',
  TRIAL = 'Trial',
  SETTLED = 'Settled',
  CLOSED = 'Closed',
  CLOSED_LOWER = 'closed',
  ARCHIVED = 'Archived',
  ARCHIVED_LOWER = 'archived',
  ON_HOLD = 'On Hold',
  ON_HOLD_LOWER = 'on_hold',
}

@Entity('cases')
export class Case extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  caseNumber: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CaseType,
    default: CaseType.CIVIL,
  })
  type: CaseType;

  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  status: CaseStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  practiceArea?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jurisdiction?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  court?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  judge?: string;

  @Column({ type: 'date', nullable: true })
  filingDate?: Date;

  @Column({ type: 'date', nullable: true })
  trialDate?: Date;

  @Column({ type: 'date', nullable: true })
  closeDate?: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedTeamId?: string;

  @Column({ type: 'uuid', nullable: true })
  leadAttorneyId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'uuid', nullable: true })
  clientId?: string;

  @ManyToOne(() => Client, (client) => client.cases, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client?: Client;

  @OneToMany(() => EvidenceItem, (evidenceItem) => evidenceItem.case)
  evidenceItems: EvidenceItem[];

  @OneToMany(() => ConflictCheck, (conflictCheck) => conflictCheck.case)
  conflictChecks: ConflictCheck[];

  @OneToMany(() => Party, (party) => party.case)
  parties: Party[];
}
