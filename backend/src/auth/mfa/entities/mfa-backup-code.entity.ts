import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';

/**
 * MFA Backup Code Entity
 * Stores one-time use backup codes for account recovery
 */
@Entity('mfa_backup_codes')
@Index(['userId'])
@Index(['codeHash'], { unique: true })
export class MfaBackupCode extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({ name: 'code_hash', type: 'varchar', length: 255, unique: true })
  codeHash!: string;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed!: boolean;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt!: Date;

  @Column({ name: 'used_from_ip', type: 'varchar', length: 100, nullable: true })
  usedFromIp!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
