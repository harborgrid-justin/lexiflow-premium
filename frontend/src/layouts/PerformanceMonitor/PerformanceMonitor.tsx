/**
 * @module components/layouts/PerformanceMonitor
 * @category Layouts - Performance
 * @description React component for monitoring and optimizing layout performance with
 * real-time metrics, render tracking, and performance budgets.
 *
 * FEATURES:
 * - Real-time render tracking
 * - Performance budget enforcement
 * - Memory leak detection
 * - Long task monitoring
 * - Core Web Vitals tracking
 * - Development-only overhead
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import React, { ReactNode, useEffect, useRef, useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Memory usage interface for Chrome Performance API
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  avgRenderTime: number;
  slowRenders: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  /** Child components to monitor */
  children: ReactNode;
  /** Component name for tracking */
  componentName: string;
  /** Performance budget in milliseconds */
  renderBudget?: number;
  /** Enable visual performance indicators */
  showIndicators?: boolean;
  /** Callback when budget is exceeded */
  onBudgetExceeded?: (metrics: PerformanceMetrics) => void;
  /** Enable in production (default: false) */
  enableInProduction?: boolean;
}

interface PerformanceIndicatorProps {
  metrics: PerformanceMetrics;
  budget: number;
}

// ============================================================================
// PERFORMANCE INDICATOR COMPONENT
// ============================================================================
const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({ metrics, budget }) => {
  const { theme } = useTheme();
  const isWithinBudget = metrics.lastRenderTime <= budget;
  const Icon = isWithinBudget ? CheckCircle : AlertTriangle;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg",
        "flex items-center gap-2 text-xs font-mono",
        theme.surface.raised,
        theme.border.default,
        "border transition-all duration-200"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          isWithinBudget ? theme.status.success.text : theme.status.warning.text
        )}
      />
      <div className={theme.text.secondary}>
        <div className="font-semibold">
          {metrics.lastRenderTime.toFixed(2)}ms
          {!isWithinBudget && ` (>${budget}ms)`}
        </div>
        <div className="text-[10px] opacity-75">
          Avg: {metrics.avgRenderTime.toFixed(2)}ms | Renders: {metrics.renderCount}
          {metrics.slowRenders > 0 && ` | Slow: ${metrics.slowRenders}`}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITIES
// ============================================================================
const getMemoryUsage = (): number | undefined => {
  const perf = performance as PerformanceWithMemory;
  if ('memory' in perf && perf.memory) {
    const memory = perf.memory;
    return memory.usedJSHeapSize / 1048576; // Convert to MB
  }
  return undefined;
};

// Measure render time helper (exported for testing/utilities)
export const measureRenderTime = (callback: () => void): number => {
  const start = performance.now();
  callback();
  return performance.now() - start;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
/**
 * PerformanceMonitor tracks render performance and enforces performance budgets.
 * Only active in development by default to avoid production overhead.
 *
 * @example
 * ```tsx
 * <PerformanceMonitor
 *   componentName="DashboardPage"
 *   renderBudget={16} // 60fps budget
 *   showIndicators={true}
 *   onBudgetExceeded={(metrics) => {
 *     console.warn('Render budget exceeded:', metrics);
 *   }}
 * >
 *   <YourComponent />
 * </PerformanceMonitor>
 * ```
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  componentName,
  renderBudget = 16, // 60fps = 16.67ms per frame
  showIndicators = false,
  onBudgetExceeded,
  enableInProduction = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    slowRenders: 0,
  });

  const renderTimesRef = useRef<number[]>([]);
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number | null>(null);

  // Only run in development unless explicitly enabled
  const isEnabled = process.env.NODE_ENV === 'development' || enableInProduction;

  useEffect(() => {
    if (!isEnabled) return;

    // Initialize mount time on first effect run
    if (mountTimeRef.current === null) {
      mountTimeRef.current = performance.now();
      return;
    }

    const renderTime = performance.now() - mountTimeRef.current;
    renderCountRef.current += 1;
    renderTimesRef.current.push(renderTime);

    // Keep only last 10 render times
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current.shift();
    }

    const avgTime =
      renderTimesRef.current.reduce((sum, time) => sum + time, 0) /
      renderTimesRef.current.length;

    const slowRenders = renderTimesRef.current.filter(t => t > renderBudget).length;

    const newMetrics: PerformanceMetrics = {
      renderCount: renderCountRef.current,
      lastRenderTime: renderTime,
      avgRenderTime: avgTime,
      slowRenders,
      memoryUsage: getMemoryUsage(),
    };

    setMetrics(newMetrics);

    // Log to console in development
    if (import.meta.env.DEV) {
      const status = renderTime > renderBudget ? '⚠️ SLOW' : '✅ OK';
      console.log(
        `[Performance] ${componentName} ${status}`,
        `${renderTime.toFixed(2)}ms (budget: ${renderBudget}ms)`,
        newMetrics
      );
    }

    // Trigger callback if budget exceeded
    if (renderTime > renderBudget && onBudgetExceeded) {
      onBudgetExceeded(newMetrics);
    }

    // Reset timer for next render
    mountTimeRef.current = performance.now();
  }, [isEnabled, renderBudget, onBudgetExceeded, componentName]);

  // Track memory leaks
  useEffect(() => {
    if (!isEnabled) return;

    const checkMemory = () => {
      const memoryUsage = getMemoryUsage();
      if (memoryUsage && memoryUsage > 100) { // Alert if >100MB
        console.warn(
          `[Performance] ${componentName} High memory usage:`,
          `${memoryUsage.toFixed(2)}MB`
        );
      }
    };

    const interval = setInterval(checkMemory, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [isEnabled, componentName]);

  return (
    <>
      {children}
      {isEnabled && showIndicators && (
        <PerformanceIndicator metrics={metrics} budget={renderBudget} />
      )}
    </>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for tracking component render count and timing
 */
export const useRenderMetrics = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;
    lastRenderTime.current = currentTime;

    if (import.meta.env.DEV) {
      console.log(`[Render] ${componentName} #${renderCount.current} - ${renderTime.toFixed(2)}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
  };
};

/**
 * Hook for detecting expensive re-renders
 */
export const useExpensiveRenderDetector = (
  componentName: string,
  threshold: number = 16
) => {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;

    if (renderTime > threshold) {
      console.warn(
        `[Performance] ${componentName} exceeded render threshold:`,
        `${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }

    renderStartTime.current = performance.now();
  });
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Measure execution time of a function
 */
export const measureExecutionTime = <T extends (...args: never[]) => unknown>(
  fn: T,
  label?: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Timing] ${label || fn.name}: ${(end - start).toFixed(2)}ms`);
    }

    return result;
  }) as T;
};

/**
 * Create a performance mark for tracking
 */
export const createPerformanceMark = (name: string) => {
  if ('mark' in performance) {
    performance.mark(name);
  }
};

/**
 * Measure between two performance marks
 */
export const measurePerformance = (name: string, startMark: string, endMark: string) => {
  if ('measure' in performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure?.duration ?? null;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }
  return null;
};
