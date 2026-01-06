import { Client } from "@clients/entities/client.entity";
import { BaseEntity } from "@common/base/base.entity";
import { ConflictCheck } from "@compliance/conflict-checks/entities/conflict-check.entity";
import { EvidenceItem } from "@evidence/entities/evidence-item.entity";
import { Party } from "@parties/entities/party.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

export enum CaseType {
  CIVIL = "Civil",
  CRIMINAL = "Criminal",
  FAMILY = "Family",
  BANKRUPTCY = "Bankruptcy",
  IMMIGRATION = "Immigration",
  INTELLECTUAL_PROPERTY = "Intellectual Property",
  CORPORATE = "Corporate",
  REAL_ESTATE = "Real Estate",
  LABOR = "Labor",
  ENVIRONMENTAL = "Environmental",
  TAX = "Tax",
}

export enum CaseStatus {
  OPEN = "Open",
  OPEN_LOWER = "open",
  ACTIVE = "Active",
  PENDING = "pending",
  DISCOVERY = "Discovery",
  TRIAL = "Trial",
  SETTLED = "Settled",
  CLOSED = "Closed",
  CLOSED_LOWER = "closed",
  ARCHIVED = "Archived",
  ARCHIVED_LOWER = "archived",
  ON_HOLD = "On Hold",
  ON_HOLD_LOWER = "on_hold",
  CONSOLIDATED = "Consolidated",
  CONSOLIDATED_LOWER = "consolidated",
}

@Entity("cases")
@Index(["status"])
@Index(["practiceArea"])
@Index(["jurisdiction"])
@Index(["assignedTeamId"])
@Index(["leadAttorneyId"])
@Index(["clientId"])
@Index(["isArchived"])
export class Case extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ name: "case_number", type: "varchar", length: 100, unique: true })
  caseNumber!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: CaseType,
    default: CaseType.CIVIL,
  })
  type!: CaseType;

  @Column({
    type: "enum",
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  status!: CaseStatus;

  @Column({
    name: "practice_area",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  practiceArea?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  jurisdiction?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  court?: string;

  @Column({
    name: "cause_of_action",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  causeOfAction?: string;

  @Column({
    name: "nature_of_suit",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  natureOfSuit?: string;

  @Column({
    name: "nature_of_suit_code",
    type: "varchar",
    length: 10,
    nullable: true,
  })
  natureOfSuitCode?: string;

  @Column({ name: "related_cases", type: "jsonb", nullable: true })
  relatedCases?: { court: string; caseNumber: string; relationship?: string }[];

  @Column({
    name: "originating_court",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  originatingCourt?: string;

  @Column({
    name: "originating_case_number",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  originatingCaseNumber?: string;

  @Column({
    name: "originating_judge",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  originatingJudge?: string;

  @Column({
    name: "date_filed_in_originating_court",
    type: "date",
    nullable: true,
  })
  dateFiledInOriginatingCourt?: Date;

  @Column({ name: "originating_case_info", type: "jsonb", nullable: true })
  originatingCaseInfo?: Record<string, unknown>;

  @Column({ type: "varchar", length: 100, nullable: true })
  judge?: string;

  @Column({
    name: "referred_judge",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  referredJudge?: string;

  @Column({
    name: "magistrate_judge",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  magistrateJudge?: string;

  @Column({ name: "filing_date", type: "date", nullable: true })
  filingDate?: Date;

  @Column({ name: "trial_date", type: "date", nullable: true })
  trialDate?: Date;

  @Column({ name: "close_date", type: "date", nullable: true })
  closeDate?: Date;

  @Column({ name: "date_terminated", type: "date", nullable: true })
  dateTerminated?: Date;

  @Column({ name: "jury_demand", type: "varchar", length: 50, nullable: true })
  juryDemand?: string;

  @Column({ name: "assigned_team_id", type: "uuid", nullable: true })
  assignedTeamId?: string;

  @Column({ name: "lead_attorney_id", type: "uuid", nullable: true })
  leadAttorneyId?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ name: "is_archived", type: "boolean", default: false })
  isArchived!: boolean;

  @Column({ name: "client_id", type: "uuid", nullable: true })
  clientId?: string;

  @ManyToOne(() => Client, (client) => client.cases, { nullable: true })
  @JoinColumn({ name: "client_id" })
  client?: Client;

  @OneToMany(() => EvidenceItem, (evidenceItem) => evidenceItem.case)
  evidenceItems!: EvidenceItem[];

  @OneToMany(() => ConflictCheck, (conflictCheck) => conflictCheck.case)
  conflictChecks!: ConflictCheck[];

  @OneToMany(() => Party, (party) => party.case)
  parties!: Party[];
}
