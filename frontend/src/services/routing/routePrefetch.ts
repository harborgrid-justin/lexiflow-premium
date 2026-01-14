/**
 * Route Prefetching Service
 *
 * Implements intelligent route prefetching strategies:
 * - Predictive prefetching based on user behavior
 * - Hover-based prefetching
 * - Viewport-based prefetching
 * - Priority-based prefetching
 *
 * @module services/routing/routePrefetch
 */

import { PATHS } from "@/config/paths.config";

export type PrefetchStrategy = "hover" | "viewport" | "predictive" | "priority";

export interface PrefetchConfig {
  strategy: PrefetchStrategy;
  delay?: number;
  priority?: "high" | "medium" | "low";
  enabled?: boolean;
}

export interface RouteMetadata {
  path: string;
  visits: number;
  lastVisit: number;
  transitionsFrom: Map<string, number>;
}

class RoutePrefetchService {
  private prefetchQueue = new Map<string, Promise<void>>();
  private routeMetadata = new Map<string, RouteMetadata>();
  private intersectionObserver: IntersectionObserver | null = null;
  private hoverTimers = new Map<string, number>();
  private enabled = true;
  private readonly HOVER_DELAY = 300; // ms
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initIntersectionObserver();
    this.loadMetadata();
  }

  /**
   * Initialize Intersection Observer for viewport-based prefetching
   */
  private initIntersectionObserver(): void {
    if (typeof IntersectionObserver === "undefined") return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const path = target.getAttribute("data-prefetch-path");
            if (path) {
              this.prefetchRoute(path, "viewport");
            }
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );
  }

  /**
   * Prefetch route data and components
   */
  async prefetchRoute(
    path: string,
    strategy: PrefetchStrategy = "hover",
    priority: "high" | "medium" | "low" = "medium"
  ): Promise<void> {
    if (!this.enabled) return;
    if (this.prefetchQueue.has(path)) return; // Already prefetching

    // Mark as prefetching
    const prefetchPromise = this.executePrefetch(path, priority);
    this.prefetchQueue.set(path, prefetchPromise);

    try {
      await prefetchPromise;
      console.log(`[Prefetch] Successfully prefetched: ${path} (${strategy})`);
    } catch (error) {
      console.error(`[Prefetch] Failed to prefetch ${path}:`, error);
    } finally {
      // Clean up after TTL
      setTimeout(() => {
        this.prefetchQueue.delete(path);
      }, this.CACHE_TTL);
    }
  }

  /**
   * Execute prefetch operation
   */
  private async executePrefetch(
    path: string,
    priority: "high" | "medium" | "low"
  ): Promise<void> {
    // Simulate network delay for demo
    if (import.meta.env.DEV) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // In production, this would:
    // 1. Preload route component chunks
    // 2. Prefetch route data (call loaders)
    // 3. Cache results in service worker

    // For React Router v7, we'd use the router's prefetch functionality
    // This is a placeholder for the actual implementation
    console.log(`[Prefetch] Prefetching ${path} with ${priority} priority`);
  }

  /**
   * Handle hover event for prefetching
   */
  onHover(path: string, element: HTMLElement): void {
    if (!this.enabled) return;

    // Clear any existing timer
    const existingTimer = this.hoverTimers.get(path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = window.setTimeout(() => {
      this.prefetchRoute(path, "hover");
      this.hoverTimers.delete(path);
    }, this.HOVER_DELAY);

    this.hoverTimers.set(path, timer);
  }

  /**
   * Handle hover leave event
   */
  onHoverLeave(path: string): void {
    const timer = this.hoverTimers.get(path);
    if (timer) {
      clearTimeout(timer);
      this.hoverTimers.delete(path);
    }
  }

  /**
   * Observe element for viewport-based prefetching
   */
  observeElement(element: HTMLElement, path: string): void {
    if (!this.enabled || !this.intersectionObserver) return;

    element.setAttribute("data-prefetch-path", path);
    this.intersectionObserver.observe(element);
  }

  /**
   * Unobserve element
   */
  unobserveElement(element: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  /**
   * Record route visit for predictive prefetching
   */
  recordVisit(currentPath: string, previousPath?: string): void {
    // Update current route metadata
    let metadata = this.routeMetadata.get(currentPath);
    if (!metadata) {
      metadata = {
        path: currentPath,
        visits: 0,
        lastVisit: Date.now(),
        transitionsFrom: new Map(),
      };
      this.routeMetadata.set(currentPath, metadata);
    }

    metadata.visits++;
    metadata.lastVisit = Date.now();

    // Record transition if there was a previous path
    if (previousPath) {
      const transitionCount = metadata.transitionsFrom.get(previousPath) || 0;
      metadata.transitionsFrom.set(previousPath, transitionCount + 1);
    }

    this.saveMetadata();
  }

  /**
   * Get predicted next routes based on current path
   */
  getPredictedRoutes(currentPath: string): string[] {
    const predictions: { path: string; score: number }[] = [];

    // Analyze all routes to find common transitions from current path
    this.routeMetadata.forEach((metadata) => {
      metadata.transitionsFrom.forEach((count, fromPath) => {
        if (fromPath === currentPath) {
          // Calculate prediction score based on transition frequency and recency
          const recencyFactor = 1 / (Date.now() - metadata.lastVisit + 1);
          const score = count * (1 + recencyFactor * 0.5);
          predictions.push({ path: metadata.path, score });
        }
      });
    });

    // Sort by score and return top 3
    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((p) => p.path);
  }

  /**
   * Prefetch predicted routes
   */
  prefetchPredicted(currentPath: string): void {
    if (!this.enabled) return;

    const predicted = this.getPredictedRoutes(currentPath);
    predicted.forEach((path, index) => {
      const priority = index === 0 ? "high" : index === 1 ? "medium" : "low";
      this.prefetchRoute(path, "predictive", priority);
    });
  }

  /**
   * Prefetch high-priority routes
   */
  prefetchHighPriority(): void {
    const highPriorityRoutes = [
      PATHS.DASHBOARD,
      PATHS.CASES,
      PATHS.CALENDAR,
      PATHS.DOCUMENTS,
    ];

    highPriorityRoutes.forEach((path) => {
      this.prefetchRoute(path, "priority", "high");
    });
  }

  /**
   * Load metadata from storage
   */
  private loadMetadata(): void {
    try {
      const stored = localStorage.getItem("route_prefetch_metadata");
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([path, meta]) => {
          const m = meta as Omit<RouteMetadata, "transitionsFrom"> & {
            transitionsFrom?: Record<string, number>;
          };
          this.routeMetadata.set(path, {
            ...m,
            transitionsFrom: new Map(Object.entries(m.transitionsFrom || {})),
          });
        });
      }
    } catch (error) {
      console.error("Failed to load prefetch metadata:", error);
    }
  }

  /**
   * Save metadata to storage
   */
  private saveMetadata(): void {
    try {
      const data: Record<string, unknown> = {};
      this.routeMetadata.forEach((meta, path) => {
        data[path] = {
          ...meta,
          transitionsFrom: Object.fromEntries(meta.transitionsFrom),
        };
      });
      localStorage.setItem("route_prefetch_metadata", JSON.stringify(data));
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Get prefetch statistics
   */
  getStatistics() {
    return {
      totalRoutes: this.routeMetadata.size,
      prefetchQueueSize: this.prefetchQueue.size,
      mostVisitedRoutes: Array.from(this.routeMetadata.values())
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5)
        .map((m) => ({ path: m.path, visits: m.visits })),
    };
  }

  /**
   * Clear all prefetch data
   */
  clear(): void {
    this.prefetchQueue.clear();
    this.routeMetadata.clear();
    this.hoverTimers.forEach((timer) => clearTimeout(timer));
    this.hoverTimers.clear();
    localStorage.removeItem("route_prefetch_metadata");
  }

  /**
   * Enable/disable prefetching
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if prefetching is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.clear();
  }
}

// Singleton instance
export const routePrefetch = new RoutePrefetchService();

// React hook for route prefetching
export function useRoutePrefetch() {
  return {
    prefetchRoute: routePrefetch.prefetchRoute.bind(routePrefetch),
    onHover: routePrefetch.onHover.bind(routePrefetch),
    onHoverLeave: routePrefetch.onHoverLeave.bind(routePrefetch),
    observeElement: routePrefetch.observeElement.bind(routePrefetch),
    unobserveElement: routePrefetch.unobserveElement.bind(routePrefetch),
    recordVisit: routePrefetch.recordVisit.bind(routePrefetch),
    prefetchPredicted: routePrefetch.prefetchPredicted.bind(routePrefetch),
    prefetchHighPriority:
      routePrefetch.prefetchHighPriority.bind(routePrefetch),
    getStatistics: routePrefetch.getStatistics.bind(routePrefetch),
  };
}
