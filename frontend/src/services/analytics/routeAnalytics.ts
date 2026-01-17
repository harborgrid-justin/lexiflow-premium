/**
 * @module services/analytics/routeAnalytics
 * @description Route analytics tracking service
 *
 * Provides analytics tracking for route navigation, transitions,
 * and user interactions with routing.
 */

interface RouteEvent {
  path: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class RouteAnalytics {
  private events: RouteEvent[] = [];

  track(path: string, metadata?: Record<string, unknown>): void {
    this.events.push({
      path,
      timestamp: Date.now(),
      ...(metadata ? { metadata } : {}),
    });

    // In production, send to analytics service
    if (import.meta.env?.PROD) {
      console.log("[Route Analytics]", { path, metadata });
    }
  }

  getEvents(): RouteEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

export const routeAnalytics = new RouteAnalytics();
