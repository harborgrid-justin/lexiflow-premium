import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Index,
} from 'typeorm';

export enum TrustAccountType {
  IOLTA = 'IOLTA', // Interest on Lawyers Trust Account
  CLIENT_TRUST = 'Client Trust',
  OPERATING = 'Operating',
}

export enum TrustAccountStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  FROZEN = 'Frozen',
  CLOSED = 'Closed',
}

@Entity('trust_accounts')
@Index(['clientId', 'status'])
@Index(['caseId', 'status'])
export class TrustAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'account_number', type: 'varchar', length: 100, unique: true })
  accountNumber!: string;

  @Column({ name: 'account_name', type: 'varchar', length: 255 })
  accountName!: string;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: TrustAccountType,
    default: TrustAccountType.CLIENT_TRUST,
  })
  accountType!: TrustAccountType;

  @Column({ name: 'client_id', type: 'uuid' })
  @Index()
  clientId!: string;

  @Column({ name: 'client_name', type: 'varchar', length: 255 })
  clientName!: string;

  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  @Index()
  caseId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: TrustAccountStatus,
    default: TrustAccountStatus.ACTIVE,
  })
  @Index()
  status!: TrustAccountStatus;

  @Column({ name: 'bank_name', type: 'varchar', length: 255, nullable: true })
  bankName!: string;

  @Column({ name: 'bank_account_number', type: 'varchar', length: 100, nullable: true })
  bankAccountNumber!: string;

  @Column({ name: 'routing_number', type: 'varchar', length: 50, nullable: true })
  routingNumber!: string;

  @Column({ type: 'text', nullable: true })
  purpose!: string;

  @Column({ name: 'opened_date', type: 'date', nullable: true })
  openedDate!: string;

  @Column({ name: 'closed_date', type: 'date', nullable: true })
  closedDate!: string;

  @Column({ name: 'minimum_balance', type: 'decimal', precision: 12, scale: 2, default: 0 })
  minimumBalance!: number;

  @Column({ name: 'interest_bearing', type: 'boolean', default: false })
  interestBearing!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @VersionColumn()
  version!: number;

  @Column({ name: 'responsible_attorney', type: 'uuid', nullable: true })
  responsibleAttorney!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date;
}
