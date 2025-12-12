import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('privilege_log_entries')
@Index(['caseId'])
@Index(['documentId'])
@Index(['privilegeType'])
@Index(['reviewedBy'])
export class PrivilegeLogEntry extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  documentId: string;

  @Column({ type: 'varchar', length: 100 })
  entryNumber: string;

  @Column({ type: 'varchar', length: 500 })
  documentDescription: string;

  @Column({ type: 'date', nullable: true })
  documentDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({ type: 'jsonb', nullable: true })
  recipients: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  sender: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  documentType: string;

  @Column({
    type: 'enum',
    enum: [
      'attorney_client',
      'work_product',
      'attorney_work_product',
      'joint_defense',
      'common_interest',
      'settlement_negotiation',
      'other',
    ],
  })
  privilegeType: string;

  @Column({ type: 'text' })
  privilegeReason: string;

  @Column({ type: 'text', nullable: true })
  basisForPrivilege: string;

  @Column({ type: 'uuid' })
  reviewedBy: string;

  @Column({ type: 'date' })
  reviewDate: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvalDate: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'disputed', 'waived', 'withdrawn'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'boolean', default: false })
  isWithheld: boolean;

  @Column({ type: 'boolean', default: false })
  isRedacted: boolean;

  @Column({ type: 'text', nullable: true })
  redactionDetails: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batesNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  controlNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  originalFilePath: string;

  @Column({ type: 'integer', nullable: true })
  pageCount: number;

  @Column({ type: 'boolean', default: false })
  hasAttachments: boolean;

  @Column({ type: 'integer', default: 0 })
  attachmentCount: number;

  @Column({ type: 'text', nullable: true })
  disputeReason: string;

  @Column({ type: 'date', nullable: true })
  disputeDate: Date;

  @Column({ type: 'uuid', nullable: true })
  disputedBy: string;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ type: 'date', nullable: true })
  resolutionDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  relatedDocuments: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
