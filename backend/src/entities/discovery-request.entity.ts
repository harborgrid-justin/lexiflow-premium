import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Case } from './case.entity';

@Entity('discovery_requests')
@Index(['caseId'])
@Index(['type'])
@Index(['status'])
@Index(['dueDate'])
export class DiscoveryRequest extends BaseEntity {
  @Column({ type: 'uuid' })
  caseId: string;

  @Column({
    type: 'enum',
    enum: [
      'interrogatories',
      'requests_for_production',
      'requests_for_admission',
      'subpoena',
      'deposition_notice',
      'inspection_request',
      'other',
    ],
  })
  type: string;

  @Column({ type: 'varchar', length: 100 })
  requestNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({ type: 'date' })
  requestDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: [
      'draft',
      'sent',
      'received',
      'in_progress',
      'completed',
      'overdue',
      'objected',
    ],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestedFrom: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer', nullable: true })
  numberOfItems: number;

  @Column({ type: 'date', nullable: true })
  responseDate: Date;

  @Column({ type: 'text', nullable: true })
  responseDetails: string;

  @Column({ type: 'boolean', default: false })
  hasObjections: boolean;

  @Column({ type: 'text', nullable: true })
  objections: string;

  @Column({ type: 'date', nullable: true })
  objectionDeadline: Date;

  @Column({ type: 'boolean', default: false })
  isExtensionGranted: boolean;

  @Column({ type: 'date', nullable: true })
  extendedDueDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentPath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  responsePath: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedDocuments: string[];

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ type: 'integer', default: 0 })
  completionPercentage: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Case, (caseEntity) => caseEntity.discoveryRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caseId' })
  case: Case;
}
