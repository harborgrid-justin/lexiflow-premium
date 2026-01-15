/**
 * Service Provider Types
 * Type definitions for service orchestration context
 *
 * @module lib/service/types
 */

export interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  lastCheck: string;
  responseTime?: number;
}

export interface ServiceStateValue {
  services: ServiceHealth[];
  isOnline: boolean;
  lastSync: string | null;
  pendingOperations: number;
}

export interface ServiceActionsValue {
  checkHealth: (serviceName?: string) => Promise<ServiceHealth[]>;
  syncData: () => Promise<void>;
  retryFailedOperations: () => Promise<void>;
  clearQueue: () => void;
}

export interface ServiceProviderProps {
  children: React.ReactNode;
  healthCheckInterval?: number;
}
