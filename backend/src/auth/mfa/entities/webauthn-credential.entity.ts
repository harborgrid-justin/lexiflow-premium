import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';

/**
 * WebAuthn Credential Entity
 * Stores hardware security key credentials for WebAuthn/FIDO2 authentication
 */
@Entity('webauthn_credentials')
@Index(['userId'])
@Index(['credentialId'], { unique: true })
export class WebAuthnCredential extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({ name: 'credential_id', type: 'text', unique: true })
  credentialId!: string;

  @Column({ name: 'public_key', type: 'text' })
  publicKey!: string;

  @Column({ name: 'counter', type: 'bigint', default: 0 })
  counter!: number;

  @Column({ name: 'device_type', type: 'varchar', length: 50 })
  deviceType!: string; // 'platform' | 'cross-platform'

  @Column({ name: 'transports', type: 'text', array: true, default: '{}' })
  transports!: string[]; // ['usb', 'nfc', 'ble', 'internal']

  @Column({ name: 'aaguid', type: 'varchar', length: 100, nullable: true })
  aaguid!: string;

  @Column({ name: 'friendly_name', type: 'varchar', length: 100 })
  friendlyName!: string;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'backup_eligible', type: 'boolean', default: false })
  backupEligible!: boolean;

  @Column({ name: 'backup_state', type: 'boolean', default: false })
  backupState!: boolean;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
