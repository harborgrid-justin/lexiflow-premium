/**
 * @module components/enterprise
 * @category Enterprise Components
 * @description Enterprise-grade components for LexiFlow Premium
 *
 * This module provides comprehensive enterprise features including:
 * - Executive dashboards with KPIs and real-time analytics
 * - Advanced analytics widgets with interactive charts
 * - Specialized components for different practice areas
 * - Feature flags and license tier management
 * - Authentication and security components
 * - Data management and visualization
 * - Forms, notifications, and collaboration tools
 */

// ============================================================================
// FEATURE MANAGEMENT
// ============================================================================

export * from './EnterpriseFeatures';
export type {
  FeatureFlags,
  FeatureInfo,
  LicenseTierInfo,
} from './EnterpriseFeatures';

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

export { EnterpriseDashboard } from './EnterpriseDashboard';
export type { EnterpriseDashboardProps } from './EnterpriseDashboard';

export { AnalyticsWidgets } from './AnalyticsWidgets';
export type { AnalyticsWidgetsProps } from './AnalyticsWidgets';

// Re-export dashboard widgets for convenience
export * from './dashboard';

// Re-export analytics components for convenience
export * from './analytics';

// ============================================================================
// AUTHENTICATION & SECURITY
// ============================================================================

// Re-export all authentication components
export * from './auth';

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

// Re-export data grid and management components
export * from './data';

// ============================================================================
// FORMS
// ============================================================================

// Re-export enterprise form components
export * from './forms';

// ============================================================================
// NOTIFICATIONS
// ============================================================================

// Re-export notification system components
export * from './notifications';

// ============================================================================
// DOMAIN-SPECIFIC COMPONENTS
// ============================================================================

// Case Management
export * from './CaseManagement';

// CRM & Client Management
export * from './CRM';

// Document Management
export * from './Documents';

// eDiscovery & Evidence
export * from './Discovery';

// Billing & Finance
export * from './Billing';

// Legal Research
export * from './Research';
