import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';

export interface RateTableEntry {
  userId?: string;
  role?: string;
  practiceArea?: string;
  yearsExperience?: number;
  rate: number;
  effectiveDate?: string;
  description?: string;
}

@Entity('rate_tables')
@Index(['firmId', 'isActive'])
@Index(['name'])
@Index(['effectiveDate'])
export class RateTable extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'firm_id', type: 'uuid', nullable: true })
  @Index()
  firmId!: string;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate!: Date;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive!: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ type: 'jsonb' })
  rates!: RateTableEntry[];

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId!: string;

  @Column({ name: 'client_type', type: 'varchar', length: 200, nullable: true })
  clientType!: string;

  @Column({ name: 'overtime_multiplier', type: 'decimal', precision: 5, scale: 2, nullable: true })
  overtimeMultiplier!: number;

  @Column({ name: 'weekend_multiplier', type: 'decimal', precision: 5, scale: 2, nullable: true })
  weekendMultiplier!: number;

  @Column({ name: 'holiday_multiplier', type: 'decimal', precision: 5, scale: 2, nullable: true })
  holidayMultiplier!: number;

  @Column({ name: 'minimum_charge', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumCharge!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
