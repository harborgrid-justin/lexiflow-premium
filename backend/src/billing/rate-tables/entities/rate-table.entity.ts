import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('rate_tables')
@Index(['firmId', 'isActive'])
export class RateTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'firm_id', type: 'uuid' })
  @Index()
  firmId: string;

  @Column({ type: 'date' })
  effectiveDate: string;

  @Column({ type: 'date', nullable: true })
  expirationDate: string;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'jsonb' })
  rates: RateTableEntry[];

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}

export interface RateTableEntry {
  userId?: string;
  role?: string;
  practiceArea?: string;
  yearsExperience?: number;
  rate: number;
  effectiveDate?: string;
  description?: string;
}
