import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { Client } from '@clients/entities/client.entity';
import { SecureMessage } from './secure-message.entity';
import { SharedDocument } from './shared-document.entity';
import { Appointment } from './appointment.entity';
import { ClientNotification } from './client-notification.entity';

@Entity('portal_users')
@Index(['email'], { unique: true })
@Index(['clientId'])
@Index(['mfaEnabled'])
@Index(['lastLogin'])
@Index(['status'])
export class PortalUser extends BaseEntity {
  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
  mfaEnabled!: boolean;

  @Column({ name: 'mfa_secret', type: 'varchar', length: 255, nullable: true })
  mfaSecret!: string;

  @Column({ name: 'last_login', type: 'timestamp with time zone', nullable: true })
  lastLogin!: Date;

  @Column({ name: 'login_attempts', type: 'integer', default: 0 })
  loginAttempts!: number;

  @Column({ name: 'locked_until', type: 'timestamp with time zone', nullable: true })
  lockedUntil!: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'locked', 'pending_verification'],
    default: 'pending_verification',
  })
  status!: string;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ name: 'email_verification_token', type: 'varchar', length: 500, nullable: true })
  emailVerificationToken!: string;

  @Column({ name: 'email_verification_expiry', type: 'timestamp with time zone', nullable: true })
  emailVerificationExpiry!: Date;

  @Column({ name: 'reset_token', type: 'varchar', length: 500, nullable: true })
  resetToken!: string;

  @Column({ name: 'reset_token_expiry', type: 'timestamp with time zone', nullable: true })
  resetTokenExpiry!: Date;

  @Column({ name: 'access_token', type: 'varchar', length: 1000, nullable: true })
  accessToken!: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 1000, nullable: true })
  refreshToken!: string;

  @Column({ name: 'token_expiry', type: 'timestamp with time zone', nullable: true })
  tokenExpiry!: Date;

  @Column({ name: 'last_password_change', type: 'timestamp with time zone', nullable: true })
  lastPasswordChange!: Date;

  @Column({ name: 'session_data', type: 'jsonb', nullable: true })
  sessionData!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  preferences!: Record<string, unknown>;

  @Column({ name: 'notification_settings', type: 'jsonb', nullable: true })
  notificationSettings!: Record<string, unknown>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string;

  // Relations
  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @OneToMany(() => SecureMessage, (message) => message.portalUser)
  messages!: SecureMessage[];

  @OneToMany(() => SharedDocument, (doc) => doc.portalUser)
  sharedDocuments!: SharedDocument[];

  @OneToMany(() => Appointment, (appointment) => appointment.portalUser)
  appointments!: Appointment[];

  @OneToMany(() => ClientNotification, (notification) => notification.portalUser)
  notifications!: ClientNotification[];
}
