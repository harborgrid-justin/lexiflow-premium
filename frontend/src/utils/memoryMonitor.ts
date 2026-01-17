/**
 * Frontend Memory Monitor
 * React performance and memory tracking for production
 *
 * @module utils/memoryMonitor
 */

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

interface PerformanceMetrics {
  componentRenders: Map<string, number>;
  slowRenders: Array<{
    component: string;
    duration: number;
    timestamp: number;
  }>;
  memorySnapshots: MemoryInfo[];
  cacheHits: number;
  cacheMisses: number;
}

class FrontendMemoryMonitor {
  private static instance: FrontendMemoryMonitor;
  private metrics: PerformanceMetrics;
  private monitorInterval: number | null = null;
  private readonly SLOW_RENDER_THRESHOLD = 16; // 16ms (60fps)
  private readonly MAX_SNAPSHOTS = 100;
  private readonly MAX_SLOW_RENDERS = 50;

  private constructor() {
    this.metrics = {
      componentRenders: new Map(),
      slowRenders: [],
      memorySnapshots: [],
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  static getInstance(): FrontendMemoryMonitor {
    if (!FrontendMemoryMonitor.instance) {
      FrontendMemoryMonitor.instance = new FrontendMemoryMonitor();
    }
    return FrontendMemoryMonitor.instance;
  }

  /**
   * Start monitoring
   */
  start(intervalMs: number = 60000): void {
    if (this.monitorInterval) {
      console.warn("Memory monitor already running");
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    if (import.meta.env.DEV) {
      console.warn("[MemoryMonitor] Starting with interval:", intervalMs);
    }

    this.monitorInterval = window.setInterval(() => {
      this.takeSnapshot();
      this.checkMemoryHealth();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitorInterval && typeof window !== "undefined") {
      window.clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      if (import.meta.env.DEV) {
        console.warn("[MemoryMonitor] Stopped");
      }
    }
  }

  /**
   * Take memory snapshot
   */
  takeSnapshot(): MemoryInfo | null {
    if (!("memory" in performance)) {
      return null;
    }

    const memory = (performance as Record<string, unknown>)["memory"] as {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    const snapshot: MemoryInfo = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };

    this.metrics.memorySnapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.metrics.memorySnapshots.length > this.MAX_SNAPSHOTS) {
      this.metrics.memorySnapshots.shift();
    }

    return snapshot;
  }

  /**
   * Check memory health and log warnings
   */
  checkMemoryHealth(): void {
    const snapshot = this.takeSnapshot();
    if (!snapshot) return;

    const usagePercent =
      (snapshot.usedJSHeapSize / snapshot.jsHeapSizeLimit) * 100;
    const usedMB = snapshot.usedJSHeapSize / 1024 / 1024;
    const totalMB = snapshot.totalJSHeapSize / 1024 / 1024;

    if (usagePercent > 90) {
      console.error(
        `[MemoryMonitor] CRITICAL: Memory usage at ${usagePercent.toFixed(1)}% ` +
          `(${usedMB.toFixed(0)}MB / ${totalMB.toFixed(0)}MB)`,
      );
    } else if (usagePercent > 75) {
      console.warn(
        `[MemoryMonitor] WARNING: Memory usage at ${usagePercent.toFixed(1)}% ` +
          `(${usedMB.toFixed(0)}MB / ${totalMB.toFixed(0)}MB)`,
      );
    }
  }

  /**
   * Track component render
   */
  trackRender(componentName: string, duration: number): void {
    // Update render count
    const currentCount = this.metrics.componentRenders.get(componentName) || 0;
    this.metrics.componentRenders.set(componentName, currentCount + 1);

    // Track slow renders
    if (duration > this.SLOW_RENDER_THRESHOLD) {
      this.metrics.slowRenders.push({
        component: componentName,
        duration,
        timestamp: Date.now(),
      });

      // Keep only recent slow renders
      if (this.metrics.slowRenders.length > this.MAX_SLOW_RENDERS) {
        this.metrics.slowRenders.shift();
      }

      console.warn(
        `[MemoryMonitor] Slow render: ${componentName} took ${duration.toFixed(2)}ms`,
      );
    }
  }

  /**
   * Track cache hit/miss
   */
  trackCacheHit(hit: boolean): void {
    if (hit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      componentRenders: new Map(this.metrics.componentRenders),
      slowRenders: [...this.metrics.slowRenders],
      memorySnapshots: [...this.metrics.memorySnapshots],
    };
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    current: MemoryInfo | null;
    average: { usedMB: number; totalMB: number } | null;
    trend: "stable" | "growing" | "declining" | "unknown";
  } {
    if (this.metrics.memorySnapshots.length === 0) {
      return { current: null, average: null, trend: "unknown" };
    }

    const current =
      this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1]!;

    // Calculate average
    const sum = this.metrics.memorySnapshots.reduce(
      (acc, s) => ({
        used: acc.used + s.usedJSHeapSize,
        total: acc.total + s.totalJSHeapSize,
      }),
      { used: 0, total: 0 },
    );

    const average = {
      usedMB: sum.used / this.metrics.memorySnapshots.length / 1024 / 1024,
      totalMB: sum.total / this.metrics.memorySnapshots.length / 1024 / 1024,
    };

    // Determine trend (compare first and last snapshots)
    let trend: "stable" | "growing" | "declining" | "unknown" = "stable";
    if (this.metrics.memorySnapshots.length >= 5) {
      const first = this.metrics.memorySnapshots[0]!;
      const last =
        this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1]!;
      const growth =
        ((last.usedJSHeapSize - first.usedJSHeapSize) / first.usedJSHeapSize) *
        100;

      if (growth > 10) trend = "growing";
      else if (growth < -10) trend = "declining";
      else trend = "stable";
    }

    return { current, average, trend };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    hits: number;
    misses: number;
    total: number;
    hitRate: number;
  } {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRate = total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;

    return {
      hits: this.metrics.cacheHits,
      misses: this.metrics.cacheMisses,
      total,
      hitRate,
    };
  }

  /**
   * Get top slow components
   */
  getTopSlowComponents(limit: number = 10): Array<{
    component: string;
    avgDuration: number;
    count: number;
  }> {
    const componentDurations = new Map<
      string,
      { total: number; count: number }
    >();

    for (const render of this.metrics.slowRenders) {
      const existing = componentDurations.get(render.component);
      if (existing) {
        existing.total += render.duration;
        existing.count++;
      } else {
        componentDurations.set(render.component, {
          total: render.duration,
          count: 1,
        });
      }
    }

    return Array.from(componentDurations.entries())
      .map(([component, { total, count }]) => ({
        component,
        avgDuration: total / count,
        count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics.componentRenders.clear();
    this.metrics.slowRenders.length = 0;
    this.metrics.memorySnapshots.length = 0;
    this.metrics.cacheHits = 0;
    this.metrics.cacheMisses = 0;
    if (import.meta.env.DEV) {
      console.warn("[MemoryMonitor] Metrics reset");
    }
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        timestamp: Date.now(),
        metrics: this.getMetrics(),
        memoryStats: this.getMemoryStats(),
        cacheStats: this.getCacheStats(),
        topSlowComponents: this.getTopSlowComponents(),
      },
      null,
      2,
    );
  }
}

// Export singleton instance
export const memoryMonitor = FrontendMemoryMonitor.getInstance();

// Development mode helper
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>)["__memoryMonitor"] =
    memoryMonitor;
  console.warn("[MemoryMonitor] Available globally as window.__memoryMonitor");
}
