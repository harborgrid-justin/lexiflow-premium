/**
 * Database Entities Export
 *
 * Central export file for all enterprise database entities.
 * These entities represent the core data model for the LexiFlow Enterprise Legal SaaS platform.
 *
 * Entity Categories:
 * - Organizations: Multi-tenant organization management
 * - Authentication: SSO and security configurations
 * - Compliance: Regulatory compliance and audit tracking
 * - Legal Research: Legal research queries and analytics
 * - Billing: Financial transactions and billing records
 */

// Enterprise Organization Management
export { EnterpriseOrganization } from './enterprise-organization.entity';

// Single Sign-On and Authentication
export { SSOConfiguration } from './sso-configuration.entity';

// Compliance and Regulatory
export { ComplianceRecord } from './compliance-record.entity';

// Legal Research
export { LegalResearchQuery } from './legal-research-query.entity';

// Billing and Transactions
export { BillingTransaction } from './billing-transaction.entity';

/**
 * Entity Array for TypeORM Configuration
 *
 * Use this array when configuring TypeORM modules:
 *
 * @example
 * ```typescript
 * import { ENTERPRISE_ENTITIES } from '@database/entities';
 *
 * TypeOrmModule.forFeature(ENTERPRISE_ENTITIES)
 * ```
 */
export const ENTERPRISE_ENTITIES = [
  // Import the entity classes directly for TypeORM
  require('./enterprise-organization.entity').EnterpriseOrganization,
  require('./sso-configuration.entity').SSOConfiguration,
  require('./compliance-record.entity').ComplianceRecord,
  require('./legal-research-query.entity').LegalResearchQuery,
  require('./billing-transaction.entity').BillingTransaction,
];

/**
 * Entity Metadata
 *
 * Provides additional information about each entity for documentation
 * and automated tooling.
 */
export const ENTITY_METADATA = {
  EnterpriseOrganization: {
    tableName: 'enterprise_organizations',
    description: 'Multi-tenant organization management for law firms and legal departments',
    category: 'Core',
    features: ['Multi-tenancy', 'Subscription Management', 'SSO Integration', 'IP Whitelisting'],
  },
  SSOConfiguration: {
    tableName: 'sso_configurations',
    description: 'Single Sign-On configurations supporting SAML, OAuth, OIDC, and LDAP',
    category: 'Security',
    features: ['SAML 2.0', 'OAuth 2.0', 'OpenID Connect', 'LDAP/AD', 'JIT Provisioning'],
  },
  ComplianceRecord: {
    tableName: 'compliance_records',
    description: 'Compliance certifications, assessments, and regulatory tracking',
    category: 'Compliance',
    features: ['SOC 2', 'HIPAA', 'GDPR', 'ISO 27001', 'Audit Management', 'Remediation Tracking'],
  },
  LegalResearchQuery: {
    tableName: 'legal_research_queries',
    description: 'Legal research query tracking and analytics',
    category: 'Research',
    features: ['Case Law Search', 'Citation Analysis', 'AI Research', 'Shepardization', 'Analytics'],
  },
  BillingTransaction: {
    tableName: 'billing_transactions',
    description: 'Comprehensive billing transaction management',
    category: 'Billing',
    features: ['Payment Processing', 'LEDES Format', 'Trust Accounting', 'Reconciliation', 'Fraud Detection'],
  },
};

/**
 * Database Migration Helper
 *
 * Returns the entities in dependency order for migrations
 */
export function getEntitiesInMigrationOrder() {
  return [
    'EnterpriseOrganization', // Must be first (parent of many entities)
    'SSOConfiguration',       // Depends on organization
    'ComplianceRecord',       // Depends on organization
    'LegalResearchQuery',     // Depends on organization
    'BillingTransaction',     // Depends on organization
  ];
}
