import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity';

export enum ProductionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ProductionFormat {
  NATIVE = 'native',
  TIFF = 'tiff',
  PDF = 'pdf',
  LOAD_FILE = 'load_file',
}

@Entity('productions')
export class Production {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'uuid' })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Column({ type: 'enum', enum: ProductionStatus, default: ProductionStatus.PENDING })
  status: ProductionStatus;

  @Column({ type: 'enum', enum: ProductionFormat })
  format: ProductionFormat;

  @Column({ type: 'varchar', length: 50 })
  productionNumber: string;

  @Column({ type: 'date', nullable: true })
  productionDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  producedTo: string;

  @Column({ type: 'int', default: 0 })
  totalDocuments: number;

  @Column({ type: 'int', default: 0 })
  totalPages: number;

  @Column({ type: 'bigint', default: 0 })
  totalSize: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  outputPath: string;

  @Column({ type: 'boolean', default: false })
  includeMetadata: boolean;

  @Column({ type: 'boolean', default: false })
  includeNatives: boolean;

  @Column({ type: 'boolean', default: false })
  includeText: boolean;

  @Column({ type: 'boolean', default: false })
  includeImages: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  beginBates: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  endBates: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
