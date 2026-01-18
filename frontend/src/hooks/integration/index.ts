/**
 * @module hooks/integration
 * @category Hooks - Backend Integration
 * 
 * Backend integration hooks barrel export.
 * 
 * Provides hooks that bridge the gap between core hooks and backend services:
 * - Auto-save with backend persistence
 * - Backend health monitoring
 * - WebSocket real-time updates
 */

// Auto-save integration
export {
  useBackendAutoSave,
  type DataServiceDomain,
  type UseBackendAutoSaveOptions
} from './useBackendAutoSave';

export {
  useBackendEnhancedAutoSave,
  type UseBackendEnhancedAutoSaveOptions
} from './useBackendEnhancedAutoSave';

// Health monitoring
export {
  useBackendHealth,
  useDomainHealth,
  useMultiDomainHealth,
  type BackendHealthResult,
  type DomainHealthResult,
  type HealthStatus,
  type UseBackendHealthOptions
} from './useBackendHealth';

// WebSocket real-time
export {
  useWebSocket,
  useWebSocketChannel,
  type UseWebSocketOptions,
  type UseWebSocketReturn,
  type WebSocketMessage,
  type WebSocketState
} from './useWebSocket';
