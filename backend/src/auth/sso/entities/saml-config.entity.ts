import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';

/**
 * SAML SSO Configuration Entity
 * Stores SAML 2.0 configuration for enterprise SSO integrations
 */
@Entity('saml_configs')
@Index(['organizationId'], { unique: true })
export class SamlConfig extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId!: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 500 })
  entityId!: string;

  @Column({ name: 'entry_point', type: 'varchar', length: 500 })
  entryPoint!: string;

  @Column({ name: 'callback_url', type: 'varchar', length: 500 })
  callbackUrl!: string;

  @Column({ name: 'issuer', type: 'varchar', length: 500 })
  issuer!: string;

  @Column({ name: 'certificate', type: 'text' })
  certificate!: string;

  @Column({ name: 'private_key', type: 'text', nullable: true })
  privateKey!: string;

  @Column({ name: 'signature_algorithm', type: 'varchar', length: 50, default: 'sha256' })
  signatureAlgorithm!: string;

  @Column({ name: 'name_id_format', type: 'varchar', length: 200, default: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress' })
  nameIdFormat!: string;

  @Column({ name: 'want_assertions_signed', type: 'boolean', default: true })
  wantAssertionsSigned!: boolean;

  @Column({ name: 'want_response_signed', type: 'boolean', default: true })
  wantResponseSigned!: boolean;

  @Column({ name: 'authn_context', type: 'text', array: true, default: '{}' })
  authnContext!: string[];

  @Column({ name: 'force_authn', type: 'boolean', default: false })
  forceAuthn!: boolean;

  @Column({ name: 'passive', type: 'boolean', default: false })
  passive!: boolean;

  @Column({ name: 'provider_name', type: 'varchar', length: 100 })
  providerName!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @Column({ name: 'attribute_mapping', type: 'jsonb', nullable: true })
  attributeMapping!: {
    email?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    groups?: string;
  };

  @Column({ name: 'jit_provisioning_enabled', type: 'boolean', default: false })
  jitProvisioningEnabled!: boolean;

  @Column({ name: 'default_role', type: 'varchar', length: 50, nullable: true })
  defaultRole!: string;

  @Column({ name: 'allowed_domains', type: 'text', array: true, default: '{}' })
  allowedDomains!: string[];
}
