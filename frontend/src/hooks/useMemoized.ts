/**
 * @module hooks/useMemoized
 * @category Hooks - Performance
 *
 * Advanced memoization hooks for React performance optimization.
 * Provides enhanced versions of useMemo and useCallback with performance tracking.
 *
 * @example
 * ```tsx
 * function ExpensiveComponent({ data }: Props) {
 *   // Memoize expensive computation
 *   const processed = useMemoizedValue(
 *     () => heavyProcessing(data),
 *     [data],
 *     { name: 'dataProcessing', warnThreshold: 10 }
 *   );
 *
 *   // Memoize callback with stable reference
 *   const handleClick = useMemoizedCallback(
 *     (id: string) => {
 *       console.log('Clicked:', id);
 *     },
 *     [],
 *     { name: 'handleClick' }
 *   );
 *
 *   return <div onClick={() => handleClick(data.id)}>{processed}</div>;
 * }
 * ```
 */

import { useCallback, useMemo, useRef, DependencyList } from 'react';

/**
 * Configuration options for memoization
 */
export interface MemoizationConfig {
  /**
   * Name for performance tracking and debugging
   */
  name?: string;

  /**
   * Enable performance warnings (default: dev mode only)
   */
  enableWarnings?: boolean;

  /**
   * Threshold in milliseconds to warn about slow computations
   * @default 10
   */
  warnThreshold?: number;

  /**
   * Enable detailed logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Enhanced useMemo with performance tracking
 *
 * Automatically tracks computation time and warns about expensive operations.
 * Helps identify performance bottlenecks in component renders.
 *
 * @param factory - Factory function to compute the memoized value
 * @param deps - Dependency array
 * @param config - Optional configuration for performance tracking
 * @returns Memoized value
 *
 * @example
 * ```tsx
 * const expensiveResult = useMemoizedValue(
 *   () => {
 *     return data.map(item => complexTransform(item));
 *   },
 *   [data],
 *   { name: 'dataTransform', warnThreshold: 5 }
 * );
 * ```
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: DependencyList,
  config: MemoizationConfig = {},
): T {
  const {
    name = 'anonymous',
    enableWarnings = import.meta.env.DEV,
    warnThreshold = 10,
    debug = false,
  } = config;

  const computationCountRef = useRef(0);

  return useMemo(() => {
    const startTime = performance.now();
    computationCountRef.current++;

    const value = factory();

    const duration = performance.now() - startTime;

    if (enableWarnings && duration > warnThreshold) {
      console.warn(
        `[useMemoizedValue] "${name}" computation #${computationCountRef.current} took ${duration.toFixed(2)}ms ` +
        `(threshold: ${warnThreshold}ms). Consider optimizing or code splitting.`
      );
    }

    if (debug) {
      console.log(
        `[useMemoizedValue] "${name}" computed in ${duration.toFixed(2)}ms ` +
        `(#${computationCountRef.current})`
      );
    }

    return value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Enhanced useCallback with performance tracking and stable references
 *
 * Provides better debugging and performance insights for callback memoization.
 * Automatically tracks how many times callback is recreated.
 *
 * @param callback - Callback function to memoize
 * @param deps - Dependency array
 * @param config - Optional configuration for performance tracking
 * @returns Memoized callback
 *
 * @example
 * ```tsx
 * const handleSubmit = useMemoizedCallback(
 *   async (formData: FormData) => {
 *     await api.submit(formData);
 *   },
 *   [api],
 *   { name: 'handleSubmit', debug: true }
 * );
 * ```
 */
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: DependencyList,
  config: MemoizationConfig = {},
): T {
  const {
    name = 'anonymous',
    debug = false,
  } = config;

  const creationCountRef = useRef(0);
  const lastCreatedRef = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    const now = performance.now();
    const timeSinceLastCreation = now - lastCreatedRef.current;

    if (creationCountRef.current === 0) {
      creationCountRef.current++;
      lastCreatedRef.current = now;
    } else if (timeSinceLastCreation > 0) {
      creationCountRef.current++;
      lastCreatedRef.current = now;

      if (debug) {
        console.log(
          `[useMemoizedCallback] "${name}" recreated (#${creationCountRef.current}) ` +
          `after ${timeSinceLastCreation.toFixed(0)}ms`
        );
      }
    }

    return callback(...args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps) as T;
}

/**
 * Deep comparison memoization hook
 *
 * Uses deep equality comparison instead of shallow reference equality.
 * Useful when dependencies are objects/arrays that may be recreated.
 *
 * @param factory - Factory function to compute value
 * @param deps - Dependency array (will be deep compared)
 * @returns Memoized value
 *
 * @example
 * ```tsx
 * const result = useDeepMemo(
 *   () => processConfig(config),
 *   [config] // Config object may be recreated but with same values
 * );
 * ```
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: DependencyList,
): T {
  const depsRef = useRef<DependencyList>(deps);
  const valueRef = useRef<T>();

  // Deep equality check
  const depsChanged = !deepEqual(depsRef.current, deps);

  if (depsChanged || valueRef.current === undefined) {
    depsRef.current = deps;
    valueRef.current = factory();
  }

  return valueRef.current as T;
}

/**
 * Memoize callback with deep dependency comparison
 *
 * @param callback - Callback function
 * @param deps - Dependencies (deep compared)
 * @returns Memoized callback
 */
export function useDeepCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: DependencyList,
): T {
  const depsRef = useRef<DependencyList>(deps);
  const callbackRef = useRef<T>(callback);

  const depsChanged = !deepEqual(depsRef.current, deps);

  if (depsChanged) {
    depsRef.current = deps;
    callbackRef.current = callback;
  }

  return useCallback(
    (...args: Parameters<T>) => callbackRef.current(...args),
    []
  ) as T;
}

/**
 * Memoize first render value
 *
 * Returns the value from the first render and never updates.
 * Useful for values that should remain constant throughout component lifecycle.
 *
 * @param value - Value to memoize
 * @returns First render value
 *
 * @example
 * ```tsx
 * const initialId = useConstant(() => generateUniqueId());
 * ```
 */
export function useConstant<T>(factory: () => T): T {
  const ref = useRef<T>();

  if (ref.current === undefined) {
    ref.current = factory();
  }

  return ref.current;
}

/**
 * Memoize with size limit (LRU cache)
 *
 * Automatically evicts least recently used values when size limit is reached.
 * Useful for memoizing expensive computations with varying inputs.
 *
 * @param factory - Factory function that takes input and returns computed value
 * @param maxSize - Maximum number of cached values
 * @returns Memoized function
 *
 * @example
 * ```tsx
 * const Component = () => {
 *   const expensiveTransform = useMemoCache(
 *     (input: string) => heavyComputation(input),
 *     100 // Cache up to 100 results
 *   );
 *
 *   return items.map(item => expensiveTransform(item.value));
 * };
 * ```
 */
export function useMemoCache<TInput, TOutput>(
  factory: (input: TInput) => TOutput,
  maxSize: number = 100,
): (input: TInput) => TOutput {
  const cacheRef = useRef<Map<TInput, TOutput>>(new Map());

  return useCallback((input: TInput) => {
    const cache = cacheRef.current;

    // Check cache
    if (cache.has(input)) {
      const value = cache.get(input)!;
      // Move to end (LRU)
      cache.delete(input);
      cache.set(input, value);
      return value;
    }

    // Compute new value
    const value = factory(input);

    // Add to cache
    cache.set(input, value);

    // Evict oldest if over size
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return value;
  }, [factory, maxSize]);
}

/**
 * Performance statistics for memoization
 */
export interface MemoStats {
  computations: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageComputationTime: number;
}

/**
 * Memoization hook with statistics tracking
 *
 * Tracks cache hit/miss rates and computation times for performance analysis.
 *
 * @param factory - Factory function
 * @param deps - Dependencies
 * @param config - Configuration
 * @returns Tuple of [value, stats]
 */
export function useMemoWithStats<T>(
  factory: () => T,
  deps: DependencyList,
  config: MemoizationConfig = {},
): [T, MemoStats] {
  const statsRef = useRef<{
    computations: number;
    cacheHits: number;
    cacheMisses: number;
    totalTime: number;
  }>({
    computations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalTime: 0,
  });

  const prevDepsRef = useRef<DependencyList>(deps);
  const valueRef = useRef<T>();

  const depsChanged = !shallowEqual(prevDepsRef.current, deps);

  if (depsChanged || valueRef.current === undefined) {
    // Cache miss
    statsRef.current.cacheMisses++;
    statsRef.current.computations++;

    const startTime = performance.now();
    valueRef.current = factory();
    const duration = performance.now() - startTime;

    statsRef.current.totalTime += duration;
    prevDepsRef.current = deps;
  } else {
    // Cache hit
    statsRef.current.cacheHits++;
  }

  const stats = statsRef.current;
  const totalAccesses = stats.cacheHits + stats.cacheMisses;

  return [
    valueRef.current as T,
    {
      computations: stats.computations,
      cacheHits: stats.cacheHits,
      cacheMisses: stats.cacheMisses,
      hitRate: totalAccesses > 0 ? (stats.cacheHits / totalAccesses) * 100 : 0,
      averageComputationTime: stats.computations > 0 ? stats.totalTime / stats.computations : 0,
    },
  ];
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

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
}

function shallowEqual(deps1: DependencyList, deps2: DependencyList): boolean {
  if (deps1.length !== deps2.length) return false;
  return deps1.every((dep, i) => Object.is(dep, deps2[i]));
}
