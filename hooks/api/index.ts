/**
 * React Query API Hooks Index
 * Central export for all React Query hooks
 */

// Case hooks
export * from './useCases';

// Document hooks
export * from './useDocuments';

// Billing hooks
export * from './useBilling';

// Analytics hooks
export * from './useAnalytics';

// Compliance hooks
export * from './useCompliance';

// Discovery hooks
export * from './useDiscovery';

// Re-export all hooks
import * as casesHooks from './useCases';
import * as documentsHooks from './useDocuments';
import * as billingHooks from './useBilling';
import * as analyticsHooks from './useAnalytics';
import * as complianceHooks from './useCompliance';
import * as discoveryHooks from './useDiscovery';

export default {
  cases: casesHooks,
  documents: documentsHooks,
  billing: billingHooks,
  analytics: analyticsHooks,
  compliance: complianceHooks,
  discovery: discoveryHooks,
};
