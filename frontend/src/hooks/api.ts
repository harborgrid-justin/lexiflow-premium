/**
 * API Hooks - Barrel Export
 *
 * @module hooks/api
 * @description Centralized export for all API-related hooks
 * Provides:
 * - Data fetching hooks (useApiQuery, useApiMutation)
 * - WebSocket hooks (useWebSocket, useWebSocketEvent)
 */

// Data fetching hooks
export { useApiQuery } from './useApiQuery';
export type { UseQueryOptions, UseQueryResult } from './useApiQuery';

export { useApiMutation } from './useApiMutation';
export type { UseMutationOptions, UseMutationResult } from './useApiMutation';

// WebSocket hooks
export { useWebSocket, useWebSocketEvent } from './useWebSocket';
export { ConnectionStatus } from './useWebSocket';
export type { WebSocketOptions, EventListener } from './useWebSocket';
