import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('rate_tables')
@Index(['name'])
@Index(['effectiveDate'])
@Index(['isActive'])
export class RateTable extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: [
      'partner',
      'senior_associate',
      'associate',
      'junior_associate',
      'paralegal',
      'legal_assistant',
      'consultant',
      'expert',
      'other',
    ],
    nullable: true,
  })
  positionLevel: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  practiceArea: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  clientType: string;

  @Column({ type: 'uuid', nullable: true })
  clientId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumCharge: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overtimeMultiplier: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weekendMultiplier: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  holidayMultiplier: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  rateModifiers: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
