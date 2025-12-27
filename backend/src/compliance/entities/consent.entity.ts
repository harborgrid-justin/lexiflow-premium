import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';

export enum ConsentType {
  MARKETING = 'marketing',
  DATA_PROCESSING = 'data_processing',
  THIRD_PARTY_SHARING = 'third_party_sharing',
  ANALYTICS = 'analytics',
  COOKIES = 'cookies',
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  BIOMETRIC_DATA = 'biometric_data',
  SENSITIVE_DATA = 'sensitive_data',
  AUTOMATED_DECISION_MAKING = 'automated_decision_making',
}

export enum ConsentStatus {
  GRANTED = 'granted',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Entity('consents')
@Index(['userId'])
@Index(['consentType'])
@Index(['status'])
@Index(['grantedAt'])
export class Consent extends BaseEntity {
  @ApiProperty({ description: 'User ID who gave consent' })
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({ enum: ConsentType, description: 'Type of consent' })
  @Column({
    name: 'consent_type',
    type: 'enum',
    enum: ConsentType,
  })
  consentType!: ConsentType;

  @ApiProperty({ enum: ConsentStatus, description: 'Current status of consent' })
  @Column({
    type: 'enum',
    enum: ConsentStatus,
    default: ConsentStatus.GRANTED,
  })
  status!: ConsentStatus;

  @ApiProperty({ description: 'Purpose of data processing' })
  @Column({ type: 'text' })
  purpose!: string;

  @ApiProperty({ description: 'Scope of consent' })
  @Column({ type: 'text', nullable: true })
  scope!: string;

  @ApiProperty({ description: 'When consent was granted' })
  @Column({ name: 'granted_at', type: 'timestamp' })
  grantedAt!: Date;

  @ApiProperty({ description: 'When consent was revoked (if applicable)' })
  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt!: Date | null;

  @ApiProperty({ description: 'When consent expires' })
  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt!: Date | null;

  @ApiProperty({ description: 'IP address when consent was granted' })
  @Column({ name: 'ip_address', type: 'varchar', length: 100, nullable: true })
  ipAddress!: string;

  @ApiProperty({ description: 'User agent when consent was granted' })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string;

  @ApiProperty({ description: 'Version of consent text shown to user' })
  @Column({ name: 'consent_version', type: 'varchar', length: 50 })
  consentVersion!: string;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'Legal basis for processing (GDPR)' })
  @Column({ name: 'legal_basis', type: 'varchar', length: 100, nullable: true })
  legalBasis!: string;

  @ApiProperty({ description: 'Data categories covered by this consent' })
  @Column({ name: 'data_categories', type: 'text', array: true, default: '{}' })
  dataCategories!: string[];

  @ApiProperty({ description: 'Third parties data may be shared with' })
  @Column({ name: 'third_parties', type: 'text', array: true, default: '{}' })
  thirdParties!: string[];

  @ApiProperty({ description: 'Reason for revocation (if applicable)' })
  @Column({ name: 'revocation_reason', type: 'text', nullable: true })
  revocationReason!: string | null;
}
