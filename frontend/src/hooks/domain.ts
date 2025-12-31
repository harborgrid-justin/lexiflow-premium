/**
 * Domain-Specific Hooks Barrel Export
 *
 * Business logic hooks for cases, litigation, discovery, etc.
 * Import from '@/hooks/domain' for better tree-shaking.
 *
 * WARNING: These hooks may have heavy dependencies. Import only what you need.
 */

// Case Management
export { useCaseList } from './useCaseList';
export { useCaseDetail } from './useCaseDetail';
export { useCaseOverview } from './useCaseOverview';

// Document Management
export { useDocumentManager } from './useDocumentManager';
export { useBlobRegistry } from './useBlobRegistry';

// Discovery & Evidence
export { useDiscoveryPlatform } from './useDiscoveryPlatform';
export { useEvidenceManager } from './useEvidenceManager';

// Litigation & Strategy
export { useLitigationBuilder } from './useLitigationBuilder';
export { useStrategyCanvas } from './useStrategyCanvas';
export { useWorkflowBuilder } from './useWorkflowBuilder';

// Visualization
export { useNexusGraph } from './useNexusGraph';
export { useCalendarView } from './useCalendarView';

// Legal Research
export { useRuleSearchAndSelection } from './useRuleSearchAndSelection';

// Financial
export { useTrustAccounts } from './useTrustAccounts';
export { useSettlementSimulation } from './useSettlementSimulation';

// Operations
export { useTimeTracker } from './useTimeTracker';
export { useAutoTimeCapture } from './useAutoTimeCapture';
export { useSLAMonitoring } from './useSLAMonitoring';

// Data & Domain
// useDomainData doesn't exist as a single export - use individual hooks from './useDomainData' (e.g., useCases, useDocuments)
export * from './useDomainData';
export { useReadAnalytics } from './useReadAnalytics';

// Messaging & Real-time
export { useSecureMessenger } from './useSecureMessenger';
export { useLiveDocketFeed } from './useLiveDocketFeed';
export { usePresence } from './usePresence';
export { useWebSocket } from './useWebSocket';
export { useNotificationWebSocket } from './useNotificationWebSocket';
export { useRealTimeData } from './useRealTimeData';
export { useSync } from './useSync';
