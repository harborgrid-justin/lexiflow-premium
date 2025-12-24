/**
 * @module QueryUtils
 * @description Enterprise-grade query utilities for caching and state management
 * 
 * Provides production-ready utilities for:
 * - Deep object comparison with structural equality
 * - Stable JSON serialization with circular reference detection
 * - Deterministic query key hashing for cache lookups
 * - Type-safe object traversal
 * 
 * @architecture
 * - Pattern: Pure functional utilities (no side effects)
 * - Algorithm: Depth-first traversal with WeakSet-based cycle detection
 * - Complexity: O(n) where n = number of object properties
 * - Memory: O(d) where d = maximum depth (via WeakSet)
 * 
 * @performance
 * - Fast path for primitives: O(1)
 * - Object comparison: O(n) amortized via serialization
 * - Circular detection: O(1) via WeakSet lookups
 * - Key sorting: O(k log k) where k = number of keys
 * 
 * @security
 * - No eval() or unsafe operations
 * - Function properties automatically filtered (security best practice)
 * - Undefined values excluded from hashing (deterministic output)
 * - WeakSet prevents memory leaks from circular references
 * 
 * @usage
 * ```typescript
 * // Deep equality
 * const equal = fastDeepEqual({ a: 1 }, { a: 1 }); // true
 * 
 * // Stable serialization
 * const str = stableStringify({ b: 2, a: 1 }); // {"a":1,"b":2} (sorted)
 * 
 * // Query key hashing
 * const hash = hashQueryKey(['users', { id: 123 }]); // Deterministic hash
 * ```
 * 
 * @created 2023-06-15
 * @modified 2025-12-22
 */

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate object parameter for serialization
 * @private
 * @throws Error if object is invalid
 */
function validateObject(obj: unknown, methodName: string): void {
  if (obj === undefined) {
    throw new Error(`[queryUtils.${methodName}] Object is required`);
  }
}

/**
 * Validate query key parameter
 * @private
 * @throws Error if key is invalid
 */
function validateQueryKey(key: string | readonly unknown[], methodName: string): void {
  if (!key) {
    throw new Error(`[queryUtils.${methodName}] Query key is required`);
  }
  
  if (typeof key !== 'string' && !Array.isArray(key)) {
    throw new Error(`[queryUtils.${methodName}] Query key must be a string or array`);
  }
}

// =============================================================================
// DEEP EQUALITY
// =============================================================================

/**
 * Fast deep equality check using stable serialization
 * 
 * Compares two objects structurally by comparing their serialized forms.
 * More efficient than recursive traversal for most cases.
 * 
 * @param obj1 - First object to compare
 * @param obj2 - Second object to compare
 * @returns boolean - True if objects are structurally equal
 * 
 * @example
 * fastDeepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }); // true (key order ignored)
 * fastDeepEqual([1, 2, 3], [1, 2, 3]); // true
 * fastDeepEqual({ a: 1 }, { a: 2 }); // false
 * 
 * @algorithm
 * 1. Fast path: Reference equality (===)
 * 2. Type check: Both must be objects
 * 3. Serialize both objects with stable key ordering
 * 4. Compare serialized strings
 * 5. Handle circular references gracefully
 * 
 * @performance
 * - Best case: O(1) for reference equality
 * - Average case: O(n) where n = total properties
 * - Worst case: O(n) with circular reference detection
 * 
 * @security
 * - Safe for untrusted input (no code execution)
 * - Circular references handled gracefully
 * - Functions automatically excluded from comparison
 */
export function fastDeepEqual(obj1: unknown, obj2: unknown): boolean {
  try {
    // Fast path: reference equality
    if (obj1 === obj2) return true;
    
    // Fast path: type mismatch
    if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }
    
    // Compare via stable serialization
    return stableStringify(obj1) === stableStringify(obj2);
  } catch (error) {
    console.warn('[queryUtils.fastDeepEqual] Comparison failed:', error);
    return false;
  }
}

// =============================================================================
// STABLE SERIALIZATION
// =============================================================================

/**
 * Stable JSON serialization with circular reference detection
 * 
 * Serializes objects to deterministic JSON strings with:
 * - Alphabetically sorted object keys (for consistency)
 * - Circular reference detection and marking
 * - Function and undefined value filtering
 * - WeakSet-based cycle tracking (memory efficient)
 * 
 * @param obj - Object to serialize
 * @param seen - WeakSet for tracking visited objects (prevents cycles)
 * @returns Stable JSON string representation
 * @throws Error if serialization fails unexpectedly
 * 
 * @example
 * stableStringify({ b: 2, a: 1 }); // '{"a":1,"b":2}' (sorted)
 * 
 * const circular = { a: 1 };
 * circular.self = circular;
 * stableStringify(circular); // '{"a":1,"self":"[Circular]"}'
 * 
 * @algorithm
 * 1. Primitives → JSON.stringify (fast path)
 * 2. Detect circular reference via WeakSet
 * 3. Arrays → recursive serialization
 * 4. Objects → sort keys + recursive serialization
 * 5. Clean up WeakSet after traversal
 * 
 * @performance
 * - Primitives: O(1) via native JSON.stringify
 * - Arrays: O(n) where n = array length
 * - Objects: O(k log k + n) where k = keys, n = nested properties
 * - WeakSet lookups: O(1) amortized
 * 
 * @security
 * - Functions automatically excluded (prevents code injection)
 * - Undefined values excluded (deterministic output)
 * - Circular references marked (prevents infinite loops)
 * - No eval() or unsafe operations
 */
export function stableStringify(obj: unknown, seen: WeakSet<object> = new WeakSet()): string {
  try {
    // Handle primitives and null (fast path)
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }

    // Detect circular references
    if (seen.has(obj)) {
      return '"[Circular]"';
    }

    // Mark as visited
    seen.add(obj);

    // Handle arrays
    if (Array.isArray(obj)) {
      const arrStr = '[' + obj.map(item => stableStringify(item, seen)).join(',') + ']';
      seen.delete(obj);
      return arrStr;
    }

    // Handle objects with sorted keys for stability
    const keys = Object.keys(obj).sort();
    const parts: string[] = [];

    for (const key of keys) {
      const val = (obj as Record<string, unknown>)[key];
      
      // Skip functions and undefined values
      if (typeof val === 'function' || val === undefined) {
        continue;
      }
      
      const serializedKey = JSON.stringify(key);
      const serializedValue = stableStringify(val, seen);
      parts.push(`${serializedKey}:${serializedValue}`);
    }
    
    const objStr = '{' + parts.join(',') + '}';
    seen.delete(obj);
    return objStr;
  } catch (error) {
    console.error('[queryUtils.stableStringify] Serialization failed:', error);
    throw error;
  }
}

// =============================================================================
// QUERY KEY HASHING
// =============================================================================

/**
 * Hash a query key into a stable string for cache lookups
 * 
 * Converts query keys (strings or complex objects) into deterministic
 * string representations suitable for use as cache keys.
 * 
 * @param key - Query key (string or array/object)
 * @returns Hashed string representation
 * 
 * @example
 * // Simple string key
 * hashQueryKey('users'); // 'users'
 * 
 * // Array key with parameters
 * hashQueryKey(['users', { role: 'admin' }]); // '["users",{"role":"admin"}]'
 * 
 * // Complex nested key
 * hashQueryKey(['cases', { filter: { status: 'open' } }]);
 * // '["cases",{"filter":{"status":"open"}}]'
 * 
 * @usage
 * Used by QueryClient for:
 * - Cache key generation
 * - Query invalidation pattern matching
 * - Subscription key mapping
 * 
 * @performance
 * O(n) where n = complexity of key structure
 * 
 * @security
 * - Deterministic output (no randomness)
 * - Safe for cache keys (no injection risk)
 * - Handles malformed keys gracefully
 */
export function hashQueryKey(key: string | readonly unknown[]): string {
  try {
    validateQueryKey(key, 'hashQueryKey');
    
    // String keys pass through unchanged
    if (typeof key === 'string') {
      return key;
    }
    
    // Serialize complex keys
    return stableStringify(key);
  } catch (error) {
    console.error('[queryUtils.hashQueryKey] Failed to hash query key:', error);
    
    // Fallback: convert to string (non-deterministic but safe)
    return String(key);
  }
}
