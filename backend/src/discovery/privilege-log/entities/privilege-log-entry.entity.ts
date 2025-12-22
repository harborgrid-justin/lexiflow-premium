import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Case } from '../../../cases/entities/case.entity';

export enum PrivilegeType {
  ATTORNEY_CLIENT = 'attorney_client',
  WORK_PRODUCT = 'work_product',
  ATTORNEY_CLIENT_WORK_PRODUCT = 'attorney_client_work_product',
  COMMON_INTEREST = 'common_interest',
  JOINT_DEFENSE = 'joint_defense',
  DELIBERATIVE_PROCESS = 'deliberative_process',
  SETTLEMENT_NEGOTIATION = 'settlement_negotiation',
  OTHER = 'other',
}

export enum PrivilegeStatus {
  CLAIMED = 'claimed',
  CHALLENGED = 'challenged',
  UPHELD = 'upheld',
  WAIVED = 'waived',
  OVERRULED = 'overruled',
  PRODUCED = 'produced',
}

@Entity('privilege_log_entries')
@Index(['caseId'])
@Index(['documentId'])
@Index(['privilegeType'])
@Index(['status'])
export class PrivilegeLogEntry extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({ name: 'privilege_log_number', type: 'varchar', length: 100 })
  privilegeLogNumber!: string;

  @Column({ name: 'bates_number', type: 'varchar', length: 100, nullable: true })
  batesNumber!: string;

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string;

  @Column({ name: 'document_description', type: 'text', nullable: true })
  documentDescription!: string;

  @Column({ name: 'document_date', type: 'date', nullable: true })
  documentDate!: Date;

  @Column({ name: 'document_type', type: 'varchar', length: 100, nullable: true })
  documentType!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sender!: string;

  @Column({ type: 'jsonb', nullable: true })
  recipients!: string[];

  @Column({ type: 'jsonb', nullable: true })
  cc!: string[];

  @Column({ type: 'jsonb', nullable: true })
  bcc!: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  subject!: string;

  @Column({
    name: 'privilege_type',
    type: 'enum',
    enum: PrivilegeType,
  })
  privilegeType!: PrivilegeType;

  @Column({ name: 'privilege_description', type: 'text', nullable: true })
  privilegeDescription!: string;

  @Column({ name: 'privilege_basis', type: 'text', nullable: true })
  privilegeBasis!: string;

  @Column({
    type: 'enum',
    enum: PrivilegeStatus,
    default: PrivilegeStatus.CLAIMED,
  })
  status!: PrivilegeStatus;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string;

  @Column({ name: 'review_date', type: 'timestamp', nullable: true })
  reviewDate!: Date;

  @Column({ name: 'date_challenged', type: 'date', nullable: true })
  dateChallenged!: Date;

  @Column({ name: 'is_redacted', type: 'boolean', default: false })
  isRedacted!: boolean;

  @Column({ name: 'page_count', type: 'integer', nullable: true })
  pageCount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
