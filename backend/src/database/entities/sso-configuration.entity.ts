import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * SSOConfiguration Entity
 *
 * Manages Single Sign-On configurations for enterprise organizations.
 * Supports SAML 2.0, OAuth 2.0, OpenID Connect, and LDAP/Active Directory.
 */
@Entity('sso_configurations')
@Index(['organizationId'])
@Index(['provider'])
@Index(['status'])
@Index(['isDefault'])
export class SSOConfiguration extends BaseEntity {
  @ApiProperty({ description: 'Organization ID this SSO config belongs to' })
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId!: string;

  @ApiProperty({ description: 'SSO provider name', example: 'Okta' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'SSO provider type', enum: ['saml', 'oauth2', 'oidc', 'ldap', 'ad'] })
  @Column({
    type: 'enum',
    enum: ['saml', 'oauth2', 'oidc', 'ldap', 'ad'],
  })
  provider!: string;

  @ApiProperty({ description: 'SSO configuration status', enum: ['active', 'inactive', 'testing', 'error'] })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'testing', 'error'],
    default: 'inactive',
  })
  status!: string;

  @ApiProperty({ description: 'Is this the default SSO provider for the organization' })
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  // SAML 2.0 Configuration
  @ApiProperty({ description: 'SAML Entity ID', nullable: true })
  @Column({ name: 'saml_entity_id', type: 'text', nullable: true })
  samlEntityId!: string;

  @ApiProperty({ description: 'SAML SSO URL', nullable: true })
  @Column({ name: 'saml_sso_url', type: 'text', nullable: true })
  samlSsoUrl!: string;

  @ApiProperty({ description: 'SAML SLO URL (Single Logout)', nullable: true })
  @Column({ name: 'saml_slo_url', type: 'text', nullable: true })
  samlSloUrl!: string;

  @ApiProperty({ description: 'SAML X.509 Certificate', nullable: true })
  @Column({ name: 'saml_x509_cert', type: 'text', nullable: true })
  samlX509Cert!: string;

  @ApiProperty({ description: 'SAML Name ID Format', nullable: true })
  @Column({ name: 'saml_name_id_format', type: 'varchar', length: 500, nullable: true })
  samlNameIdFormat!: string;

  @ApiProperty({ description: 'SAML Sign Requests', nullable: true })
  @Column({ name: 'saml_sign_requests', type: 'boolean', default: false })
  samlSignRequests!: boolean;

  @ApiProperty({ description: 'SAML Want Assertions Signed', nullable: true })
  @Column({ name: 'saml_want_assertions_signed', type: 'boolean', default: true })
  samlWantAssertionsSigned!: boolean;

  // OAuth 2.0 / OpenID Connect Configuration
  @ApiProperty({ description: 'OAuth/OIDC Client ID', nullable: true })
  @Column({ name: 'oauth_client_id', type: 'varchar', length: 500, nullable: true })
  oauthClientId!: string;

  @ApiProperty({ description: 'OAuth/OIDC Client Secret (encrypted)', nullable: true })
  @Column({ name: 'oauth_client_secret', type: 'text', nullable: true })
  oauthClientSecret!: string;

  @ApiProperty({ description: 'OAuth Authorization URL', nullable: true })
  @Column({ name: 'oauth_auth_url', type: 'text', nullable: true })
  oauthAuthUrl!: string;

  @ApiProperty({ description: 'OAuth Token URL', nullable: true })
  @Column({ name: 'oauth_token_url', type: 'text', nullable: true })
  oauthTokenUrl!: string;

  @ApiProperty({ description: 'OAuth User Info URL', nullable: true })
  @Column({ name: 'oauth_userinfo_url', type: 'text', nullable: true })
  oauthUserinfoUrl!: string;

  @ApiProperty({ description: 'OAuth Scopes', type: 'array' })
  @Column({ name: 'oauth_scopes', type: 'text', array: true, default: '{}' })
  oauthScopes!: string[];

  @ApiProperty({ description: 'OAuth Redirect URI', nullable: true })
  @Column({ name: 'oauth_redirect_uri', type: 'text', nullable: true })
  oauthRedirectUri!: string;

  // OIDC Specific
  @ApiProperty({ description: 'OIDC Issuer URL', nullable: true })
  @Column({ name: 'oidc_issuer', type: 'text', nullable: true })
  oidcIssuer!: string;

  @ApiProperty({ description: 'OIDC JWKS URI', nullable: true })
  @Column({ name: 'oidc_jwks_uri', type: 'text', nullable: true })
  oidcJwksUri!: string;

  // LDAP/Active Directory Configuration
  @ApiProperty({ description: 'LDAP Server URL', nullable: true })
  @Column({ name: 'ldap_url', type: 'text', nullable: true })
  ldapUrl!: string;

  @ApiProperty({ description: 'LDAP Bind DN', nullable: true })
  @Column({ name: 'ldap_bind_dn', type: 'text', nullable: true })
  ldapBindDn!: string;

  @ApiProperty({ description: 'LDAP Bind Password (encrypted)', nullable: true })
  @Column({ name: 'ldap_bind_password', type: 'text', nullable: true })
  ldapBindPassword!: string;

  @ApiProperty({ description: 'LDAP Base DN', nullable: true })
  @Column({ name: 'ldap_base_dn', type: 'text', nullable: true })
  ldapBaseDn!: string;

  @ApiProperty({ description: 'LDAP User Search Filter', nullable: true })
  @Column({ name: 'ldap_user_search_filter', type: 'text', nullable: true })
  ldapUserSearchFilter!: string;

  @ApiProperty({ description: 'LDAP Group Search Filter', nullable: true })
  @Column({ name: 'ldap_group_search_filter', type: 'text', nullable: true })
  ldapGroupSearchFilter!: string;

  @ApiProperty({ description: 'LDAP Use TLS', nullable: true })
  @Column({ name: 'ldap_use_tls', type: 'boolean', default: true })
  ldapUseTls!: boolean;

  // Attribute Mapping
  @ApiProperty({ description: 'Email attribute mapping', example: 'email' })
  @Column({ name: 'attr_email', type: 'varchar', length: 100, default: 'email' })
  attrEmail!: string;

  @ApiProperty({ description: 'First name attribute mapping', example: 'firstName' })
  @Column({ name: 'attr_first_name', type: 'varchar', length: 100, default: 'firstName' })
  attrFirstName!: string;

  @ApiProperty({ description: 'Last name attribute mapping', example: 'lastName' })
  @Column({ name: 'attr_last_name', type: 'varchar', length: 100, default: 'lastName' })
  attrLastName!: string;

  @ApiProperty({ description: 'Groups attribute mapping', nullable: true })
  @Column({ name: 'attr_groups', type: 'varchar', length: 100, nullable: true })
  attrGroups!: string;

  @ApiProperty({ description: 'Role attribute mapping', nullable: true })
  @Column({ name: 'attr_role', type: 'varchar', length: 100, nullable: true })
  attrRole!: string;

  // Role Mapping
  @ApiProperty({ description: 'Role mapping configuration (JSON)', nullable: true })
  @Column({ name: 'role_mapping', type: 'jsonb', nullable: true })
  roleMapping!: Record<string, string>;

  // Group-to-Role Mapping
  @ApiProperty({ description: 'Group to role mapping configuration (JSON)', nullable: true })
  @Column({ name: 'group_role_mapping', type: 'jsonb', nullable: true })
  groupRoleMapping!: Record<string, string>;

  // Auto-Provisioning
  @ApiProperty({ description: 'Auto-provision users on first login' })
  @Column({ name: 'auto_provision_users', type: 'boolean', default: true })
  autoProvisionUsers!: boolean;

  @ApiProperty({ description: 'Default role for auto-provisioned users', nullable: true })
  @Column({ name: 'default_role', type: 'varchar', length: 50, nullable: true })
  defaultRole!: string;

  @ApiProperty({ description: 'Update user attributes on every login' })
  @Column({ name: 'update_user_on_login', type: 'boolean', default: true })
  updateUserOnLogin!: boolean;

  // Just-In-Time (JIT) Provisioning
  @ApiProperty({ description: 'Enable JIT provisioning' })
  @Column({ name: 'jit_provisioning_enabled', type: 'boolean', default: false })
  jitProvisioningEnabled!: boolean;

  // Security Settings
  @ApiProperty({ description: 'Enforce SSO (disable password login)' })
  @Column({ name: 'enforce_sso', type: 'boolean', default: false })
  enforceSso!: boolean;

  @ApiProperty({ description: 'Require MFA in addition to SSO' })
  @Column({ name: 'require_mfa', type: 'boolean', default: false })
  requireMfa!: boolean;

  @ApiProperty({ description: 'Session timeout in minutes' })
  @Column({ name: 'session_timeout_minutes', type: 'integer', default: 480 })
  sessionTimeoutMinutes!: number;

  @ApiProperty({ description: 'Allowed domains for SSO', type: 'array' })
  @Column({ name: 'allowed_domains', type: 'text', array: true, default: '{}' })
  allowedDomains!: string[];

  // Auditing
  @ApiProperty({ description: 'Last successful login timestamp', nullable: true })
  @Column({ name: 'last_successful_login', type: 'timestamp', nullable: true })
  lastSuccessfulLogin!: Date;

  @ApiProperty({ description: 'Last failed login timestamp', nullable: true })
  @Column({ name: 'last_failed_login', type: 'timestamp', nullable: true })
  lastFailedLogin!: Date;

  @ApiProperty({ description: 'Failed login attempts count' })
  @Column({ name: 'failed_login_count', type: 'integer', default: 0 })
  failedLoginCount!: number;

  @ApiProperty({ description: 'Last tested timestamp', nullable: true })
  @Column({ name: 'last_tested_at', type: 'timestamp', nullable: true })
  lastTestedAt!: Date;

  @ApiProperty({ description: 'Last error message', nullable: true })
  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string;

  // Metadata
  @ApiProperty({ description: 'Configuration settings (JSON)', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  settings!: Record<string, unknown>;

  @ApiProperty({ description: 'Metadata (JSON)', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'Notes about this SSO configuration', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes!: string;
}
