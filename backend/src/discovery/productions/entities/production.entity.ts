import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  QC_REVIEW = 'QC_REVIEW',
  READY = 'READY',
  PRODUCED = 'PRODUCED',
  COMPLETED = 'COMPLETED',
}

export enum ProductionFormat {
  NATIVE = 'NATIVE',
  PDF = 'PDF',
  TIFF = 'TIFF',
  LOAD_FILE = 'LOAD_FILE',
  PAPER = 'PAPER',
}

@Entity('productions')
export class Production {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'varchar', length: 300 })
  productionName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productionNumber: string;

  @Column({
    type: 'enum',
    enum: ProductionStatus,
    default: ProductionStatus.PLANNED,
  })
  status: ProductionStatus;

  @Column({
    type: 'enum',
    enum: ProductionFormat,
  })
  format: ProductionFormat;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  recipientParty: string;

  @Column({ type: 'date', nullable: true })
  requestDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  productionDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  batesPrefix: string;

  @Column({ type: 'bigint', nullable: true })
  batesStart: number;

  @Column({ type: 'bigint', nullable: true })
  batesEnd: number;

  @Column({ type: 'int', default: 0 })
  totalDocuments: number;

  @Column({ type: 'int', default: 0 })
  totalPages: number;

  @Column({ type: 'bigint', nullable: true })
  totalSize: number; // in bytes

  @Column({ type: 'varchar', length: 500, nullable: true })
  outputPath: string;

  @Column({ type: 'jsonb', nullable: true })
  volumes: Array<{
    volumeNumber: number;
    volumeName: string;
    documentCount: number;
    pageCount: number;
    path: string;
  }>;

  @Column({ type: 'boolean', default: false })
  includePrivilegeLog: boolean;

  @Column({ type: 'boolean', default: false })
  includeRedactions: boolean;

  @Column({ type: 'jsonb', nullable: true })
  searchCriteria: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  productionNotes: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  deliveryMethod: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  trackingNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  productionCost: number;

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
