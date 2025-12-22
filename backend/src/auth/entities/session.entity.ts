import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('sessions')
@Index(['userId'])
@Index(['token'], { unique: true })
@Index(['expiresAt'])
@Index(['isActive'])
export class Session extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'token', type: 'varchar', length: 500, unique: true })
  token!: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  refreshToken!: string;

  @Column({ name: 'refresh_token_expires_at', type: 'timestamp', nullable: true })
  refreshTokenExpiresAt!: Date;

  @Column({ name: 'device_info', type: 'text', nullable: true })
  deviceInfo!: string;

  @Column({ name: 'device_type', type: 'varchar', length: 100, nullable: true })
  deviceType!: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent!: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 100 })
  ipAddress!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt!: Date;

  @Column({ name: 'location', type: 'varchar', length: 100, nullable: true })
  location!: string;

  @Column({ name: 'country', type: 'varchar', length: 50, nullable: true })
  country!: string;

  @Column({ name: 'city', type: 'varchar', length: 50, nullable: true })
  city!: string;

  @Column({ name: 'browser', type: 'varchar', length: 100, nullable: true })
  browser!: string;

  @Column({ name: 'os', type: 'varchar', length: 100, nullable: true })
  os!: string;

  @Column({ name: 'is_trusted', type: 'boolean', default: false })
  isTrusted!: boolean;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt!: Date;

  @Column({ name: 'revoked_by', type: 'varchar', length: 255, nullable: true })
  revokedBy!: string;

  @Column({ name: 'revocation_reason', type: 'text', nullable: true })
  revocationReason!: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  // Relations
  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
