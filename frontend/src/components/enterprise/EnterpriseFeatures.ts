/**
 * @module components/enterprise/EnterpriseFeatures
 * @category Enterprise - Feature Management
 * @description Feature flags, license tiers, and feature availability matrix for LexiFlow Premium
 *
 * This module provides:
 * - License tier definitions (Basic, Professional, Enterprise, Ultimate)
 * - Feature flags for enterprise features
 * - Feature availability matrix by license tier
 * - Runtime feature checking utilities
 * - Role-based feature access control
 *
 * @example
 * ```tsx
 * import { hasFeature, LicenseTier, EnterpriseFeature } from '@/components/enterprise/EnterpriseFeatures';
 *
 * // Check if a feature is available for a license tier
 * const canUseSSO = hasFeature(LicenseTier.Enterprise, EnterpriseFeature.SSO);
 *
 * // Get all features for a tier
 * const features = getAvailableFeatures(LicenseTier.Professional);
 * ```
 */

// ============================================================================
// LICENSE TIER DEFINITIONS
// ============================================================================

/**
 * License tiers for LexiFlow Premium
 * Each tier unlocks progressively more features
 */
export enum LicenseTier {
  /** Basic tier - Individual practitioners and small firms */
  Basic = "basic",

  /** Professional tier - Small to medium firms */
  Professional = "professional",

  /** Enterprise tier - Large firms and legal departments */
  Enterprise = "enterprise",

  /** Ultimate tier - Enterprise+ with all features */
  Ultimate = "ultimate",
}

/**
 * License tier metadata
 */
export interface LicenseTierInfo {
  tier: LicenseTier;
  name: string;
  description: string;
  maxUsers: number | null; // null = unlimited
  maxCases: number | null; // null = unlimited
  maxStorage: string; // e.g., "100GB", "unlimited"
  monthlyPrice: number; // USD per user/month
  annualPrice: number; // USD per user/year
}

/**
 * License tier configuration
 */
export const LICENSE_TIERS: Record<LicenseTier, LicenseTierInfo> = {
  [LicenseTier.Basic]: {
    tier: LicenseTier.Basic,
    name: "Basic",
    description: "Essential legal practice management for solo practitioners",
    maxUsers: 5,
    maxCases: 100,
    maxStorage: "100GB",
    monthlyPrice: 49,
    annualPrice: 470, // ~20% discount
  },
  [LicenseTier.Professional]: {
    tier: LicenseTier.Professional,
    name: "Professional",
    description: "Advanced features for growing law firms",
    maxUsers: 50,
    maxCases: 1000,
    maxStorage: "1TB",
    monthlyPrice: 99,
    annualPrice: 950,
  },
  [LicenseTier.Enterprise]: {
    tier: LicenseTier.Enterprise,
    name: "Enterprise",
    description: "Enterprise-grade platform for large organizations",
    maxUsers: null, // unlimited
    maxCases: null, // unlimited
    maxStorage: "10TB",
    monthlyPrice: 199,
    annualPrice: 1910,
  },
  [LicenseTier.Ultimate]: {
    tier: LicenseTier.Ultimate,
    name: "Ultimate",
    description: "Complete platform with all features and premium support",
    maxUsers: null, // unlimited
    maxCases: null, // unlimited
    maxStorage: "unlimited",
    monthlyPrice: 299,
    annualPrice: 2870,
  },
};

// ============================================================================
// ENTERPRISE FEATURES
// ============================================================================

/**
 * Enterprise features available in LexiFlow Premium
 */
export enum EnterpriseFeature {
  // Authentication & Security
  SSO = "sso",
  SAML = "saml",
  MFA = "mfa",
  RBAC = "rbac",
  API_KEYS = "api_keys",
  AUDIT_LOGS = "audit_logs",
  IP_WHITELISTING = "ip_whitelisting",
  SESSION_MANAGEMENT = "session_management",

  // Dashboard & Analytics
  EXECUTIVE_DASHBOARD = "executive_dashboard",
  ADVANCED_ANALYTICS = "advanced_analytics",
  CUSTOM_REPORTS = "custom_reports",
  DATA_EXPORT = "data_export",
  REAL_TIME_METRICS = "real_time_metrics",
  PREDICTIVE_ANALYTICS = "predictive_analytics",

  // Case Management
  UNLIMITED_CASES = "unlimited_cases",
  CASE_TEMPLATES = "case_templates",
  MASS_CASE_OPERATIONS = "mass_case_operations",
  CASE_BUDGETING = "case_budgeting",
  CASE_TEAM_COLLABORATION = "case_team_collaboration",
  CASE_TIMELINE = "case_timeline",

  // Document Management
  VERSION_CONTROL = "version_control",
  DOCUMENT_WORKFLOW = "document_workflow",
  ELECTRONIC_SIGNATURE = "electronic_signature",
  DOCUMENT_TEMPLATES = "document_templates",
  BULK_DOCUMENT_OPERATIONS = "bulk_document_operations",
  DOCUMENT_AUDIT_TRAIL = "document_audit_trail",
  OCR = "ocr",

  // eDiscovery & Evidence
  EDISCOVERY = "ediscovery",
  PRIVILEGE_LOG = "privilege_log",
  PRODUCTION_MANAGEMENT = "production_management",
  EVIDENCE_CHAIN_CUSTODY = "evidence_chain_custody",
  EXHIBIT_ORGANIZER = "exhibit_organizer",
  LEGAL_HOLDS = "legal_holds",

  // Billing & Finance
  LEDES_BILLING = "ledes_billing",
  TRUST_ACCOUNTING = "trust_accounting",
  ADVANCED_INVOICING = "advanced_invoicing",
  PAYMENT_PROCESSING = "payment_processing",
  FINANCIAL_REPORTS = "financial_reports",
  BUDGET_TRACKING = "budget_tracking",
  TIME_TRACKING = "time_tracking",

  // CRM & Client Management
  CLIENT_PORTAL = "client_portal",
  INTAKE_MANAGEMENT = "intake_management",
  CLIENT_ANALYTICS = "client_analytics",
  BUSINESS_DEVELOPMENT = "business_development",
  CONFLICT_CHECKING = "conflict_checking",

  // Research & Knowledge
  AI_RESEARCH_ASSISTANT = "ai_research_assistant",
  CITATION_MANAGEMENT = "citation_management",
  KNOWLEDGE_BASE = "knowledge_base",
  RESEARCH_MEMO = "research_memo",
  STATUTORY_MONITORING = "statutory_monitoring",

  // Collaboration & Communication
  TEAM_COLLABORATION = "team_collaboration",
  REAL_TIME_NOTIFICATIONS = "real_time_notifications",
  VIDEO_CONFERENCING = "video_conferencing",
  SECURE_MESSAGING = "secure_messaging",

  // Data & Integration
  ADVANCED_DATA_GRID = "advanced_data_grid",
  CUSTOM_FIELDS = "custom_fields",
  API_ACCESS = "api_access",
  WEBHOOKS = "webhooks",
  THIRD_PARTY_INTEGRATIONS = "third_party_integrations",
  DATA_IMPORT_EXPORT = "data_import_export",

  // Administration
  CUSTOM_BRANDING = "custom_branding",
  MULTI_TENANT = "multi_tenant",
  BACKUP_RESTORE = "backup_restore",
  COMPLIANCE_REPORTING = "compliance_reporting",
  SLA_GUARANTEES = "sla_guarantees",
  DEDICATED_SUPPORT = "dedicated_support",
}

/**
 * Feature category for organization
 */
export enum FeatureCategory {
  Authentication = "authentication",
  Dashboard = "dashboard",
  CaseManagement = "case_management",
  Documents = "documents",
  Discovery = "discovery",
  Billing = "billing",
  CRM = "crm",
  Research = "research",
  Collaboration = "collaboration",
  Data = "data",
  Administration = "administration",
}

/**
 * Feature metadata
 */
export interface FeatureInfo {
  feature: EnterpriseFeature;
  name: string;
  description: string;
  category: FeatureCategory;
  requiredTier: LicenseTier;
  icon?: string;
}

// ============================================================================
// FEATURE AVAILABILITY MATRIX
// ============================================================================

/**
 * Feature availability by license tier
 * Maps each feature to the minimum tier required
 */
export const FEATURE_AVAILABILITY: Record<EnterpriseFeature, LicenseTier> = {
  // Authentication & Security
  [EnterpriseFeature.SSO]: LicenseTier.Enterprise,
  [EnterpriseFeature.SAML]: LicenseTier.Enterprise,
  [EnterpriseFeature.MFA]: LicenseTier.Professional,
  [EnterpriseFeature.RBAC]: LicenseTier.Professional,
  [EnterpriseFeature.API_KEYS]: LicenseTier.Professional,
  [EnterpriseFeature.AUDIT_LOGS]: LicenseTier.Enterprise,
  [EnterpriseFeature.IP_WHITELISTING]: LicenseTier.Enterprise,
  [EnterpriseFeature.SESSION_MANAGEMENT]: LicenseTier.Professional,

  // Dashboard & Analytics
  [EnterpriseFeature.EXECUTIVE_DASHBOARD]: LicenseTier.Professional,
  [EnterpriseFeature.ADVANCED_ANALYTICS]: LicenseTier.Enterprise,
  [EnterpriseFeature.CUSTOM_REPORTS]: LicenseTier.Professional,
  [EnterpriseFeature.DATA_EXPORT]: LicenseTier.Basic,
  [EnterpriseFeature.REAL_TIME_METRICS]: LicenseTier.Enterprise,
  [EnterpriseFeature.PREDICTIVE_ANALYTICS]: LicenseTier.Ultimate,

  // Case Management
  [EnterpriseFeature.UNLIMITED_CASES]: LicenseTier.Enterprise,
  [EnterpriseFeature.CASE_TEMPLATES]: LicenseTier.Professional,
  [EnterpriseFeature.MASS_CASE_OPERATIONS]: LicenseTier.Enterprise,
  [EnterpriseFeature.CASE_BUDGETING]: LicenseTier.Professional,
  [EnterpriseFeature.CASE_TEAM_COLLABORATION]: LicenseTier.Professional,
  [EnterpriseFeature.CASE_TIMELINE]: LicenseTier.Basic,

  // Document Management
  [EnterpriseFeature.VERSION_CONTROL]: LicenseTier.Professional,
  [EnterpriseFeature.DOCUMENT_WORKFLOW]: LicenseTier.Enterprise,
  [EnterpriseFeature.ELECTRONIC_SIGNATURE]: LicenseTier.Professional,
  [EnterpriseFeature.DOCUMENT_TEMPLATES]: LicenseTier.Basic,
  [EnterpriseFeature.BULK_DOCUMENT_OPERATIONS]: LicenseTier.Enterprise,
  [EnterpriseFeature.DOCUMENT_AUDIT_TRAIL]: LicenseTier.Enterprise,
  [EnterpriseFeature.OCR]: LicenseTier.Professional,

  // eDiscovery & Evidence
  [EnterpriseFeature.EDISCOVERY]: LicenseTier.Enterprise,
  [EnterpriseFeature.PRIVILEGE_LOG]: LicenseTier.Enterprise,
  [EnterpriseFeature.PRODUCTION_MANAGEMENT]: LicenseTier.Enterprise,
  [EnterpriseFeature.EVIDENCE_CHAIN_CUSTODY]: LicenseTier.Professional,
  [EnterpriseFeature.EXHIBIT_ORGANIZER]: LicenseTier.Professional,
  [EnterpriseFeature.LEGAL_HOLDS]: LicenseTier.Enterprise,

  // Billing & Finance
  [EnterpriseFeature.LEDES_BILLING]: LicenseTier.Enterprise,
  [EnterpriseFeature.TRUST_ACCOUNTING]: LicenseTier.Professional,
  [EnterpriseFeature.ADVANCED_INVOICING]: LicenseTier.Professional,
  [EnterpriseFeature.PAYMENT_PROCESSING]: LicenseTier.Professional,
  [EnterpriseFeature.FINANCIAL_REPORTS]: LicenseTier.Professional,
  [EnterpriseFeature.BUDGET_TRACKING]: LicenseTier.Professional,
  [EnterpriseFeature.TIME_TRACKING]: LicenseTier.Basic,

  // CRM & Client Management
  [EnterpriseFeature.CLIENT_PORTAL]: LicenseTier.Professional,
  [EnterpriseFeature.INTAKE_MANAGEMENT]: LicenseTier.Professional,
  [EnterpriseFeature.CLIENT_ANALYTICS]: LicenseTier.Enterprise,
  [EnterpriseFeature.BUSINESS_DEVELOPMENT]: LicenseTier.Enterprise,
  [EnterpriseFeature.CONFLICT_CHECKING]: LicenseTier.Professional,

  // Research & Knowledge
  [EnterpriseFeature.AI_RESEARCH_ASSISTANT]: LicenseTier.Professional,
  [EnterpriseFeature.CITATION_MANAGEMENT]: LicenseTier.Professional,
  [EnterpriseFeature.KNOWLEDGE_BASE]: LicenseTier.Professional,
  [EnterpriseFeature.RESEARCH_MEMO]: LicenseTier.Professional,
  [EnterpriseFeature.STATUTORY_MONITORING]: LicenseTier.Enterprise,

  // Collaboration & Communication
  [EnterpriseFeature.TEAM_COLLABORATION]: LicenseTier.Professional,
  [EnterpriseFeature.REAL_TIME_NOTIFICATIONS]: LicenseTier.Professional,
  [EnterpriseFeature.VIDEO_CONFERENCING]: LicenseTier.Enterprise,
  [EnterpriseFeature.SECURE_MESSAGING]: LicenseTier.Professional,

  // Data & Integration
  [EnterpriseFeature.ADVANCED_DATA_GRID]: LicenseTier.Professional,
  [EnterpriseFeature.CUSTOM_FIELDS]: LicenseTier.Professional,
  [EnterpriseFeature.API_ACCESS]: LicenseTier.Enterprise,
  [EnterpriseFeature.WEBHOOKS]: LicenseTier.Enterprise,
  [EnterpriseFeature.THIRD_PARTY_INTEGRATIONS]: LicenseTier.Enterprise,
  [EnterpriseFeature.DATA_IMPORT_EXPORT]: LicenseTier.Professional,

  // Administration
  [EnterpriseFeature.CUSTOM_BRANDING]: LicenseTier.Enterprise,
  [EnterpriseFeature.MULTI_TENANT]: LicenseTier.Enterprise,
  [EnterpriseFeature.BACKUP_RESTORE]: LicenseTier.Enterprise,
  [EnterpriseFeature.COMPLIANCE_REPORTING]: LicenseTier.Enterprise,
  [EnterpriseFeature.SLA_GUARANTEES]: LicenseTier.Ultimate,
  [EnterpriseFeature.DEDICATED_SUPPORT]: LicenseTier.Ultimate,
};

// ============================================================================
// TIER COMPARISON
// ============================================================================

/**
 * License tier hierarchy for comparison
 */
const TIER_HIERARCHY: Record<LicenseTier, number> = {
  [LicenseTier.Basic]: 1,
  [LicenseTier.Professional]: 2,
  [LicenseTier.Enterprise]: 3,
  [LicenseTier.Ultimate]: 4,
};

/**
 * Check if a license tier has access to a feature
 *
 * @param userTier - The user's current license tier
 * @param feature - The feature to check
 * @returns true if the user has access to the feature
 *
 * @example
 * ```ts
 * const canUseSSO = hasFeature(LicenseTier.Enterprise, EnterpriseFeature.SSO); // true
 * const canUseSSO = hasFeature(LicenseTier.Basic, EnterpriseFeature.SSO); // false
 * ```
 */
export function hasFeature(
  userTier: LicenseTier,
  feature: EnterpriseFeature
): boolean {
  const requiredTier = FEATURE_AVAILABILITY[feature];
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

/**
 * Check if a license tier can be upgraded to another tier
 *
 * @param currentTier - Current license tier
 * @param targetTier - Target license tier
 * @returns true if upgrade is possible (target tier is higher)
 */
export function canUpgradeTo(
  currentTier: LicenseTier,
  targetTier: LicenseTier
): boolean {
  return TIER_HIERARCHY[targetTier] > TIER_HIERARCHY[currentTier];
}

/**
 * Get all features available for a license tier
 *
 * @param tier - License tier
 * @returns Array of features available for the tier
 */
export function getAvailableFeatures(tier: LicenseTier): EnterpriseFeature[] {
  return Object.entries(FEATURE_AVAILABILITY)
    .filter(([feature, requiredTier]) => {
      const tierLevel = TIER_HIERARCHY[requiredTier];
      return (
        tierLevel !== undefined &&
        hasFeature(tier, feature as EnterpriseFeature)
      );
    })
    .map(([feature]) => feature as EnterpriseFeature);
}

/**
 * Get features that would be unlocked by upgrading to a target tier
 *
 * @param currentTier - Current license tier
 * @param targetTier - Target license tier
 * @returns Array of features that would be unlocked
 */
export function getUpgradeFeatures(
  currentTier: LicenseTier,
  targetTier: LicenseTier
): EnterpriseFeature[] {
  const currentFeatures = new Set(getAvailableFeatures(currentTier));
  const targetFeatures = getAvailableFeatures(targetTier);

  return targetFeatures.filter((feature) => !currentFeatures.has(feature));
}

/**
 * Get the minimum tier required for a set of features
 *
 * @param features - Array of features
 * @returns Minimum license tier that includes all features
 */
export function getRequiredTier(features: EnterpriseFeature[]): LicenseTier {
  if (features.length === 0) {
    return "Starter" as LicenseTier;
  }

  const tiers = features.map((feature) => FEATURE_AVAILABILITY[feature]);
  const maxTierLevel = Math.max(
    ...tiers.map((requiredTier) => TIER_HIERARCHY[requiredTier])
  );

  return Object.entries(TIER_HIERARCHY).find(
    ([_, level]) => level === maxTierLevel
  )?.[0] as LicenseTier;
}

/**
 * Get features grouped by category for a license tier
 *
 * @param tier - License tier
 * @returns Features grouped by category
 */
export function getFeaturesByCategory(
  tier: LicenseTier
): Record<FeatureCategory, EnterpriseFeature[]> {
  const features = getAvailableFeatures(tier);
  const grouped: Record<FeatureCategory, EnterpriseFeature[]> = {
    [FeatureCategory.Authentication]: [],
    [FeatureCategory.Dashboard]: [],
    [FeatureCategory.CaseManagement]: [],
    [FeatureCategory.Documents]: [],
    [FeatureCategory.Discovery]: [],
    [FeatureCategory.Billing]: [],
    [FeatureCategory.CRM]: [],
    [FeatureCategory.Research]: [],
    [FeatureCategory.Collaboration]: [],
    [FeatureCategory.Data]: [],
    [FeatureCategory.Administration]: [],
  };

  // Categorize features
  features.forEach((feature) => {
    const featureName = feature.toString();

    // Simple categorization based on feature name
    if (
      featureName.includes("sso") ||
      featureName.includes("saml") ||
      featureName.includes("mfa") ||
      featureName.includes("rbac") ||
      featureName.includes("audit") ||
      featureName.includes("session")
    ) {
      grouped[FeatureCategory.Authentication].push(feature);
    } else if (
      featureName.includes("dashboard") ||
      featureName.includes("analytics") ||
      featureName.includes("report") ||
      featureName.includes("metric")
    ) {
      grouped[FeatureCategory.Dashboard].push(feature);
    } else if (featureName.includes("case")) {
      grouped[FeatureCategory.CaseManagement].push(feature);
    } else if (featureName.includes("document")) {
      grouped[FeatureCategory.Documents].push(feature);
    } else if (
      featureName.includes("discovery") ||
      featureName.includes("evidence") ||
      featureName.includes("exhibit") ||
      featureName.includes("privilege")
    ) {
      grouped[FeatureCategory.Discovery].push(feature);
    } else if (
      featureName.includes("billing") ||
      featureName.includes("invoice") ||
      featureName.includes("payment") ||
      featureName.includes("trust") ||
      featureName.includes("financial") ||
      featureName.includes("budget") ||
      featureName.includes("time_tracking")
    ) {
      grouped[FeatureCategory.Billing].push(feature);
    } else if (
      featureName.includes("client") ||
      featureName.includes("intake") ||
      featureName.includes("conflict") ||
      featureName.includes("business_development")
    ) {
      grouped[FeatureCategory.CRM].push(feature);
    } else if (
      featureName.includes("research") ||
      featureName.includes("citation") ||
      featureName.includes("knowledge") ||
      featureName.includes("statutory")
    ) {
      grouped[FeatureCategory.Research].push(feature);
    } else if (
      featureName.includes("collaboration") ||
      featureName.includes("notification") ||
      featureName.includes("messaging") ||
      featureName.includes("video")
    ) {
      grouped[FeatureCategory.Collaboration].push(feature);
    } else if (
      featureName.includes("api") ||
      featureName.includes("webhook") ||
      featureName.includes("integration") ||
      featureName.includes("data") ||
      featureName.includes("custom_field")
    ) {
      grouped[FeatureCategory.Data].push(feature);
    } else {
      grouped[FeatureCategory.Administration].push(feature);
    }
  });

  return grouped;
}

// ============================================================================
// FEATURE FLAGS FOR DEVELOPMENT
// ============================================================================

/**
 * Feature flags for development and testing
 * These can override license-based restrictions for development
 */
export interface FeatureFlags {
  /** Enable all enterprise features regardless of license */
  enableAllFeatures?: boolean;

  /** Override specific features (true = enabled, false = disabled) */
  overrides?: Partial<Record<EnterpriseFeature, boolean>>;

  /** Enable beta/experimental features */
  enableBetaFeatures?: boolean;

  /** Enable feature telemetry */
  enableTelemetry?: boolean;
}

/**
 * Default feature flags (development mode)
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableAllFeatures: process.env.NODE_ENV === "development",
  overrides: {},
  enableBetaFeatures: false,
  enableTelemetry: true,
};

/**
 * Check if a feature is enabled considering both license and feature flags
 *
 * @param userTier - User's license tier
 * @param feature - Feature to check
 * @param flags - Feature flags override
 * @returns true if feature is enabled
 */
export function isFeatureEnabled(
  userTier: LicenseTier,
  feature: EnterpriseFeature,
  flags: FeatureFlags = DEFAULT_FEATURE_FLAGS
): boolean {
  // Check feature flag override first
  if (flags.overrides?.[feature] !== undefined) {
    return flags.overrides[feature]!;
  }

  // Check if all features are enabled
  if (flags.enableAllFeatures) {
    return true;
  }

  // Fall back to license-based check
  return hasFeature(userTier, feature);
}

// ============================================================================
// EXPORTS
// ============================================================================

// Types are already exported at definition sites or via 'export interface'
