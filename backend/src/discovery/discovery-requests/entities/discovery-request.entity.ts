import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum DiscoveryRequestType {
  RFP = 'RFP', // Request for Production
  ROG = 'ROG', // Interrogatories
  RFA = 'RFA', // Request for Admission
  SUBPOENA = 'SUBPOENA',
  DEPOSITION_NOTICE = 'DEPOSITION_NOTICE',
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
export class DiscoveryRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  caseId: string;

  @Column({
    type: 'enum',
    enum: DiscoveryRequestType,
  })
  type: DiscoveryRequestType;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DiscoveryRequestStatus,
    default: DiscoveryRequestStatus.DRAFT,
  })
  status: DiscoveryRequestStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  requestNumber: string;

  @Column({ type: 'date', nullable: true })
  dateSent: Date;

  @Column({ type: 'date', nullable: true })
  dateReceived: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  dateResponded: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  requestingParty: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  respondingParty: string;

  @Column({ type: 'int', default: 0 })
  numberOfRequests: number;

  @Column({ type: 'int', default: 0 })
  numberOfResponses: number;

  @Column({ type: 'int', default: 0 })
  numberOfObjections: number;

  @Column({ type: 'jsonb', nullable: true })
  requestItems: any[];

  @Column({ type: 'jsonb', nullable: true })
  responses: any[];

  @Column({ type: 'jsonb', nullable: true })
  objections: any[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string;

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
