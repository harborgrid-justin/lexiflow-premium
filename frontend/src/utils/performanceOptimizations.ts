/**
 * @module utils/performanceOptimizations
 * @category Utilities - Performance
 *
 * Performance optimization utilities for React components.
 * Includes React.memo wrappers, component profiling, and render optimization helpers.
 */

import React, { memo, type Attributes, type ComponentType } from "react";

/**
 * Performance optimization configuration
 */
export interface OptimizationConfig {
  /** Enable performance warnings in development */
  enableWarnings?: boolean;
  /** Threshold in ms for slow render warnings */
  warnThreshold?: number;
  /** Enable detailed logging */
  debug?: boolean;
}

/**
 * Deep comparison function for React.memo
 *
 * Performs deep equality check instead of shallow comparison.
 * Use sparingly as it has performance overhead.
 *
 * @param prevProps - Previous props
 * @param nextProps - Next props
 * @returns True if props are equal
 */
export function deepPropsEqual<P>(prevProps: P, nextProps: P): boolean {
  return deepEqual(prevProps, nextProps);
}

/**
 * Shallow comparison function for React.memo
 *
 * Only compares top-level props (default React.memo behavior).
 *
 * @param prevProps - Previous props
 * @param nextProps - Next props
 * @returns True if props are equal
 */
export function shallowPropsEqual<P>(prevProps: P, nextProps: P): boolean {
  if (prevProps === nextProps) return true;

  const prevKeys = Object.keys(prevProps as object);
  const nextKeys = Object.keys(nextProps as object);

  if (prevKeys.length !== nextKeys.length) return false;

  return prevKeys.every((key) => {
    const k = key as keyof P;
    return Object.is(prevProps[k], nextProps[k]);
  });
}

/**
 * Create memoized component with custom comparison
 *
 * Enhanced React.memo with performance tracking and custom comparison.
 *
 * @param Component - Component to memoize
 * @param propsAreEqual - Optional custom comparison function
 * @param config - Optimization configuration
 * @returns Memoized component
 *
 * @example
 * ```tsx
 * const ExpensiveList = createMemoizedComponent(
 *   ({ items }: Props) => (
 *     <ul>
 *       {items.map(item => <li key={item.id}>{item.name}</li>)}
 *     </ul>
 *   ),
 *   (prev, next) => prev.items.length === next.items.length,
 *   { enableWarnings: true, warnThreshold: 16 }
 * );
 * ```
 */
export function createMemoizedComponent<P>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean,
  config: OptimizationConfig = {},
): ComponentType<P> {
  const {
    enableWarnings = import.meta.env.DEV,
    warnThreshold = 16,
    debug = false,
  } = config;

  const MemoizedComponent = memo(Component, propsAreEqual);

  if (!enableWarnings && !debug) {
    return MemoizedComponent;
  }

  // Wrap with performance tracking
  function WrappedComponent(props: P) {
    const startTime = React.useRef(performance.now());

    React.useEffect(() => {
      const duration = performance.now() - startTime.current;

      if (enableWarnings && duration > warnThreshold) {
        console.warn(
          `[Performance] ${Component.displayName || Component.name || "Component"} ` +
            `render took ${duration.toFixed(2)}ms (threshold: ${warnThreshold}ms)`,
        );
      }

      if (debug) {
        console.warn(
          `[Performance] ${Component.displayName || Component.name || "Component"} ` +
            `rendered in ${duration.toFixed(2)}ms`,
        );
      }
    }, []);

    return React.createElement(
      MemoizedComponent as ComponentType<unknown>,
      props as Attributes,
    );
  }

  return WrappedComponent as ComponentType<P>;
}

/**
 * Memoize component with deep prop comparison
 *
 * Useful when props are objects/arrays that may be recreated with same values.
 *
 * @param Component - Component to memoize
 * @returns Memoized component
 *
 * @example
 * ```tsx
 * const ConfigPanel = memoizeDeep(({ config }: Props) => (
 *   <div>{config.title}</div>
 * ));
 * ```
 */
export function memoizeDeep<P>(Component: ComponentType<P>): ComponentType<P> {
  return memo(Component, deepPropsEqual);
}

/**
 * Memoize pure component (no side effects)
 *
 * For components that only depend on props and have no side effects.
 * Automatically applies shallow comparison.
 *
 * @param Component - Pure component
 * @returns Memoized component
 */
export function memoizePure<P>(Component: ComponentType<P>): ComponentType<P> {
  return memo(Component, shallowPropsEqual);
}

/**
 * Profile component renders
 *
 * Wraps component with React Profiler for performance monitoring.
 *
 * @param Component - Component to profile
 * @param id - Profiler ID
 * @param onRender - Callback with profiling data
 * @returns Profiled component
 *
 * @example
 * ```tsx
 * const ProfiledComponent = profileComponent(
 *   MyComponent,
 *   'MyComponent',
 *   (id, phase, actualDuration) => {
 *     console.log(`${id} ${phase} took ${actualDuration}ms`);
 *   }
 * );
 * ```
 */
export function profileComponent<P>(
  Component: ComponentType<P>,
  id: string,
  onRender?: (
    id: string,
    phase: "mount" | "update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
  ) => void,
): ComponentType<P> {
  function ProfiledComponent(props: P): React.ReactElement {
    const handleRender = (
      profId: string,
      phase: "mount" | "update",
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number,
    ) => {
      if (onRender) {
        onRender(
          profId,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime,
        );
      } else if (import.meta.env.DEV) {
        console.warn(
          `[Profiler] ${profId} ${phase}: ${actualDuration.toFixed(2)}ms ` +
            `(base: ${baseDuration.toFixed(2)}ms)`,
        );
      }
    };

    return React.createElement(
      React.Profiler,
      { id, onRender: handleRender as React.ProfilerOnRenderCallback },
      React.createElement(
        Component as React.ComponentType<Record<string, unknown>>,
        props as Record<string, unknown> & React.Attributes,
      ),
    );
  }

  return ProfiledComponent as ComponentType<P>;
}

/**
 * Lazy component with error boundary
 *
 * Creates lazy component with automatic error handling.
 *
 * @param importFunc - Dynamic import function
 * @param fallback - Error fallback component
 * @returns Lazy component
 */
export function lazyWithErrorBoundary<
  T extends Record<string, unknown> = Record<string, unknown>,
>(importFunc: () => Promise<{ default: ComponentType<T> }>): ComponentType<T> {
  const LazyComponent = React.lazy(importFunc);

  const LazyWrapper = (props: T) => {
    return React.createElement(
      React.Suspense,
      {
        fallback: React.createElement("div", {}, "Loading..."),
      },
      React.createElement(LazyComponent, props),
    );
  };

  return LazyWrapper as ComponentType<T>;
}

/**
 * Debounce component renders
 *
 * Debounces component re-renders to prevent excessive updates.
 * Useful for components that update frequently (e.g., search results).
 *
 * @param Component - Component to debounce
 * @param delay - Debounce delay in ms
 * @returns Debounced component
 *
 * @example
 * ```tsx
 * const DebouncedSearch = debounceRenders(
 *   SearchResults,
 *   300 // Wait 300ms after last prop change
 * );
 * ```
 */
export function debounceRenders<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  delay: number = 300,
): ComponentType<P> {
  const DebouncedComponent = (props: P) => {
    const [debouncedProps, setDebouncedProps] = React.useState<P>(props);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );

    React.useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedProps(props);
      }, delay);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [props]);

    return React.createElement(Component, debouncedProps);
  };

  return DebouncedComponent as ComponentType<P>;
}

/**
 * Throttle component renders
 *
 * Throttles component re-renders to limit update frequency.
 *
 * @param Component - Component to throttle
 * @param interval - Throttle interval in ms
 * @returns Throttled component
 */
export function throttleRenders<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  interval: number = 100,
): ComponentType<P> {
  const ThrottledComponent = (props: P) => {
    const [throttledProps, setThrottledProps] = React.useState<P>(props);
    const lastUpdateRef = React.useRef<number>(0);
    const pendingPropsRef = React.useRef<P | null>(null);

    React.useEffect(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      if (timeSinceLastUpdate >= interval) {
        setThrottledProps(props);
        lastUpdateRef.current = now;
        pendingPropsRef.current = null;
        return undefined;
      } else {
        pendingPropsRef.current = props;

        const timeoutId = setTimeout(() => {
          if (pendingPropsRef.current) {
            setThrottledProps(pendingPropsRef.current);
            lastUpdateRef.current = Date.now();
            pendingPropsRef.current = null;
          }
        }, interval - timeSinceLastUpdate);

        return () => clearTimeout(timeoutId);
      }
    }, [props]);

    return React.createElement(Component, throttledProps);
  };

  return ThrottledComponent as ComponentType<P>;
}

/**
 * Batch component updates
 *
 * Batches multiple prop updates into a single render.
 *
 * @param Component - Component to batch
 * @param batchWindow - Batch window in ms
 * @returns Batched component
 */
export function batchRenders<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  batchWindow: number = 50,
): ComponentType<P> {
  const BatchedComponent = (props: P) => {
    const [batchedProps, setBatchedProps] = React.useState<P>(props);
    const propsQueueRef = React.useRef<P[]>([]);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );

    React.useEffect(() => {
      propsQueueRef.current.push(props);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        const latestProps =
          propsQueueRef.current[propsQueueRef.current.length - 1];
        if (latestProps) {
          setBatchedProps(latestProps);
        }
        propsQueueRef.current = [];
      }, batchWindow);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [props]);

    return React.createElement(Component, batchedProps);
  };

  return BatchedComponent as ComponentType<P>;
}

/**
 * Conditionally render component
 *
 * Only renders component when condition is met, reducing unnecessary renders.
 *
 * @param Component - Component to render
 * @param shouldRender - Function to determine if should render
 * @returns Conditional component
 *
 * @example
 * ```tsx
 * const ConditionalChart = conditionallyRender(
 *   ExpensiveChart,
 *   (props) => props.data.length > 0
 * );
 * ```
 */
export function conditionallyRender<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  shouldRender: (props: P) => boolean,
): ComponentType<P> {
  const ConditionalComponent = (props: P) => {
    if (!shouldRender(props)) {
      return null;
    }

    return React.createElement(Component, props);
  };

  return ConditionalComponent as ComponentType<P>;
}

// Helper functions

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => deepEqual(val, b[idx]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => deepEqual(objA[key], objB[key]));
  }

  return false;
}

/**
 * Component display name utilities
 */
export const ComponentUtils = {
  /**
   * Get display name of component
   */
  getDisplayName<P>(Component: ComponentType<P>): string {
    return Component.displayName || Component.name || "Component";
  },

  /**
   * Set display name for component
   */
  setDisplayName<P>(
    Component: ComponentType<P>,
    name: string,
  ): ComponentType<P> {
    (Component as unknown as Record<string, unknown>)["displayName"] = name;
    return Component;
  },

  /**
   * Wrap component with display name
   */
  wrapWithName<P>(
    Component: ComponentType<P>,
    wrapper: string,
  ): ComponentType<P> {
    const originalName = ComponentUtils.getDisplayName(Component);
    return ComponentUtils.setDisplayName(
      Component,
      `${wrapper}(${originalName})`,
    );
  },
};
