import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';
import { Client } from '@clients/entities/client.entity';
import { Case } from '@cases/entities/case.entity';

export enum RateType {
  STANDARD = 'standard',
  MATTER_SPECIFIC = 'matter_specific',
  CLIENT_SPECIFIC = 'client_specific',
  ROLE_BASED = 'role_based',
  EXPERIENCE_BASED = 'experience_based',
  CUSTOM = 'custom',
}

export enum MatterType {
  LITIGATION = 'litigation',
  CORPORATE = 'corporate',
  REAL_ESTATE = 'real_estate',
  FAMILY_LAW = 'family_law',
  CRIMINAL_DEFENSE = 'criminal_defense',
  IMMIGRATION = 'immigration',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  EMPLOYMENT = 'employment',
  ESTATE_PLANNING = 'estate_planning',
  BANKRUPTCY = 'bankruptcy',
  TAX = 'tax',
  GENERAL = 'general',
}

@Entity('billing_rates')
@Index(['userId', 'effectiveDate'])
@Index(['clientId', 'effectiveDate'])
@Index(['caseId'])
@Index(['rateType', 'effectiveDate'])
@Index(['effectiveDate', 'endDate'])
export class BillingRate extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'client_id', nullable: true })
  @Index()
  clientId!: string;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({ name: 'case_id', nullable: true })
  @Index()
  caseId!: string;

  @ManyToOne(() => Case, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case!: Case;

  @Column({
    name: 'rate_type',
    type: 'enum',
    enum: RateType,
    default: RateType.STANDARD,
  })
  @Index()
  rateType!: RateType;

  @Column({
    name: 'matter_type',
    type: 'enum',
    enum: MatterType,
    nullable: true,
  })
  @Index()
  matterType!: MatterType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rate!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'effective_date', type: 'date' })
  @Index()
  effectiveDate!: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive!: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role!: string; // Partner, Associate, Paralegal, etc.

  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experienceYears!: number;

  @Column({ name: 'rate_name', type: 'varchar', length: 255, nullable: true })
  rateName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes!: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @Column({ name: 'minimum_increment', type: 'decimal', precision: 5, scale: 2, default: 0.1 })
  minimumIncrement!: number; // e.g., 0.1 for 6-minute increments, 0.25 for 15-minute

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage!: number;

  @Column({ name: 'discounted_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountedRate!: number;

  @Column({ name: 'blended_rate', type: 'boolean', default: false })
  blendedRate!: boolean;

  @Column({ name: 'rate_cap', type: 'decimal', precision: 15, scale: 2, nullable: true })
  rateCap!: number; // Maximum billable amount per period

  @Column({ name: 'rate_floor', type: 'decimal', precision: 15, scale: 2, nullable: true })
  rateFloor!: number; // Minimum billable amount per period

  @Column({ name: 'auto_apply', type: 'boolean', default: false })
  autoApply!: boolean; // Automatically apply to time entries

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority!: number; // Higher priority rates override lower priority

  /**
   * Calculate the effective rate considering discounts
   */
  getEffectiveRate(): number {
    if (this.discountedRate) {
      return Number(this.discountedRate);
    }
    if (this.discountPercentage > 0) {
      return Number(this.rate) * (1 - Number(this.discountPercentage) / 100);
    }
    return Number(this.rate);
  }

  /**
   * Check if rate is currently active based on date range
   */
  isCurrentlyActive(date: Date = new Date()): boolean {
    if (!this.isActive) return false;

    const effectiveDate = new Date(this.effectiveDate);
    const checkDate = new Date(date);

    if (checkDate < effectiveDate) return false;

    if (this.endDate) {
      const endDate = new Date(this.endDate);
      if (checkDate > endDate) return false;
    }

    return true;
  }
}
