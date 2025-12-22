import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CustodianStatus {
  IDENTIFIED = 'IDENTIFIED',
  NOTIFIED = 'NOTIFIED',
  INTERVIEWED = 'INTERVIEWED',
  DATA_COLLECTED = 'DATA_COLLECTED',
  HOLD_RELEASED = 'HOLD_RELEASED',
  INACTIVE = 'INACTIVE',
}

@Entity('custodians')
export class Custodian {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'case_id', type: 'uuid' })
  caseId!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 200 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 200 })
  lastName!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 400 })
  fullName!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  department!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  organization!: string;

  @Column({
    type: 'enum',
    enum: CustodianStatus,
    default: CustodianStatus.IDENTIFIED,
  })
  status!: CustodianStatus;

  @Column({ name: 'date_identified', type: 'date', nullable: true })
  dateIdentified!: Date;

  @Column({ name: 'date_notified', type: 'date', nullable: true })
  dateNotified!: Date;

  @Column({ name: 'date_interviewed', type: 'date', nullable: true })
  dateInterviewed!: Date;

  @Column({ name: 'data_collection_date', type: 'date', nullable: true })
  dataCollectionDate!: Date;

  @Column({ name: 'is_key_player', type: 'boolean', default: false })
  isKeyPlayer!: boolean;

  @Column({ type: 'text', nullable: true })
  relevance!: string;

  @Column({ name: 'data_sources', type: 'jsonb', nullable: true })
  dataSources!: Array<{
    sourceId: string;
    sourceName: string;
    sourceType: string;
    status: string;
  }>;

  @Column({ name: 'is_on_legal_hold', type: 'boolean', default: false })
  isOnLegalHold!: boolean;

  @Column({ name: 'legal_hold_id', type: 'uuid', nullable: true })
  legalHoldId!: string;

  @Column({ name: 'legal_hold_date', type: 'date', nullable: true })
  legalHoldDate!: Date;

  @Column({ name: 'legal_hold_released_date', type: 'date', nullable: true })
  legalHoldReleasedDate!: Date;

  @Column({ name: 'acknowledged_at', type: 'timestamp', nullable: true })
  acknowledgedAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  interviews!: Array<{
    date: Date;
    interviewer: string;
    summary: string;
  }>;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo!: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date;
}
