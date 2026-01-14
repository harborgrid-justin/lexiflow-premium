/**
 * Route Analytics Service
 *
 * Tracks route navigation, page views, and user journey analytics.
 * Integrates with Google Analytics, Mixpanel, or custom analytics backends.
 *
 * @module services/analytics/routeAnalytics
 */

import { performance } from "@/utils/performance";

export interface RouteAnalyticsEvent {
  type: "page_view" | "route_change" | "navigation_intent" | "route_error";
  path: string;
  previousPath?: string;
  timestamp: number;
  loadTime?: number;
  metadata?: Record<string, any>;
}

export interface UserJourney {
  sessionId: string;
  startTime: number;
  routes: RouteAnalyticsEvent[];
  currentRoute: string;
}

class RouteAnalyticsService {
  private events: RouteAnalyticsEvent[] = [];
  private journey: UserJourney | null = null;
  private performanceMarks = new Map<string, number>();
  private enabled = true;

  constructor() {
    this.initSession();
  }

  /**
   * Initialize analytics session
   */
  private initSession(): void {
    const sessionId = this.generateSessionId();
    this.journey = {
      sessionId,
      startTime: Date.now(),
      routes: [],
      currentRoute: window.location.pathname,
    };

    // Send session start event
    this.track({
      type: "page_view",
      path: window.location.pathname,
      timestamp: Date.now(),
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track route change event
   */
  trackRouteChange(currentPath: string, previousPath?: string): void {
    if (!this.enabled) return;

    const loadTime = this.getRouteLoadTime(currentPath);

    const event: RouteAnalyticsEvent = {
      type: "route_change",
      path: currentPath,
      previousPath,
      timestamp: Date.now(),
      loadTime,
    };

    this.track(event);

    // Update journey
    if (this.journey) {
      this.journey.currentRoute = currentPath;
      this.journey.routes.push(event);
    }

    // Send to external analytics
    this.sendToExternalAnalytics(event);
  }

  /**
   * Track page view
   */
  trackPageView(path: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    const event: RouteAnalyticsEvent = {
      type: "page_view",
      path,
      timestamp: Date.now(),
      metadata,
    };

    this.track(event);
    this.sendToExternalAnalytics(event);
  }

  /**
   * Track navigation intent (hover, click before navigation)
   */
  trackNavigationIntent(targetPath: string): void {
    if (!this.enabled) return;

    const event: RouteAnalyticsEvent = {
      type: "navigation_intent",
      path: targetPath,
      timestamp: Date.now(),
    };

    this.track(event);
  }

  /**
   * Track route error
   */
  trackRouteError(path: string, error: Error): void {
    const event: RouteAnalyticsEvent = {
      type: "route_error",
      path,
      timestamp: Date.now(),
      metadata: {
        error: error.message,
        stack: error.stack,
      },
    };

    this.track(event);
    this.sendToExternalAnalytics(event);
  }

  /**
   * Mark route load start
   */
  markRouteLoadStart(path: string): void {
    this.performanceMarks.set(path, performance.now());
  }

  /**
   * Mark route load end and calculate load time
   */
  markRouteLoadEnd(path: string): number | undefined {
    const startTime = this.performanceMarks.get(path);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      this.performanceMarks.delete(path);
      return loadTime;
    }
    return undefined;
  }

  /**
   * Get route load time
   */
  private getRouteLoadTime(path: string): number | undefined {
    return this.markRouteLoadEnd(path);
  }

  /**
   * Track event internally
   */
  private track(event: RouteAnalyticsEvent): void {
    this.events.push(event);

    // Log in development
    if (import.meta.env.DEV) {
      console.log("[Route Analytics]", event);
    }

    // Persist to localStorage for debugging
    this.persistEvents();
  }

  /**
   * Send event to external analytics services
   */
  private sendToExternalAnalytics(event: RouteAnalyticsEvent): void {
    // Google Analytics 4
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", event.type, {
        page_path: event.path,
        previous_path: event.previousPath,
        load_time: event.loadTime,
        ...event.metadata,
      });
    }

    // Mixpanel
    if (typeof window !== "undefined" && (window as any).mixpanel) {
      (window as any).mixpanel.track(event.type, {
        path: event.path,
        previousPath: event.previousPath,
        loadTime: event.loadTime,
        timestamp: event.timestamp,
        ...event.metadata,
      });
    }

    // Custom analytics endpoint
    this.sendToCustomEndpoint(event);
  }

  /**
   * Send to custom analytics backend
   */
  private async sendToCustomEndpoint(
    event: RouteAnalyticsEvent
  ): Promise<void> {
    try {
      // Only send in production
      if (import.meta.env.PROD) {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: this.journey?.sessionId,
            event,
          }),
        });
      }
    } catch (error) {
      console.error("Failed to send analytics:", error);
    }
  }

  /**
   * Persist events to localStorage
   */
  private persistEvents(): void {
    try {
      const recentEvents = this.events.slice(-100); // Keep last 100 events
      localStorage.setItem(
        "route_analytics_events",
        JSON.stringify(recentEvents)
      );
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    return {
      totalEvents: this.events.length,
      sessionId: this.journey?.sessionId,
      sessionDuration: this.journey ? Date.now() - this.journey.startTime : 0,
      routeCount: this.journey?.routes.length || 0,
      currentRoute: this.journey?.currentRoute,
      averageLoadTime: this.calculateAverageLoadTime(),
    };
  }

  /**
   * Calculate average route load time
   */
  private calculateAverageLoadTime(): number {
    const loadTimes = this.events
      .filter((e) => e.loadTime !== undefined)
      .map((e) => e.loadTime!);

    if (loadTimes.length === 0) return 0;
    return loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
  }

  /**
   * Get user journey
   */
  getUserJourney(): UserJourney | null {
    return this.journey;
  }

  /**
   * Clear analytics data
   */
  clear(): void {
    this.events = [];
    this.journey = null;
    localStorage.removeItem("route_analytics_events");
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if tracking is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const routeAnalytics = new RouteAnalyticsService();

// React hook for route analytics
export function useRouteAnalytics() {
  return {
    trackRouteChange: routeAnalytics.trackRouteChange.bind(routeAnalytics),
    trackPageView: routeAnalytics.trackPageView.bind(routeAnalytics),
    trackNavigationIntent:
      routeAnalytics.trackNavigationIntent.bind(routeAnalytics),
    trackRouteError: routeAnalytics.trackRouteError.bind(routeAnalytics),
    markRouteLoadStart: routeAnalytics.markRouteLoadStart.bind(routeAnalytics),
    markRouteLoadEnd: routeAnalytics.markRouteLoadEnd.bind(routeAnalytics),
    getAnalyticsSummary:
      routeAnalytics.getAnalyticsSummary.bind(routeAnalytics),
    getUserJourney: routeAnalytics.getUserJourney.bind(routeAnalytics),
  };
}
