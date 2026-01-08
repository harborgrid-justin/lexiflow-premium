import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration: Create Enterprise Entities
 *
 * Creates the following tables:
 * - enterprise_organizations: Multi-tenant organization management
 * - sso_configurations: Single Sign-On configurations (SAML, OAuth, OIDC, LDAP)
 * - compliance_records: Compliance certifications and audit tracking
 * - legal_research_queries: Legal research query history and analytics
 * - billing_transactions: Comprehensive billing transaction management
 *
 * @date 2026-01-08
 */
export class CreateEnterpriseEntities1736348000000 implements MigrationInterface {
  name = 'CreateEnterpriseEntities1736348000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create enterprise_organizations table
    await queryRunner.createTable(
      new Table({
        name: 'enterprise_organizations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'legal_name', type: 'varchar', length: '500', isNullable: true },
          {
            name: 'org_type',
            type: 'enum',
            enum: ['law_firm', 'corporate_legal', 'government', 'nonprofit', 'solo_practitioner', 'legal_aid', 'enterprise'],
            default: "'law_firm'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended', 'trial', 'cancelled'],
            default: "'active'",
          },
          { name: 'parent_org_id', type: 'uuid', isNullable: true },
          { name: 'tax_id', type: 'varchar', length: '100', isNullable: true },
          { name: 'registration_number', type: 'varchar', length: '100', isNullable: true },
          { name: 'industry', type: 'varchar', length: '100', isNullable: true },
          { name: 'website', type: 'varchar', length: '500', isNullable: true },
          { name: 'email', type: 'varchar', length: '255' },
          { name: 'phone', type: 'varchar', length: '50', isNullable: true },
          { name: 'fax', type: 'varchar', length: '50', isNullable: true },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'city', type: 'varchar', length: '100', isNullable: true },
          { name: 'state', type: 'varchar', length: '100', isNullable: true },
          { name: 'postal_code', type: 'varchar', length: '20', isNullable: true },
          { name: 'country', type: 'varchar', length: '100', isNullable: true },
          { name: 'timezone', type: 'varchar', length: '100', default: "'America/New_York'" },
          {
            name: 'subscription_tier',
            type: 'enum',
            enum: ['free', 'basic', 'professional', 'enterprise', 'custom'],
            default: "'professional'",
          },
          { name: 'subscription_start_date', type: 'timestamp', isNullable: true },
          { name: 'subscription_end_date', type: 'timestamp', isNullable: true },
          { name: 'max_users', type: 'integer', default: 10 },
          { name: 'active_users', type: 'integer', default: 0 },
          { name: 'max_storage_gb', type: 'integer', default: 100 },
          { name: 'current_storage_gb', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'sso_enabled', type: 'boolean', default: false },
          { name: 'mfa_required', type: 'boolean', default: false },
          { name: 'ip_whitelist_enabled', type: 'boolean', default: false },
          { name: 'whitelisted_ips', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'compliance_frameworks', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'data_retention_days', type: 'integer', default: 2555 },
          { name: 'billing_contact_name', type: 'varchar', length: '255', isNullable: true },
          { name: 'billing_contact_email', type: 'varchar', length: '255', isNullable: true },
          { name: 'billing_contact_phone', type: 'varchar', length: '50', isNullable: true },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['credit_card', 'bank_transfer', 'invoice', 'purchase_order'],
            default: "'credit_card'",
          },
          { name: 'payment_terms_days', type: 'integer', default: 30 },
          { name: 'monthly_fee', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'annual_fee', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'custom_pricing', type: 'boolean', default: false },
          { name: 'logo_url', type: 'text', isNullable: true },
          { name: 'branding_colors', type: 'jsonb', isNullable: true },
          { name: 'custom_domain', type: 'varchar', length: '255', isNullable: true },
          { name: 'features', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'api_access_enabled', type: 'boolean', default: false },
          { name: 'api_rate_limit', type: 'integer', default: 1000 },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'settings', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'tags', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'last_login_at', type: 'timestamp', isNullable: true },
          { name: 'trial_ends_at', type: 'timestamp', isNullable: true },
          { name: 'is_vip', type: 'boolean', default: false },
          { name: 'account_manager_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'version', type: 'integer', default: 1 },
        ],
      }),
      true,
    );

    // Create indexes for enterprise_organizations
    await queryRunner.createIndex('enterprise_organizations', new TableIndex({ name: 'IDX_enterprise_organizations_name', columnNames: ['name'] }));
    await queryRunner.createIndex('enterprise_organizations', new TableIndex({ name: 'IDX_enterprise_organizations_org_type', columnNames: ['org_type'] }));
    await queryRunner.createIndex('enterprise_organizations', new TableIndex({ name: 'IDX_enterprise_organizations_status', columnNames: ['status'] }));
    await queryRunner.createIndex('enterprise_organizations', new TableIndex({ name: 'IDX_enterprise_organizations_parent_org_id', columnNames: ['parent_org_id'] }));
    await queryRunner.createIndex('enterprise_organizations', new TableIndex({ name: 'IDX_enterprise_organizations_subscription_tier', columnNames: ['subscription_tier'] }));
    await queryRunner.createIndex('enterprise_organizations', new TableIndex({ name: 'IDX_enterprise_organizations_industry', columnNames: ['industry'] }));
    await queryRunner.createIndex('enterprise_organizations', new TableIndex({ name: 'IDX_enterprise_organizations_email', columnNames: ['email'] }));

    // Create sso_configurations table
    await queryRunner.createTable(
      new Table({
        name: 'sso_configurations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'organization_id', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '255' },
          {
            name: 'provider',
            type: 'enum',
            enum: ['saml', 'oauth2', 'oidc', 'ldap', 'ad'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'testing', 'error'],
            default: "'inactive'",
          },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'saml_entity_id', type: 'text', isNullable: true },
          { name: 'saml_sso_url', type: 'text', isNullable: true },
          { name: 'saml_slo_url', type: 'text', isNullable: true },
          { name: 'saml_x509_cert', type: 'text', isNullable: true },
          { name: 'saml_name_id_format', type: 'varchar', length: '500', isNullable: true },
          { name: 'saml_sign_requests', type: 'boolean', default: false },
          { name: 'saml_want_assertions_signed', type: 'boolean', default: true },
          { name: 'oauth_client_id', type: 'varchar', length: '500', isNullable: true },
          { name: 'oauth_client_secret', type: 'text', isNullable: true },
          { name: 'oauth_auth_url', type: 'text', isNullable: true },
          { name: 'oauth_token_url', type: 'text', isNullable: true },
          { name: 'oauth_userinfo_url', type: 'text', isNullable: true },
          { name: 'oauth_scopes', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'oauth_redirect_uri', type: 'text', isNullable: true },
          { name: 'oidc_issuer', type: 'text', isNullable: true },
          { name: 'oidc_jwks_uri', type: 'text', isNullable: true },
          { name: 'ldap_url', type: 'text', isNullable: true },
          { name: 'ldap_bind_dn', type: 'text', isNullable: true },
          { name: 'ldap_bind_password', type: 'text', isNullable: true },
          { name: 'ldap_base_dn', type: 'text', isNullable: true },
          { name: 'ldap_user_search_filter', type: 'text', isNullable: true },
          { name: 'ldap_group_search_filter', type: 'text', isNullable: true },
          { name: 'ldap_use_tls', type: 'boolean', default: true },
          { name: 'attr_email', type: 'varchar', length: '100', default: "'email'" },
          { name: 'attr_first_name', type: 'varchar', length: '100', default: "'firstName'" },
          { name: 'attr_last_name', type: 'varchar', length: '100', default: "'lastName'" },
          { name: 'attr_groups', type: 'varchar', length: '100', isNullable: true },
          { name: 'attr_role', type: 'varchar', length: '100', isNullable: true },
          { name: 'role_mapping', type: 'jsonb', isNullable: true },
          { name: 'group_role_mapping', type: 'jsonb', isNullable: true },
          { name: 'auto_provision_users', type: 'boolean', default: true },
          { name: 'default_role', type: 'varchar', length: '50', isNullable: true },
          { name: 'update_user_on_login', type: 'boolean', default: true },
          { name: 'jit_provisioning_enabled', type: 'boolean', default: false },
          { name: 'enforce_sso', type: 'boolean', default: false },
          { name: 'require_mfa', type: 'boolean', default: false },
          { name: 'session_timeout_minutes', type: 'integer', default: 480 },
          { name: 'allowed_domains', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'last_successful_login', type: 'timestamp', isNullable: true },
          { name: 'last_failed_login', type: 'timestamp', isNullable: true },
          { name: 'failed_login_count', type: 'integer', default: 0 },
          { name: 'last_tested_at', type: 'timestamp', isNullable: true },
          { name: 'last_error', type: 'text', isNullable: true },
          { name: 'settings', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'version', type: 'integer', default: 1 },
        ],
      }),
      true,
    );

    // Create indexes for sso_configurations
    await queryRunner.createIndex('sso_configurations', new TableIndex({ name: 'IDX_sso_configurations_organization_id', columnNames: ['organization_id'] }));
    await queryRunner.createIndex('sso_configurations', new TableIndex({ name: 'IDX_sso_configurations_provider', columnNames: ['provider'] }));
    await queryRunner.createIndex('sso_configurations', new TableIndex({ name: 'IDX_sso_configurations_status', columnNames: ['status'] }));
    await queryRunner.createIndex('sso_configurations', new TableIndex({ name: 'IDX_sso_configurations_is_default', columnNames: ['is_default'] }));

    // Create compliance_records table
    await queryRunner.createTable(
      new Table({
        name: 'compliance_records',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'organization_id', type: 'uuid' },
          {
            name: 'record_type',
            type: 'enum',
            enum: ['certification', 'assessment', 'audit', 'review', 'incident', 'remediation'],
          },
          {
            name: 'framework',
            type: 'enum',
            enum: ['soc2_type1', 'soc2_type2', 'hipaa', 'gdpr', 'ccpa', 'pci_dss', 'iso27001', 'nist', 'fedramp', 'fisma', 'glba', 'sox', 'ferpa', 'coppa', 'custom'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['compliant', 'non_compliant', 'in_progress', 'pending_review', 'remediation', 'expired', 'not_applicable'],
            default: "'pending_review'",
          },
          { name: 'title', type: 'varchar', length: '500' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'certification_number', type: 'varchar', length: '255', isNullable: true },
          { name: 'issuing_authority', type: 'varchar', length: '255', isNullable: true },
          { name: 'auditor_name', type: 'varchar', length: '255', isNullable: true },
          { name: 'auditor_email', type: 'varchar', length: '255', isNullable: true },
          { name: 'certification_date', type: 'date', isNullable: true },
          { name: 'expiration_date', type: 'date', isNullable: true },
          { name: 'next_review_date', type: 'date', isNullable: true },
          { name: 'scope', type: 'text', isNullable: true },
          { name: 'controls', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'findings', type: 'jsonb', isNullable: true },
          { name: 'critical_findings_count', type: 'integer', default: 0 },
          { name: 'high_findings_count', type: 'integer', default: 0 },
          { name: 'medium_findings_count', type: 'integer', default: 0 },
          { name: 'low_findings_count', type: 'integer', default: 0 },
          { name: 'remediation_plan', type: 'jsonb', isNullable: true },
          {
            name: 'remediation_status',
            type: 'enum',
            enum: ['not_started', 'in_progress', 'completed', 'verified', 'not_required'],
            default: "'not_required'",
          },
          { name: 'remediation_target_date', type: 'date', isNullable: true },
          { name: 'remediation_completed_date', type: 'date', isNullable: true },
          { name: 'evidence', type: 'jsonb', isNullable: true },
          { name: 'certificate_url', type: 'text', isNullable: true },
          { name: 'audit_report_url', type: 'text', isNullable: true },
          {
            name: 'risk_level',
            type: 'enum',
            enum: ['critical', 'high', 'medium', 'low', 'none'],
            default: "'medium'",
          },
          { name: 'risk_score', type: 'integer', isNullable: true },
          { name: 'compliance_score', type: 'integer', isNullable: true },
          { name: 'responsible_user_id', type: 'uuid', isNullable: true },
          { name: 'reviewer_user_id', type: 'uuid', isNullable: true },
          { name: 'approved_by_user_id', type: 'uuid', isNullable: true },
          { name: 'approved_at', type: 'timestamp', isNullable: true },
          { name: 'cost', type: 'decimal', precision: 15, scale: 2, isNullable: true },
          { name: 'vendor', type: 'varchar', length: '255', isNullable: true },
          { name: 'is_recurring', type: 'boolean', default: false },
          { name: 'recurrence_months', type: 'integer', isNullable: true },
          { name: 'parent_record_id', type: 'uuid', isNullable: true },
          { name: 'notification_sent', type: 'boolean', default: false },
          { name: 'reminder_days_before', type: 'integer', default: 30 },
          { name: 'related_case_ids', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'related_document_ids', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'tags', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'is_public', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'version', type: 'integer', default: 1 },
        ],
      }),
      true,
    );

    // Create indexes for compliance_records
    await queryRunner.createIndex('compliance_records', new TableIndex({ name: 'IDX_compliance_records_organization_id', columnNames: ['organization_id'] }));
    await queryRunner.createIndex('compliance_records', new TableIndex({ name: 'IDX_compliance_records_framework', columnNames: ['framework'] }));
    await queryRunner.createIndex('compliance_records', new TableIndex({ name: 'IDX_compliance_records_status', columnNames: ['status'] }));
    await queryRunner.createIndex('compliance_records', new TableIndex({ name: 'IDX_compliance_records_record_type', columnNames: ['record_type'] }));
    await queryRunner.createIndex('compliance_records', new TableIndex({ name: 'IDX_compliance_records_certification_date', columnNames: ['certification_date'] }));
    await queryRunner.createIndex('compliance_records', new TableIndex({ name: 'IDX_compliance_records_expiration_date', columnNames: ['expiration_date'] }));

    // Create legal_research_queries table
    await queryRunner.createTable(
      new Table({
        name: 'legal_research_queries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'organization_id', type: 'uuid' },
          { name: 'case_id', type: 'uuid', isNullable: true },
          {
            name: 'query_type',
            type: 'enum',
            enum: ['case_law', 'statutory', 'citation_analysis', 'shepards', 'full_text', 'ai_research', 'legal_memo', 'precedent_search', 'regulation', 'administrative'],
          },
          { name: 'query_text', type: 'text' },
          { name: 'research_goal', type: 'text', isNullable: true },
          { name: 'jurisdiction', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          {
            name: 'court_level',
            type: 'enum',
            enum: ['supreme', 'appellate', 'district', 'federal', 'state', 'all'],
            isNullable: true,
          },
          { name: 'date_from', type: 'date', isNullable: true },
          { name: 'date_to', type: 'date', isNullable: true },
          { name: 'practice_areas', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'citation', type: 'varchar', length: '500', isNullable: true },
          {
            name: 'citation_format',
            type: 'enum',
            enum: ['bluebook', 'alwd', 'universal', 'custom'],
            isNullable: true,
          },
          { name: 'search_filters', type: 'jsonb', isNullable: true },
          { name: 'boolean_operators', type: 'text', isNullable: true },
          { name: 'results_count', type: 'integer', default: 0 },
          { name: 'results_summary', type: 'jsonb', isNullable: true },
          { name: 'top_result_ids', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'execution_time_ms', type: 'integer', default: 0 },
          { name: 'search_engine', type: 'varchar', length: '100', default: "'lexiflow_engine'" },
          { name: 'external_api', type: 'varchar', length: '100', isNullable: true },
          { name: 'api_cost', type: 'decimal', precision: 10, scale: 4, isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
            default: "'pending'",
          },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'ai_model', type: 'varchar', length: '100', isNullable: true },
          { name: 'ai_summary', type: 'text', isNullable: true },
          { name: 'ai_confidence_score', type: 'integer', isNullable: true },
          { name: 'shepard_results', type: 'jsonb', isNullable: true },
          { name: 'treatment_analysis', type: 'jsonb', isNullable: true },
          { name: 'relevance_score', type: 'integer', isNullable: true },
          { name: 'user_helpful_rating', type: 'boolean', isNullable: true },
          { name: 'user_feedback', type: 'text', isNullable: true },
          { name: 'is_saved', type: 'boolean', default: false },
          { name: 'is_shared', type: 'boolean', default: false },
          { name: 'shared_with_users', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'cited_in_document_ids', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          {
            name: 'export_format',
            type: 'enum',
            enum: ['pdf', 'word', 'excel', 'csv', 'json'],
            isNullable: true,
          },
          { name: 'exported_at', type: 'timestamp', isNullable: true },
          { name: 'billing_code', type: 'varchar', length: '50', isNullable: true },
          { name: 'time_spent_minutes', type: 'integer', isNullable: true },
          { name: 'is_billable', type: 'boolean', default: true },
          { name: 'client_id', type: 'uuid', isNullable: true },
          {
            name: 'source',
            type: 'enum',
            enum: ['web_app', 'mobile_app', 'api', 'cli', 'integration'],
            default: "'web_app'",
          },
          { name: 'ip_address', type: 'varchar', length: '100', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'session_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'tags', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'analytics', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'version', type: 'integer', default: 1 },
        ],
      }),
      true,
    );

    // Create indexes for legal_research_queries
    await queryRunner.createIndex('legal_research_queries', new TableIndex({ name: 'IDX_legal_research_queries_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('legal_research_queries', new TableIndex({ name: 'IDX_legal_research_queries_organization_id', columnNames: ['organization_id'] }));
    await queryRunner.createIndex('legal_research_queries', new TableIndex({ name: 'IDX_legal_research_queries_case_id', columnNames: ['case_id'] }));
    await queryRunner.createIndex('legal_research_queries', new TableIndex({ name: 'IDX_legal_research_queries_query_type', columnNames: ['query_type'] }));
    await queryRunner.createIndex('legal_research_queries', new TableIndex({ name: 'IDX_legal_research_queries_status', columnNames: ['status'] }));
    await queryRunner.createIndex('legal_research_queries', new TableIndex({ name: 'IDX_legal_research_queries_created_at', columnNames: ['created_at'] }));

    // Create billing_transactions table
    await queryRunner.createTable(
      new Table({
        name: 'billing_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'organization_id', type: 'uuid' },
          { name: 'client_id', type: 'uuid' },
          { name: 'invoice_id', type: 'uuid', isNullable: true },
          { name: 'case_id', type: 'uuid', isNullable: true },
          { name: 'trust_account_id', type: 'uuid', isNullable: true },
          {
            name: 'transaction_type',
            type: 'enum',
            enum: ['payment', 'refund', 'credit', 'debit', 'adjustment', 'write_off', 'trust_deposit', 'trust_withdrawal', 'retainer', 'fee', 'expense', 'discount', 'late_fee'],
          },
          { name: 'transaction_number', type: 'varchar', length: '100', isUnique: true },
          { name: 'transaction_date', type: 'timestamp' },
          { name: 'amount', type: 'decimal', precision: 15, scale: 2 },
          { name: 'currency', type: 'varchar', length: '3', default: "'USD'" },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['cash', 'check', 'credit_card', 'debit_card', 'ach', 'wire_transfer', 'paypal', 'stripe', 'square', 'venmo', 'zelle', 'other'],
            isNullable: true,
          },
          { name: 'payment_processor', type: 'varchar', length: '100', isNullable: true },
          { name: 'external_transaction_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'check_number', type: 'varchar', length: '50', isNullable: true },
          { name: 'card_last4', type: 'varchar', length: '4', isNullable: true },
          { name: 'card_brand', type: 'varchar', length: '50', isNullable: true },
          { name: 'bank_account_last4', type: 'varchar', length: '4', isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed', 'reversed'],
            default: "'pending'",
          },
          { name: 'processing_fee', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'net_amount', type: 'decimal', precision: 15, scale: 2 },
          { name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'description', type: 'text' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'payer_name', type: 'varchar', length: '255', isNullable: true },
          { name: 'payer_email', type: 'varchar', length: '255', isNullable: true },
          { name: 'billing_address', type: 'jsonb', isNullable: true },
          { name: 'is_recurring', type: 'boolean', default: false },
          { name: 'recurring_schedule', type: 'varchar', length: '50', isNullable: true },
          { name: 'next_payment_date', type: 'date', isNullable: true },
          {
            name: 'reconciliation_status',
            type: 'enum',
            enum: ['unreconciled', 'reconciled', 'discrepancy', 'pending_review'],
            default: "'unreconciled'",
          },
          { name: 'reconciled_at', type: 'timestamp', isNullable: true },
          { name: 'reconciled_by', type: 'uuid', isNullable: true },
          { name: 'posted_to_gl', type: 'boolean', default: false },
          { name: 'gl_account_code', type: 'varchar', length: '100', isNullable: true },
          { name: 'posted_to_gl_at', type: 'timestamp', isNullable: true },
          { name: 'ledes_code', type: 'varchar', length: '50', isNullable: true },
          { name: 'ledes_version', type: 'varchar', length: '20', isNullable: true },
          { name: 'utbms_task_code', type: 'varchar', length: '20', isNullable: true },
          { name: 'utbms_activity_code', type: 'varchar', length: '20', isNullable: true },
          { name: 'utbms_expense_code', type: 'varchar', length: '20', isNullable: true },
          { name: 'failure_reason', type: 'text', isNullable: true },
          { name: 'failure_code', type: 'varchar', length: '100', isNullable: true },
          { name: 'refund_reason', type: 'text', isNullable: true },
          { name: 'refunded_amount', type: 'decimal', precision: 15, scale: 2, isNullable: true },
          { name: 'parent_transaction_id', type: 'uuid', isNullable: true },
          { name: 'related_transaction_ids', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'receipt_url', type: 'text', isNullable: true },
          { name: 'receipt_sent', type: 'boolean', default: false },
          { name: 'receipt_sent_at', type: 'timestamp', isNullable: true },
          { name: 'notification_sent', type: 'boolean', default: false },
          { name: 'ip_address', type: 'varchar', length: '100', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'risk_score', type: 'integer', isNullable: true },
          {
            name: 'fraud_check_status',
            type: 'enum',
            enum: ['not_checked', 'passed', 'flagged', 'blocked'],
            default: "'not_checked'",
          },
          {
            name: 'dispute_status',
            type: 'enum',
            enum: ['none', 'pending', 'won', 'lost', 'resolved'],
            default: "'none'",
          },
          { name: 'dispute_reason', type: 'text', isNullable: true },
          { name: 'dispute_opened_at', type: 'timestamp', isNullable: true },
          { name: 'dispute_resolved_at', type: 'timestamp', isNullable: true },
          { name: 'processed_by_user_id', type: 'uuid', isNullable: true },
          { name: 'approved_by_user_id', type: 'uuid', isNullable: true },
          { name: 'tags', type: 'text', array: true, default: 'ARRAY[]::text[]' },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'processor_response', type: 'jsonb', isNullable: true },
          { name: 'webhook_data', type: 'jsonb', isNullable: true },
          { name: 'is_test', type: 'boolean', default: false },
          { name: 'is_voided', type: 'boolean', default: false },
          { name: 'voided_at', type: 'timestamp', isNullable: true },
          { name: 'voided_by', type: 'uuid', isNullable: true },
          { name: 'void_reason', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'version', type: 'integer', default: 1 },
        ],
      }),
      true,
    );

    // Create indexes for billing_transactions
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_organization_id', columnNames: ['organization_id'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_client_id', columnNames: ['client_id'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_invoice_id', columnNames: ['invoice_id'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_case_id', columnNames: ['case_id'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_transaction_type', columnNames: ['transaction_type'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_status', columnNames: ['status'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_transaction_date', columnNames: ['transaction_date'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_payment_method', columnNames: ['payment_method'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_external_transaction_id', columnNames: ['external_transaction_id'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_parent_transaction_id', columnNames: ['parent_transaction_id'] }));
    await queryRunner.createIndex('billing_transactions', new TableIndex({ name: 'IDX_billing_transactions_transaction_number', columnNames: ['transaction_number'], isUnique: true }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes and tables in reverse order
    await queryRunner.dropTable('billing_transactions');
    await queryRunner.dropTable('legal_research_queries');
    await queryRunner.dropTable('compliance_records');
    await queryRunner.dropTable('sso_configurations');
    await queryRunner.dropTable('enterprise_organizations');
  }
}
