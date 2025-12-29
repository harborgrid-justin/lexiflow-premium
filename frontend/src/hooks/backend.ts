/**
 * Backend Integration Hooks Barrel Export
 * 
 * Hooks for backend API interaction and health monitoring.
 * Import from '@/hooks/backend' for better tree-shaking.
 */

// Backend Health & Discovery
export { useBackendHealth } from './useBackendHealth';
export { useBackendDiscovery } from './useBackendDiscovery';

// Query Hooks (React Query wrappers)
export { useQuery, useMutation, useQueryClient } from './useQueryHooks';

// Data Service Cleanup
export { useDataServiceCleanup } from './useDataServiceCleanup';

// Entity Operations
export { useEntityAutocomplete } from './useEntityAutocomplete';

// Notifications
export { useNotifications } from './useNotifications';
