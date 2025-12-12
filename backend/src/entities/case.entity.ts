import { Entity, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Party } from './party.entity';
import { CaseTeamMember } from './case-team-member.entity';
import { CasePhase } from './case-phase.entity';
import { Motion } from './motion.entity';
import { DocketEntry } from './docket-entry.entity';
import { Project } from './project.entity';
import { TimeEntry } from './time-entry.entity';
import { Invoice } from './invoice.entity';
import { LegalDocument } from './legal-document.entity';
import { DiscoveryRequest } from './discovery-request.entity';
import { Deposition } from './deposition.entity';
import { EvidenceItem } from './evidence-item.entity';
import { ConflictCheck } from './conflict-check.entity';
import { Client } from './client.entity';

@Entity('cases')
@Index(['caseNumber'], { unique: true })
@Index(['status'])
@Index(['caseType'])
@Index(['filingDate'])
export class Case extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  caseNumber: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  caseType: string;

  @Column({
    type: 'enum',
    enum: ['open', 'pending', 'closed', 'archived', 'on_hold'],
    default: 'open',
  })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  jurisdictionId: string;

  @Column({ type: 'uuid', nullable: true })
  clientId: string;

  @Column({ type: 'date', nullable: true })
  filingDate: Date;

  @Column({ type: 'date', nullable: true })
  closedDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  practiceArea: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  courtName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  judgeAssigned: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedValue: number;

  @Column({ type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Client, (client) => client.cases, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @OneToMany(() => Party, (party) => party.case, { cascade: true })
  parties: Party[];

  @OneToMany(() => CaseTeamMember, (member) => member.case, { cascade: true })
  teamMembers: CaseTeamMember[];

  @OneToMany(() => CasePhase, (phase) => phase.case, { cascade: true })
  phases: CasePhase[];

  @OneToMany(() => Motion, (motion) => motion.case, { cascade: true })
  motions: Motion[];

  @OneToMany(() => DocketEntry, (entry) => entry.case, { cascade: true })
  docketEntries: DocketEntry[];

  @OneToMany(() => Project, (project) => project.case, { cascade: true })
  projects: Project[];

  @OneToMany(() => TimeEntry, (entry) => entry.case, { cascade: true })
  timeEntries: TimeEntry[];

  @OneToMany(() => Invoice, (invoice) => invoice.case, { cascade: true })
  invoices: Invoice[];

  @OneToMany(() => LegalDocument, (document) => document.case, { cascade: true })
  documents: LegalDocument[];

  @OneToMany(() => DiscoveryRequest, (request) => request.case, { cascade: true })
  discoveryRequests: DiscoveryRequest[];

  @OneToMany(() => Deposition, (deposition) => deposition.case, { cascade: true })
  depositions: Deposition[];

  @OneToMany(() => EvidenceItem, (evidence) => evidence.case, { cascade: true })
  evidenceItems: EvidenceItem[];

  @OneToMany(() => ConflictCheck, (check) => check.case, { cascade: true })
  conflictChecks: ConflictCheck[];
}
