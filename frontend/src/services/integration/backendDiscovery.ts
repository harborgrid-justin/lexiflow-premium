/**
 * Backend Discovery Service
 * Auto-detects if the backend is available and reports health status
 * Does NOT automatically switch - user controls data source selection
 */

import { API_BASE_URL } from '@/config/master.config';

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
  private readonly CHECK_INTERVAL_MS = 30000; // Check every 30 seconds
  private readonly HEALTH_ENDPOINT = `${API_BASE_URL}/health`; // Backend runs on port 5000
  private readonly TIMEOUT_MS = 5000; // 5 second timeout

  /**
   * Start auto-discovery service
   */
  start(): void {
    console.log('[BackendDiscovery] Starting auto-discovery service');
    
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
    console.log('[BackendDiscovery] Stopping auto-discovery service');
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check if backend is available and healthy
   */
  private async checkBackend(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(this.HEALTH_ENDPOINT, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (response.ok) {
        let version: string | undefined;
        
        try {
          const data = await response.json();
          version = data.version || data.info?.version;
        } catch {
          // If response isn't JSON, that's okay
        }

        this.updateStatus({
          available: true,
          healthy: response.status === 200,
          lastChecked: new Date(),
          version,
          latency,
          error: undefined,
        });

        console.log(`[BackendDiscovery] Backend is ${this.status.healthy ? 'healthy' : 'available'} (${latency}ms)`);
      } else {
        this.updateStatus({
          available: true,
          healthy: false,
          lastChecked: new Date(),
          latency,
          error: `HTTP ${response.status}: ${response.statusText}`,
        });

        console.warn(`[BackendDiscovery] Backend returned error: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.updateStatus({
        available: false,
        healthy: false,
        lastChecked: new Date(),
        error: errorMessage,
      });

      // Only log if status changed from available to unavailable
      if (this.status.available) {
        console.warn('[BackendDiscovery] Backend unavailable:', errorMessage);
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
    if (previousAvailable !== newStatus.available || previousHealthy !== newStatus.healthy) {
      this.notifyListeners();
    }
  }

  /**
   * Notify all registered listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.status);
      } catch (error) {
        console.error('[BackendDiscovery] Error in listener callback:', error);
      }
    });
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

