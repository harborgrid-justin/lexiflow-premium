/**
 * GUIDELINE #22-23: Immutability Enforcement Utilities
 * 
 * Development-mode utilities to catch accidental mutations in concurrent rendering.
 * These utilities recursively freeze objects in development to surface bugs early.
 * 
 * @see https://react.dev/reference/react/useTransition#preventing-unwanted-loading-indicators
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Recursively freeze an object in development mode.
 * No-op in production for performance.
 * 
 * GUIDELINE #22: Context values must be immutable during concurrent rendering.
 * Freezing prevents accidental mutations that could cause tearing.
 * 
 * @param obj - Object to freeze
 * @returns The same object (frozen in dev, unchanged in prod)
 */
export function deepFreeze<T>(obj: T): T {
  if (!isDevelopment) return obj;
  if (obj === null || typeof obj !== 'object') return obj;
  
  // Already frozen
  if (Object.isFrozen(obj)) return obj;
  
  // Freeze the object itself
  Object.freeze(obj);
  
  // Recursively freeze all properties
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as Record<string, unknown>)[prop];
    if (value !== null && typeof value === 'object') {
      deepFreeze(value);
    }
  });
  
  return obj;
}

/**
 * Wrap a context value to enforce immutability in development.
 * Use this in provider memoization to catch mutations early.
 * 
 * Example:
 * ```tsx
 * const stateValue = useMemo(
 *   () => freezeInDev({ items, isLoading }),
 *   [items, isLoading]
 * );
 * ```
 */
export function freezeInDev<T>(value: T): T {
  return deepFreeze(value);
}

/**
 * Assert that an object is not mutated during render.
 * Creates a frozen copy in dev and compares after render.
 * 
 * GUIDELINE #23: Never mutate context values between renders.
 * This utility helps detect violations during development.
 */
export function assertImmutable<T extends object>(
  obj: T,
  label: string = 'object'
): T {
  if (!isDevelopment) return obj;
  
  // Create a frozen snapshot
  const snapshot = JSON.parse(JSON.stringify(obj));
  deepFreeze(snapshot);
  
  // Schedule check after render
  queueMicrotask(() => {
    const current = JSON.stringify(obj);
    const original = JSON.stringify(snapshot);
    
    if (current !== original) {
      console.error(
        `[Immutability Violation] ${label} was mutated between renders:`,
        { original: snapshot, current: obj }
      );
    }
  });
  
  return obj;
}
