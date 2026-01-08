import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * EnterpriseOrganization Entity
 *
 * Manages enterprise-level organization information for multi-tenant legal platform.
 * Supports hierarchical organization structures with parent-child relationships.
 */
@Entity('enterprise_organizations')
@Index(['orgType'])
@Index(['status'])
@Index(['parentOrgId'])
@Index(['subscriptionTier'])
@Index(['industry'])
export class EnterpriseOrganization extends BaseEntity {
  @ApiProperty({ description: 'Organization name', example: 'Acme Legal Corp' })
  @Column({ type: 'varchar', length: 255 })
  @Index()
  name!: string;

  @ApiProperty({ description: 'Legal name of organization', example: 'Acme Legal Corporation Inc.' })
  @Column({ name: 'legal_name', type: 'varchar', length: 500, nullable: true })
  legalName!: string;

  @ApiProperty({ description: 'Organization type', enum: ['law_firm', 'corporate_legal', 'government', 'nonprofit', 'solo_practitioner', 'legal_aid', 'enterprise'] })
  @Column({
    name: 'org_type',
    type: 'enum',
    enum: ['law_firm', 'corporate_legal', 'government', 'nonprofit', 'solo_practitioner', 'legal_aid', 'enterprise'],
    default: 'law_firm',
  })
  orgType!: string;

  @ApiProperty({ description: 'Organization status', enum: ['active', 'inactive', 'suspended', 'trial', 'cancelled'] })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'trial', 'cancelled'],
    default: 'active',
  })
  status!: string;

  @ApiProperty({ description: 'Parent organization ID for hierarchical structures', nullable: true })
  @Column({ name: 'parent_org_id', type: 'uuid', nullable: true })
  parentOrgId!: string;

  @ApiProperty({ description: 'Tax identification number', nullable: true })
  @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
  taxId!: string;

  @ApiProperty({ description: 'Business registration number', nullable: true })
  @Column({ name: 'registration_number', type: 'varchar', length: 100, nullable: true })
  registrationNumber!: string;

  @ApiProperty({ description: 'Industry sector', nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  industry!: string;

  @ApiProperty({ description: 'Company website URL', nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  website!: string;

  @ApiProperty({ description: 'Primary contact email' })
  @Column({ type: 'varchar', length: 255 })
  @Index()
  email!: string;

  @ApiProperty({ description: 'Primary phone number', nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string;

  @ApiProperty({ description: 'Fax number', nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  fax!: string;

  @ApiProperty({ description: 'Physical address', nullable: true })
  @Column({ type: 'text', nullable: true })
  address!: string;

  @ApiProperty({ description: 'City', nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string;

  @ApiProperty({ description: 'State/Province', nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  state!: string;

  @ApiProperty({ description: 'Postal/ZIP code', nullable: true })
  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode!: string;

  @ApiProperty({ description: 'Country', nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  country!: string;

  @ApiProperty({ description: 'Timezone', example: 'America/New_York' })
  @Column({ type: 'varchar', length: 100, default: 'America/New_York' })
  timezone!: string;

  @ApiProperty({ description: 'Subscription tier', enum: ['free', 'basic', 'professional', 'enterprise', 'custom'] })
  @Column({
    name: 'subscription_tier',
    type: 'enum',
    enum: ['free', 'basic', 'professional', 'enterprise', 'custom'],
    default: 'professional',
  })
  subscriptionTier!: string;

  @ApiProperty({ description: 'Subscription start date', nullable: true })
  @Column({ name: 'subscription_start_date', type: 'timestamp', nullable: true })
  subscriptionStartDate!: Date;

  @ApiProperty({ description: 'Subscription end date', nullable: true })
  @Column({ name: 'subscription_end_date', type: 'timestamp', nullable: true })
  subscriptionEndDate!: Date;

  @ApiProperty({ description: 'Maximum number of users allowed' })
  @Column({ name: 'max_users', type: 'integer', default: 10 })
  maxUsers!: number;

  @ApiProperty({ description: 'Current number of active users' })
  @Column({ name: 'active_users', type: 'integer', default: 0 })
  activeUsers!: number;

  @ApiProperty({ description: 'Maximum storage in GB' })
  @Column({ name: 'max_storage_gb', type: 'integer', default: 100 })
  maxStorageGb!: number;

  @ApiProperty({ description: 'Current storage used in GB' })
  @Column({ name: 'current_storage_gb', type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStorageGb!: number;

  @ApiProperty({ description: 'SSO enabled flag' })
  @Column({ name: 'sso_enabled', type: 'boolean', default: false })
  ssoEnabled!: boolean;

  @ApiProperty({ description: 'MFA required for all users' })
  @Column({ name: 'mfa_required', type: 'boolean', default: false })
  mfaRequired!: boolean;

  @ApiProperty({ description: 'IP whitelist enabled' })
  @Column({ name: 'ip_whitelist_enabled', type: 'boolean', default: false })
  ipWhitelistEnabled!: boolean;

  @ApiProperty({ description: 'Whitelisted IP addresses', type: 'array' })
  @Column({ name: 'whitelisted_ips', type: 'text', array: true, default: '{}' })
  whitelistedIps!: string[];

  @ApiProperty({ description: 'Compliance frameworks', type: 'array' })
  @Column({ name: 'compliance_frameworks', type: 'text', array: true, default: '{}' })
  complianceFrameworks!: string[];

  @ApiProperty({ description: 'Data retention period in days' })
  @Column({ name: 'data_retention_days', type: 'integer', default: 2555 })
  dataRetentionDays!: number;

  @ApiProperty({ description: 'Billing contact name', nullable: true })
  @Column({ name: 'billing_contact_name', type: 'varchar', length: 255, nullable: true })
  billingContactName!: string;

  @ApiProperty({ description: 'Billing contact email', nullable: true })
  @Column({ name: 'billing_contact_email', type: 'varchar', length: 255, nullable: true })
  billingContactEmail!: string;

  @ApiProperty({ description: 'Billing contact phone', nullable: true })
  @Column({ name: 'billing_contact_phone', type: 'varchar', length: 50, nullable: true })
  billingContactPhone!: string;

  @ApiProperty({ description: 'Payment method', enum: ['credit_card', 'bank_transfer', 'invoice', 'purchase_order'] })
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: ['credit_card', 'bank_transfer', 'invoice', 'purchase_order'],
    default: 'credit_card',
  })
  paymentMethod!: string;

  @ApiProperty({ description: 'Payment terms in days' })
  @Column({ name: 'payment_terms_days', type: 'integer', default: 30 })
  paymentTermsDays!: number;

  @ApiProperty({ description: 'Monthly fee amount' })
  @Column({ name: 'monthly_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  monthlyFee!: number;

  @ApiProperty({ description: 'Annual fee amount' })
  @Column({ name: 'annual_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  annualFee!: number;

  @ApiProperty({ description: 'Custom pricing flag' })
  @Column({ name: 'custom_pricing', type: 'boolean', default: false })
  customPricing!: boolean;

  @ApiProperty({ description: 'Organization logo URL', nullable: true })
  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string;

  @ApiProperty({ description: 'Branding colors in JSON', nullable: true })
  @Column({ name: 'branding_colors', type: 'jsonb', nullable: true })
  brandingColors!: Record<string, string>;

  @ApiProperty({ description: 'Custom domain for whitelabel', nullable: true })
  @Column({ name: 'custom_domain', type: 'varchar', length: 255, nullable: true })
  customDomain!: string;

  @ApiProperty({ description: 'Features enabled', type: 'array' })
  @Column({ type: 'text', array: true, default: '{}' })
  features!: string[];

  @ApiProperty({ description: 'API access enabled' })
  @Column({ name: 'api_access_enabled', type: 'boolean', default: false })
  apiAccessEnabled!: boolean;

  @ApiProperty({ description: 'API rate limit per hour' })
  @Column({ name: 'api_rate_limit', type: 'integer', default: 1000 })
  apiRateLimit!: number;

  @ApiProperty({ description: 'Notes about the organization', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes!: string;

  @ApiProperty({ description: 'Organization settings in JSON', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  settings!: Record<string, unknown>;

  @ApiProperty({ description: 'Organization metadata', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'Tags for categorization', type: 'array' })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ description: 'Last login timestamp', nullable: true })
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt!: Date;

  @ApiProperty({ description: 'Trial ends at timestamp', nullable: true })
  @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
  trialEndsAt!: Date;

  @ApiProperty({ description: 'Is VIP organization' })
  @Column({ name: 'is_vip', type: 'boolean', default: false })
  isVip!: boolean;

  @ApiProperty({ description: 'Account manager user ID', nullable: true })
  @Column({ name: 'account_manager_id', type: 'uuid', nullable: true })
  accountManagerId!: string;
}
