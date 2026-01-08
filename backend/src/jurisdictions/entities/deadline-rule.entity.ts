import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Jurisdiction } from './jurisdiction.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum CalculationMethod {
  CALENDAR_DAYS = 'calendar_days',
  BUSINESS_DAYS = 'business_days',
  COURT_DAYS = 'court_days',
  CUSTOM = 'custom',
}

export enum DeadlineRuleType {
  FILING = 'filing',
  RESPONSE = 'response',
  DISCOVERY = 'discovery',
  MOTION = 'motion',
  APPEAL = 'appeal',
  TRIAL_PREPARATION = 'trial_preparation',
  STATUTE_OF_LIMITATIONS = 'statute_of_limitations',
  EXPERT_DISCLOSURE = 'expert_disclosure',
  PRETRIAL = 'pretrial',
  CUSTOM = 'custom',
}

@Entity('deadline_rules')
@Index(['jurisdictionId'])
@Index(['ruleType'])
@Index(['isActive'])
@Index(['jurisdictionId', 'ruleType'])
export class DeadlineRule extends BaseEntity {
  @ApiProperty({ description: 'Associated jurisdiction ID' })
  @Column({ name: 'jurisdiction_id', type: 'uuid' })
  jurisdictionId!: string;

  @ManyToOne(() => Jurisdiction, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jurisdiction_id' })
  jurisdiction!: Jurisdiction;

  @ApiProperty({ description: 'Name of the deadline rule' })
  @Column({ type: 'varchar', length: 500 })
  name!: string;

  @ApiProperty({ description: 'Rule citation (e.g., FRCP 12(a)(1))' })
  @Column({ name: 'rule_citation', type: 'varchar', length: 255 })
  ruleCitation!: string;

  @ApiProperty({ enum: DeadlineRuleType, description: 'Type of deadline rule' })
  @Column({
    name: 'rule_type',
    type: 'enum',
    enum: DeadlineRuleType,
  })
  ruleType!: DeadlineRuleType;

  @ApiProperty({ description: 'Full text of the rule' })
  @Column({ name: 'rule_text', type: 'text', nullable: true })
  ruleText?: string;

  @ApiProperty({ description: 'Summary of the rule' })
  @Column({ type: 'text', nullable: true })
  summary?: string;

  @ApiProperty({ description: 'Number of days for the deadline' })
  @Column({ name: 'days_count', type: 'int' })
  daysCount!: number;

  @ApiProperty({ enum: CalculationMethod, description: 'How to calculate the deadline' })
  @Column({
    name: 'calculation_method',
    type: 'enum',
    enum: CalculationMethod,
    default: CalculationMethod.CALENDAR_DAYS,
  })
  calculationMethod!: CalculationMethod;

  @ApiProperty({ description: 'Whether to count business days only' })
  @Column({ name: 'business_days_only', type: 'boolean', default: false })
  businessDaysOnly!: boolean;

  @ApiProperty({ description: 'Whether to exclude weekends' })
  @Column({ name: 'exclude_weekends', type: 'boolean', default: false })
  excludeWeekends!: boolean;

  @ApiProperty({ description: 'Whether to exclude federal holidays' })
  @Column({ name: 'exclude_federal_holidays', type: 'boolean', default: false })
  excludeFederalHolidays!: boolean;

  @ApiProperty({ description: 'Whether to exclude state holidays' })
  @Column({ name: 'exclude_state_holidays', type: 'boolean', default: false })
  excludeStateHolidays!: boolean;

  @ApiProperty({ description: 'Whether to exclude court holidays' })
  @Column({ name: 'exclude_court_holidays', type: 'boolean', default: false })
  excludeCourtHolidays!: boolean;

  @ApiProperty({ description: 'Specific dates to exclude (court closures, etc.)' })
  @Column({ name: 'excluded_dates', type: 'jsonb', nullable: true })
  excludedDates?: Date[];

  @ApiProperty({ description: 'Day of week to extend to if deadline falls on excluded day (0=Sunday, 6=Saturday)' })
  @Column({ name: 'extend_to_day', type: 'int', nullable: true })
  extendToDay?: number;

  @ApiProperty({ description: 'Direction to extend (next_business_day, next_court_day, etc.)' })
  @Column({ name: 'extension_direction', type: 'varchar', length: 100, nullable: true })
  extensionDirection?: string;

  @ApiProperty({ description: 'The triggering event for this deadline' })
  @Column({ name: 'trigger_event', type: 'varchar', length: 500 })
  triggerEvent!: string;

  @ApiProperty({ description: 'Examples of when this rule applies' })
  @Column({ type: 'jsonb', nullable: true })
  examples?: string[];

  @ApiProperty({ description: 'Exceptions to the rule' })
  @Column({ type: 'jsonb', nullable: true })
  exceptions?: string[];

  @ApiProperty({ description: 'Whether this deadline can be extended by stipulation' })
  @Column({ name: 'allows_stipulated_extension', type: 'boolean', default: false })
  allowsStipulatedExtension!: boolean;

  @ApiProperty({ description: 'Whether this deadline can be extended by court order' })
  @Column({ name: 'allows_court_extension', type: 'boolean', default: false })
  allowsCourtExtension!: boolean;

  @ApiProperty({ description: 'Standard for obtaining extension (good cause, etc.)' })
  @Column({ name: 'extension_standard', type: 'varchar', length: 500, nullable: true })
  extensionStandard?: string;

  @ApiProperty({ description: 'Maximum number of extensions typically allowed' })
  @Column({ name: 'max_extensions', type: 'int', nullable: true })
  maxExtensions?: number;

  @ApiProperty({ description: 'Deadline for requesting extension (days before deadline)' })
  @Column({ name: 'extension_request_deadline_days', type: 'int', nullable: true })
  extensionRequestDeadlineDays?: number;

  @ApiProperty({ description: 'Whether this is a jurisdictional deadline (cannot be waived)' })
  @Column({ name: 'is_jurisdictional', type: 'boolean', default: false })
  isJurisdictional!: boolean;

  @ApiProperty({ description: 'Whether this is a mandatory deadline' })
  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory!: boolean;

  @ApiProperty({ description: 'Consequence of missing the deadline' })
  @Column({ type: 'text', nullable: true })
  consequences?: string;

  @ApiProperty({ description: 'Priority level of this deadline (1=highest, 5=lowest)' })
  @Column({ name: 'priority_level', type: 'int', default: 3 })
  priorityLevel!: number;

  @ApiProperty({ description: 'URL to official rule source' })
  @Column({ name: 'source_url', type: 'varchar', length: 1000, nullable: true })
  sourceUrl?: string;

  @ApiProperty({ description: 'Related rule citations' })
  @Column({ name: 'related_rules', type: 'jsonb', nullable: true })
  relatedRules?: string[];

  @ApiProperty({ description: 'Date the rule became effective' })
  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate?: Date;

  @ApiProperty({ description: 'Date the rule expires or was superseded' })
  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate?: Date;

  @ApiProperty({ description: 'Whether the rule is currently active' })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Additional notes about the rule' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  /**
   * Calculate deadline date from trigger date
   */
  calculateDeadline(triggerDate: Date, holidays: Date[] = []): Date {
    const deadline = new Date(triggerDate);
    let daysToAdd = this.daysCount;
    const allExcludedDates = [
      ...(this.excludedDates || []),
      ...holidays,
    ].map(d => new Date(d).toDateString());

    while (daysToAdd > 0) {
      deadline.setDate(deadline.getDate() + 1);

      const dayOfWeek = deadline.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isExcluded = allExcludedDates.includes(deadline.toDateString());

      if (this.businessDaysOnly || this.excludeWeekends) {
        if (!isWeekend && !isExcluded) {
          daysToAdd--;
        }
      } else if (!isExcluded) {
        daysToAdd--;
      }
    }

    // If deadline falls on excluded day, extend to next valid day
    if (this.extendToDay !== null && this.extendToDay !== undefined) {
      while (
        deadline.getDay() !== this.extendToDay ||
        allExcludedDates.includes(deadline.toDateString())
      ) {
        deadline.setDate(deadline.getDate() + 1);
      }
    }

    return deadline;
  }
}
