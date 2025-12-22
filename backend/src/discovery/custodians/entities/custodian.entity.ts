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

  @Column({ type: 'uuid' })
  caseId!: string;

  @Column({ type: 'varchar', length: 200 })
  firstName!: string;

  @Column({ type: 'varchar', length: 200 })
  lastName!: string;

  @Column({ type: 'varchar', length: 400 })
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

  @Column({ type: 'date', nullable: true })
  dateIdentified!: Date;

  @Column({ type: 'date', nullable: true })
  dateNotified!: Date;

  @Column({ type: 'date', nullable: true })
  dateInterviewed!: Date;

  @Column({ type: 'date', nullable: true })
  dataCollectionDate!: Date;

  @Column({ type: 'boolean', default: false })
  isKeyPlayer!: boolean;

  @Column({ type: 'text', nullable: true })
  relevance!: string;

  @Column({ type: 'jsonb', nullable: true })
  dataSources!: Array<{
    sourceId: string;
    sourceName: string;
    sourceType: string;
    status: string;
  }>;

  @Column({ type: 'boolean', default: false })
  isOnLegalHold!: boolean;

  @Column({ type: 'uuid', nullable: true })
  legalHoldId!: string;

  @Column({ type: 'date', nullable: true })
  legalHoldDate!: Date;

  @Column({ type: 'date', nullable: true })
  legalHoldReleasedDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
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

  @Column({ type: 'uuid', nullable: true })
  assignedTo!: string;

  @Column({ type: 'uuid' })
  createdBy!: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date;
}
