/**
 * Backend Discovery Service
 * Auto-detects if the backend is available and reports health status
 * Does NOT automatically switch - user controls data source selection
 */

import { BACKEND_DISCOVERY_CHECK_INTERVAL_MS } from "@/config/features/services.config";
import { getApiBaseUrl } from "@/config/network/api.config";
import { TIMEOUTS } from "@/config/ports.config";

export interface BackendStatus {
  available: boolean;
  healthy: boolean;
  lastChecked: Date;
  version?: string;
  latency?: number;
  error?: string;
}

type BackendStatusCallback = (status: BackendStatus) => void;

class BackendDiscoveryService {
  private status: BackendStatus = {
    available: false,
    healthy: false,
    lastChecked: new Date(),
  };

  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: Set<BackendStatusCallback> = new Set();
  private readonly CHECK_INTERVAL_MS = BACKEND_DISCOVERY_CHECK_INTERVAL_MS;

  // Dynamic getter for health endpoint
  private getHealthEndpoint(): string {
    return `${getApiBaseUrl()}/api/health`;
  }

  private readonly TIMEOUT_MS = TIMEOUTS.BACKEND_DISCOVERY; // Use centralized timeout
  private notifyTimeout: NodeJS.Timeout | null = null; // Debounce notifications

  /**
   * Start auto-discovery service
   */
  start(): void {
    console.log("[BackendDiscovery] Starting auto-discovery service");

    // Perform initial check immediately
    this.checkBackend();

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.checkBackend();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Stop auto-discovery service
   */
  stop(): void {
    console.log("[BackendDiscovery] Stopping auto-discovery service");

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.notifyTimeout) {
      clearTimeout(this.notifyTimeout);
      this.notifyTimeout = null;
    }
  }

  /**
   * Check if backend is available and healthy
   */
  private async checkBackend(): Promise<void> {
    const startTime = Date.now();
    // const endpoint = this.getHealthEndpoint(); // Unused
    // Reduce console noise - only log on state changes
    const wasHealthy = this.status.healthy;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(this.getHealthEndpoint(), {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (response.ok) {
        let version: string | undefined;

        try {
          const data = await response.json();
          version = data.version || data.info?.version;
        } catch (error) {
          // If response isn't JSON, that's okay - silently continue
          console.debug("[BackendDiscovery] Response is not JSON:", error);
        }

        this.updateStatus({
          available: true,
          healthy: response.status === 200,
          lastChecked: new Date(),
          ...(version ? { version } : {}),
          latency,
        });

        // Only log on status change or first success
        if (!wasHealthy || !this.status.lastChecked) {
          console.log(
            `[BackendDiscovery] Backend is ${this.status.healthy ? "healthy" : "available"} (${latency}ms)`,
          );
        }
      } else {
        this.updateStatus({
          available: true,
          healthy: false,
          lastChecked: new Date(),
          latency,
          error: `HTTP ${response.status}: ${response.statusText}`,
        });

        console.warn(
          `[BackendDiscovery] Backend returned error: ${response.status}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.updateStatus({
        available: false,
        healthy: false,
        lastChecked: new Date(),
        error: errorMessage,
      });

      // Only log if status changed from available to unavailable
      if (this.status.available) {
        console.warn("[BackendDiscovery] Backend unavailable:", errorMessage);
      }
    }
  }

  /**
   * Update status and notify listeners
   */
  private updateStatus(newStatus: BackendStatus): void {
    const previousAvailable = this.status.available;
    const previousHealthy = this.status.healthy;

    this.status = newStatus;

    // Notify listeners if status changed
    if (
      previousAvailable !== newStatus.available ||
      previousHealthy !== newStatus.healthy
    ) {
      this.notifyListeners();
    }
  }

  /**
   * Notify all registered listeners (debounced to prevent performance issues)
   */
  private notifyListeners(): void {
    // Clear any pending notification
    if (this.notifyTimeout) {
      clearTimeout(this.notifyTimeout);
    }

    // Debounce notifications by 100ms to batch rapid updates
    this.notifyTimeout = setTimeout(() => {
      this.listeners.forEach((callback) => {
        try {
          callback(this.status);
        } catch (error) {
          console.error(
            "[BackendDiscovery] Error in listener callback:",
            error,
          );
        }
      });
      this.notifyTimeout = null;
    }, 100);
  }

  /**
   * Get current backend status
   */
  getStatus(): BackendStatus {
    return { ...this.status };
  }

  /**
   * Subscribe to status changes
   */
  subscribe(callback: BackendStatusCallback): () => void {
    this.listeners.add(callback);

    // Immediately notify with current status
    callback(this.status);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Manually trigger a backend check (useful for user-initiated refresh)
   */
  async refresh(): Promise<BackendStatus> {
    await this.checkBackend();
    return this.getStatus();
  }

  /**
   * Check if backend is currently available
   */
  isAvailable(): boolean {
    return this.status.available;
  }

  /**
   * Check if backend is currently healthy
   */
  isHealthy(): boolean {
    return this.status.healthy;
  }
}

// Export singleton instance
export const backendDiscovery = new BackendDiscoveryService();

// HMR Cleanup - wrapped for Jest compatibility
if (typeof import.meta !== "undefined" && import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log("[BackendDiscovery] HMR dispose: stopping service");
    backendDiscovery.stop();
  });
}
