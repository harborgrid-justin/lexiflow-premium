import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { Case } from '../../../cases/entities/case.entity';

export enum DiscoveryRequestType {
  RFP = 'RFP', // Request for Production
  ROG = 'ROG', // Interrogatories
  RFA = 'RFA', // Request for Admission
  SUBPOENA = 'SUBPOENA',
  DEPOSITION_NOTICE = 'DEPOSITION_NOTICE',
  INSPECTION_REQUEST = 'INSPECTION_REQUEST',
  OTHER = 'OTHER',
}

export enum DiscoveryRequestStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  IN_REVIEW = 'IN_REVIEW',
  RESPONDED = 'RESPONDED',
  OBJECTED = 'OBJECTED',
  OVERDUE = 'OVERDUE',
  COMPLETED = 'COMPLETED',
}

@Entity('discovery_requests')
@Index(['caseId'])
@Index(['type'])
@Index(['status'])
@Index(['dueDate'])
export class DiscoveryRequest extends BaseEntity {
  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({
    type: 'enum',
    enum: DiscoveryRequestType,
  })
  type!: DiscoveryRequestType;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: DiscoveryRequestStatus,
    default: DiscoveryRequestStatus.DRAFT,
  })
  status!: DiscoveryRequestStatus;

  @Column({ name: 'request_number', type: 'varchar', length: 50, nullable: true })
  requestNumber!: string;

  @Column({ name: 'date_sent', type: 'date', nullable: true })
  dateSent!: Date;

  @Column({ name: 'date_received', type: 'date', nullable: true })
  dateReceived!: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate!: Date;

  @Column({ name: 'date_responded', type: 'date', nullable: true })
  dateResponded!: Date;

  @Column({ name: 'requesting_party', type: 'varchar', length: 200, nullable: true })
  requestingParty!: string;

  @Column({ name: 'responding_party', type: 'varchar', length: 200, nullable: true })
  respondingParty!: string;

  @Column({ name: 'number_of_requests', type: 'int', default: 0 })
  numberOfRequests!: number;

  @Column({ name: 'number_of_responses', type: 'int', default: 0 })
  numberOfResponses!: number;

  @Column({ name: 'number_of_objections', type: 'int', default: 0 })
  numberOfObjections!: number;

  @Column({ name: 'request_items', type: 'jsonb', nullable: true })
  requestItems!: any[];

  @Column({ type: 'jsonb', nullable: true })
  responses!: any[];

  @Column({ type: 'jsonb', nullable: true })
  objections!: any[];

  // Fields from generic
  @Column({ name: 'objection_deadline', type: 'date', nullable: true })
  objectionDeadline!: Date;

  @Column({ name: 'is_extension_granted', type: 'boolean', default: false })
  isExtensionGranted!: boolean;

  @Column({ name: 'extended_due_date', type: 'date', nullable: true })
  extendedDueDate!: Date;

  @Column({ name: 'document_path', type: 'varchar', length: 500, nullable: true })
  documentPath!: string;

  @Column({ name: 'response_path', type: 'varchar', length: 500, nullable: true })
  responsePath!: string;

  @Column({ name: 'related_documents', type: 'jsonb', nullable: true })
  relatedDocuments!: string[];

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo!: string;
}
