import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiKeyScope, ApiKeyRotationPolicy } from '../../api-security/dto';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  keyPrefix!: string;

  @Column()
  keyHash!: string;

  @Column({ type: 'simple-array' })
  scopes!: ApiKeyScope[];

  @Column({ type: 'simple-array', nullable: true })
  ipWhitelist!: string[];

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;

  @Column({ default: 1000 })
  rateLimit!: number;

  @Column({ type: 'integer', nullable: true })
  dailyQuota!: number;

  @Column({ type: 'integer', nullable: true })
  monthlyQuota!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt!: Date;

  @Column({ default: 0 })
  requestCount!: number;

  @Column({ default: 0 })
  dailyRequestCount!: number;

  @Column({ default: 0 })
  monthlyRequestCount!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', default: ApiKeyRotationPolicy.MANUAL })
  rotationPolicy!: ApiKeyRotationPolicy;

  @Column({ default: true })
  rotationRemindersEnabled!: boolean;

  @Column({ default: 30 })
  rotationReminderDays!: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRotationReminderAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRotatedAt!: Date;

  @Column({ type: 'timestamp' })
  dailyQuotaResetAt!: Date;

  @Column({ type: 'timestamp' })
  monthlyQuotaResetAt!: Date;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
