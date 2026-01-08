/**
 * Analytics - User analytics and event tracking
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private enabled = process.env.NODE_ENV === "production";

  track(eventName: string, properties?: Record<string, unknown>) {
    if (!this.enabled) {
      console.log("[Analytics]", eventName, properties);
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(event);
    this.flush();
  }

  identify(userId: string, traits?: Record<string, unknown>) {
    this.track("identify", { userId, ...traits });
  }

  page(name: string, properties?: Record<string, unknown>) {
    this.track("page_view", { page: name, ...properties });
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error("Failed to send analytics:", error);
      // Re-queue events on failure
      this.queue.unshift(...events);
    }
  }
}

export const analytics = new Analytics();
