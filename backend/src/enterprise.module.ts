import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Enterprise Module - Master Integration
 *
 * This module serves as the central integration point for all enterprise-level
 * features of the LexiFlow Legal SaaS platform.
 *
 * Features Included:
 * - Multi-tenant Organization Management
 * - Single Sign-On (SAML, OAuth, OIDC, LDAP)
 * - Compliance & Audit Management (SOC 2, HIPAA, GDPR)
 * - Legal Research Query Tracking
 * - Advanced Billing & Transaction Management
 *
 * Usage:
 * Import this module in your main application module to enable all enterprise features.
 *
 * @example
 * ```typescript
 * import { EnterpriseModule } from './enterprise.module';
 *
 * @Module({
 *   imports: [EnterpriseModule],
 * })
 * export class AppModule {}
 * ```
 */

// Import all enterprise entities
import {
  EnterpriseOrganization,
  SSOConfiguration,
  ComplianceRecord,
  LegalResearchQuery,
  BillingTransaction,
} from './database/entities';

@Module({
  imports: [
    // Register all enterprise entities with TypeORM
    TypeOrmModule.forFeature([
      EnterpriseOrganization,
      SSOConfiguration,
      ComplianceRecord,
      LegalResearchQuery,
      BillingTransaction,
    ]),
  ],
  exports: [
    // Export TypeORM module so other modules can inject repositories
    TypeOrmModule,
  ],
})
export class EnterpriseModule {}

/**
 * Enterprise Entities Export
 *
 * Re-export all enterprise entities for convenience
 */
export {
  EnterpriseOrganization,
  SSOConfiguration,
  ComplianceRecord,
  LegalResearchQuery,
  BillingTransaction,
};

/**
 * Enterprise Feature Flags
 *
 * Feature flags for enabling/disabling enterprise features
 */
export const ENTERPRISE_FEATURES = {
  MULTI_TENANT: true,
  SSO_SAML: true,
  SSO_OAUTH: true,
  SSO_OIDC: true,
  SSO_LDAP: true,
  COMPLIANCE_SOC2: true,
  COMPLIANCE_HIPAA: true,
  COMPLIANCE_GDPR: true,
  LEGAL_RESEARCH: true,
  ADVANCED_BILLING: true,
  LEDES_BILLING: true,
  TRUST_ACCOUNTING: true,
  IP_WHITELISTING: true,
  MFA_ENFORCEMENT: true,
  AUDIT_LOGGING: true,
  API_ACCESS: true,
  CUSTOM_BRANDING: true,
  WHITELABEL: true,
} as const;

/**
 * Enterprise Configuration
 *
 * Default configuration values for enterprise features
 */
export const ENTERPRISE_CONFIG = {
  // Organization defaults
  DEFAULT_MAX_USERS: 10,
  DEFAULT_MAX_STORAGE_GB: 100,
  DEFAULT_DATA_RETENTION_DAYS: 2555, // 7 years
  DEFAULT_SUBSCRIPTION_TIER: 'professional',

  // SSO defaults
  DEFAULT_SESSION_TIMEOUT_MINUTES: 480, // 8 hours
  DEFAULT_MFA_REQUIRED: false,
  DEFAULT_AUTO_PROVISION_USERS: true,

  // Compliance defaults
  DEFAULT_COMPLIANCE_FRAMEWORKS: ['soc2_type2', 'hipaa', 'gdpr'],
  DEFAULT_AUDIT_LOG_RETENTION_DAYS: 2555, // 7 years
  DEFAULT_COMPLIANCE_REVIEW_FREQUENCY_MONTHS: 12,

  // Billing defaults
  DEFAULT_PAYMENT_TERMS_DAYS: 30,
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_LATE_FEE_PERCENTAGE: 1.5,
  DEFAULT_PROCESSING_FEE_PERCENTAGE: 2.9,

  // API defaults
  DEFAULT_API_RATE_LIMIT_PER_HOUR: 1000,
  DEFAULT_API_TIMEOUT_SECONDS: 30,
} as const;

/**
 * Enterprise Subscription Tiers
 *
 * Defines the capabilities of each subscription tier
 */
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    maxUsers: 1,
    maxStorageGb: 1,
    features: ['basic_document_management', 'basic_billing'],
    ssoEnabled: false,
    apiAccess: false,
    customBranding: false,
    support: 'community',
  },
  basic: {
    name: 'Basic',
    maxUsers: 5,
    maxStorageGb: 10,
    features: ['document_management', 'case_management', 'time_tracking', 'invoicing'],
    ssoEnabled: false,
    apiAccess: false,
    customBranding: false,
    support: 'email',
  },
  professional: {
    name: 'Professional',
    maxUsers: 50,
    maxStorageGb: 100,
    features: [
      'document_management',
      'case_management',
      'time_tracking',
      'invoicing',
      'legal_research',
      'compliance_basic',
      'calendar',
      'client_portal',
    ],
    ssoEnabled: true,
    apiAccess: true,
    customBranding: false,
    support: 'priority',
  },
  enterprise: {
    name: 'Enterprise',
    maxUsers: -1, // unlimited
    maxStorageGb: 1000,
    features: [
      'document_management',
      'case_management',
      'time_tracking',
      'invoicing',
      'legal_research',
      'compliance_full',
      'calendar',
      'client_portal',
      'ai_assistant',
      'e_discovery',
      'workflow_automation',
      'advanced_analytics',
      'audit_logging',
      'ip_whitelisting',
      'custom_integrations',
    ],
    ssoEnabled: true,
    apiAccess: true,
    customBranding: true,
    support: 'dedicated',
  },
  custom: {
    name: 'Custom',
    maxUsers: -1, // unlimited
    maxStorageGb: -1, // unlimited
    features: ['all'],
    ssoEnabled: true,
    apiAccess: true,
    customBranding: true,
    support: 'white_glove',
  },
} as const;

/**
 * Enterprise Compliance Frameworks
 *
 * Supported compliance frameworks and their requirements
 */
export const COMPLIANCE_FRAMEWORKS = {
  soc2_type1: {
    name: 'SOC 2 Type I',
    description: 'Trust Services Criteria - Point in Time',
    recertificationMonths: 12,
    requiredControls: ['access_control', 'encryption', 'monitoring', 'incident_response'],
  },
  soc2_type2: {
    name: 'SOC 2 Type II',
    description: 'Trust Services Criteria - Period of Time',
    recertificationMonths: 12,
    requiredControls: [
      'access_control',
      'encryption',
      'monitoring',
      'incident_response',
      'change_management',
      'backup_recovery',
    ],
  },
  hipaa: {
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    recertificationMonths: 12,
    requiredControls: [
      'access_control',
      'encryption_at_rest',
      'encryption_in_transit',
      'audit_logging',
      'business_associate_agreements',
    ],
  },
  gdpr: {
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    recertificationMonths: 12,
    requiredControls: [
      'consent_management',
      'right_to_erasure',
      'data_portability',
      'breach_notification',
      'privacy_by_design',
    ],
  },
  iso27001: {
    name: 'ISO 27001',
    description: 'Information Security Management System',
    recertificationMonths: 36,
    requiredControls: [
      'risk_assessment',
      'security_policy',
      'access_control',
      'cryptography',
      'operations_security',
    ],
  },
} as const;

/**
 * Enterprise Helper Functions
 */
export class EnterpriseHelper {
  /**
   * Check if a feature is enabled for a subscription tier
   */
  static isFeatureEnabled(tier: keyof typeof SUBSCRIPTION_TIERS, feature: string): boolean {
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    if (!tierConfig) return false;
    return tierConfig.features.includes(feature) || tierConfig.features.includes('all');
  }

  /**
   * Get compliance framework configuration
   */
  static getComplianceFramework(framework: string) {
    return COMPLIANCE_FRAMEWORKS[framework as keyof typeof COMPLIANCE_FRAMEWORKS];
  }

  /**
   * Calculate next compliance review date
   */
  static calculateNextReviewDate(framework: string, certificationDate: Date): Date {
    const config = this.getComplianceFramework(framework);
    if (!config) return new Date();

    const nextDate = new Date(certificationDate);
    nextDate.setMonth(nextDate.getMonth() + config.recertificationMonths);
    return nextDate;
  }

  /**
   * Check if organization is within user limits
   */
  static isWithinUserLimit(tier: keyof typeof SUBSCRIPTION_TIERS, currentUsers: number): boolean {
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    if (!tierConfig) return false;
    if (tierConfig.maxUsers === -1) return true; // unlimited
    return currentUsers <= tierConfig.maxUsers;
  }

  /**
   * Check if organization is within storage limits
   */
  static isWithinStorageLimit(
    tier: keyof typeof SUBSCRIPTION_TIERS,
    currentStorageGb: number,
  ): boolean {
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    if (!tierConfig) return false;
    if (tierConfig.maxStorageGb === -1) return true; // unlimited
    return currentStorageGb <= tierConfig.maxStorageGb;
  }
}
