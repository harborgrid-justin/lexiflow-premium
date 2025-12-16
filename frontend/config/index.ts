// config/index.ts
/**
 * Config Module Barrel Export
 * 
 * Central export point for all configuration modules.
 */

// Core configuration
export * from './master.config';
export * from './paths.config';
export * from './nav.config';

// Module-specific configurations
export * from './adminPanelConfig';
export * from './analyticsDashboardConfig';
export * from './billingDashboardConfig';
export * from './caseListConfig';
export * from './complianceDashboardConfig';
export * from './crmConfig';
export * from './dashboardConfig';
export * from './dataPlatformMenu';
export * from './documentManagerConfig';
export * from './evidenceVaultConfig';
export * from './knowledgeBaseConfig';
export * from './modules';
export * from './pleadingBuilderConfig';
export * from './prefetchConfig';
export * from './researchToolConfig';
export * from './rulesPlatformConfig';
