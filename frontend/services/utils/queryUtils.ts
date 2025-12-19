/**
 * Query Utilities - Deep equality and serialization for query caching
 * 
 * Purpose: Pure utility functions for comparing and hashing query keys
 * Extracted from: queryClient.ts
 * 
 * Responsibilities:
 * - Deep object comparison
 * - Stable JSON serialization with circular reference handling
 * - Query key hashing
 */

/**
 * Fast deep equality check using stable serialization
 */
export function fastDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  try {
    return stableStringify(obj1) === stableStringify(obj2);
  } catch (e) {
    console.warn("Deep equal failed due to circular structure, falling back to false");
    return false;
  }
}

/**
 * Stable JSON serialization with circular reference detection
 * 
 * @param obj - Object to serialize
 * @param seen - WeakSet to track circular references
 * @returns Stable JSON string representation
 */
export function stableStringify(obj: any, seen: WeakSet<object> = new WeakSet()): string {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  // Detect circular references
  if (seen.has(obj)) {
    return '"[Circular]"';
  }

  seen.add(obj);

  // Handle arrays
  if (Array.isArray(obj)) {
    const arrStr = '[' + obj.map(n => stableStringify(n, seen)).join(',') + ']';
    seen.delete(obj);
    return arrStr;
  }

  // Handle objects with sorted keys for stability
  const keys = Object.keys(obj).sort();
  const objStr = '{' + keys.map(key => {
    const val = obj[key];
    // Skip functions and undefined values
    if (typeof val === 'function' || val === undefined) return '';
    return JSON.stringify(key) + ':' + stableStringify(val, seen);
  }).filter(Boolean).join(',') + '}';
  
  seen.delete(obj);
  return objStr;
}

/**
 * Hash a query key into a stable string
 * 
 * @param key - Query key (string or array/object)
 * @returns Hashed string representation
 */
export function hashQueryKey(key: string | readonly unknown[]): string {
  try {
    return stableStringify(key);
  } catch (e) {
    console.error('[queryUtils] Failed to hash query key:', e);
    return String(key);
  }
}
