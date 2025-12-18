import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum MatterStatus {
  INTAKE = 'ACTIVE', // Database uses 'ACTIVE' - no 'INTAKE' in DB enum
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum MatterType {
  LITIGATION = 'LITIGATION',
  TRANSACTIONAL = 'TRANSACTIONAL',
  ADVISORY = 'ADVISORY',
  COMPLIANCE = 'CORPORATE', // No COMPLIANCE in DB, map to CORPORATE
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  EMPLOYMENT = 'EMPLOYMENT',
  REAL_ESTATE = 'REAL_ESTATE',
  CORPORATE = 'CORPORATE',
  OTHER = 'OTHER',
}

export enum MatterPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('matters')
export class Matter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'matternumber', unique: true })
  matterNumber: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MatterStatus,
    default: MatterStatus.INTAKE,
  })
  status: MatterStatus;

  @Column({
    name: 'type',
    type: 'enum',
    enum: MatterType,
    default: MatterType.OTHER,
  })
  matterType: MatterType;

  @Column({
    type: 'enum',
    enum: MatterPriority,
    default: MatterPriority.MEDIUM,
  })
  priority: MatterPriority;

  // Client Information
  @Column({ name: 'clientid', nullable: true })
  clientId: string;

  @Column({ name: 'clientname', nullable: true })
  clientName: string;

  // Assignment
  @Column({ name: 'responsibleattorneyid', nullable: true })
  leadAttorneyId: string;

  @Column({ name: 'responsibleattorneyname', nullable: true })
  leadAttorneyName: string;

  @Column({ name: 'originatingattorneyid', nullable: true })
  originatingAttorneyId: string;

  @Column({ name: 'originatingattorneyname', nullable: true })
  originatingAttorneyName: string;

  // Jurisdictional Information
  @Column({ nullable: true })
  jurisdiction: string;

  @Column({ nullable: true })
  venue: string;

  // Financial
  @Column({ name: 'billingarrangement', nullable: true })
  billingType: string;

  @Column({ name: 'hourlyrate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ name: 'flatfee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  flatFee: number;

  @Column({ name: 'contingencypercentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  contingencyPercentage: number;

  @Column({ name: 'retaineramount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  retainerAmount: number;

  @Column({ name: 'estimatedvalue', type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedValue: number;

  @Column({ name: 'budgetamount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetAmount: number;

  // Dates
  @Column({ name: 'openeddate', type: 'date' })
  openedDate: Date;

  @Column({ name: 'targetclosedate', type: 'date', nullable: true })
  targetCloseDate: Date;

  @Column({ name: 'actualclosedate', type: 'date', nullable: true })
  closedDate: Date;

  @Column({ name: 'statuteoflimitationsdate', type: 'date', nullable: true })
  statute_of_limitations: Date;

  // Practice Area & Tags
  @Column({ name: 'practicearea', nullable: true })
  practiceArea: string;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[];

  // Opposing Party
  @Column({ name: 'opposingcounsel', type: 'jsonb', nullable: true })
  opposingCounsel: any;

  // Risk & Conflict
  @Column({ name: 'conflictcheckcompleted', type: 'boolean', default: false })
  conflictCheckCompleted: boolean;

  @Column({ name: 'conflictcheckdate', type: 'date', nullable: true })
  conflictCheckDate: Date;

  @Column({ name: 'conflictchecknotes', type: 'text', nullable: true })
  conflictCheckNotes: string;

  @Column({ name: 'officelocation', nullable: true })
  officeLocation: string;

  // Resources
  @Column({ name: 'relatedmatterids', type: 'jsonb', nullable: true })
  relatedMatterIds: any;

  // Notes & Custom Fields
  @Column({ name: 'internalnotes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'customfields', type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  // Metadata
  @Column({ name: 'createdby' })
  createdBy: string;

  @Column({ name: 'updatedby', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'createdat' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedat' })
  updatedAt: Date;
}
