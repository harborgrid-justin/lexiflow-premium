import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';

/**
 * SAML Session Entity
 * Tracks SAML SSO authentication sessions
 */
@Entity('saml_sessions')
@Index(['userId'])
@Index(['nameId'], { unique: true })
@Index(['sessionIndex'])
export class SamlSession extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column({ name: 'name_id', type: 'varchar', length: 500, unique: true })
  nameId!: string;

  @Column({ name: 'session_index', type: 'varchar', length: 500 })
  sessionIndex!: string;

  @Column({ name: 'saml_config_id', type: 'uuid' })
  samlConfigId!: string;

  @Column({ name: 'attributes', type: 'jsonb', nullable: true })
  attributes!: Record<string, unknown>;

  @Column({ name: 'assertion', type: 'text', nullable: true })
  assertion!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'last_activity_at', type: 'timestamp' })
  lastActivityAt!: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'ip_address', type: 'varchar', length: 100 })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;
}
