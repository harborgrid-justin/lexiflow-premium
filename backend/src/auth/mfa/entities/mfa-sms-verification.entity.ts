import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';

/**
 * MFA SMS Verification Entity
 * Stores SMS verification codes and phone numbers for MFA
 */
@Entity('mfa_sms_verifications')
@Index(['userId'])
@Index(['phoneNumber'])
export class MfaSmsVerification extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber!: string;

  @Column({ name: 'phone_number_verified', type: 'boolean', default: false })
  phoneNumberVerified!: boolean;

  @Column({ name: 'code_hash', type: 'varchar', length: 255 })
  codeHash!: string;

  @Column({ name: 'attempts', type: 'integer', default: 0 })
  attempts!: number;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt!: Date;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
