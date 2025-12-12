import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PrivilegeType {
  ATTORNEY_CLIENT = 'ATTORNEY_CLIENT',
  WORK_PRODUCT = 'WORK_PRODUCT',
  ATTORNEY_CLIENT_WORK_PRODUCT = 'ATTORNEY_CLIENT_WORK_PRODUCT',
  COMMON_INTEREST = 'COMMON_INTEREST',
  JOINT_DEFENSE = 'JOINT_DEFENSE',
  DELIBERATIVE_PROCESS = 'DELIBERATIVE_PROCESS',
  OTHER = 'OTHER',
}

export enum PrivilegeStatus {
  CLAIMED = 'CLAIMED',
  CHALLENGED = 'CHALLENGED',
  UPHELD = 'UPHELD',
  WAIVED = 'WAIVED',
  OVERRULED = 'OVERRULED',
  PRODUCED = 'PRODUCED',
}

@Entity('privilege_log_entries')
export class PrivilegeLogEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 100 })
  privilegeLogNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batesNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  documentId: string;

  @Column({ type: 'date' })
  documentDate: Date;

  @Column({ type: 'varchar', length: 300 })
  author: string;

  @Column({ type: 'jsonb', nullable: true })
  recipients: string[];

  @Column({ type: 'jsonb', nullable: true })
  ccRecipients: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  documentType: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: PrivilegeType,
  })
  privilegeType: PrivilegeType;

  @Column({ type: 'text', nullable: true })
  privilegeBasis: string;

  @Column({
    type: 'enum',
    enum: PrivilegeStatus,
    default: PrivilegeStatus.CLAIMED,
  })
  status: PrivilegeStatus;

  @Column({ type: 'boolean', default: false })
  isRedacted: boolean;

  @Column({ type: 'text', nullable: true })
  redactionDetails: string;

  @Column({ type: 'int', nullable: true })
  pageCount: number;

  @Column({ type: 'varchar', length: 300, nullable: true })
  custodian: string;

  @Column({ type: 'uuid', nullable: true })
  custodianId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'text', nullable: true })
  challengeNotes: string;

  @Column({ type: 'date', nullable: true })
  dateChallenged: Date;

  @Column({ type: 'date', nullable: true })
  dateResolved: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
