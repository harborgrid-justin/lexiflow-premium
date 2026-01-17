/**
 * Case Conversion Utilities
 *
 * Converts between snake_case (backend) and camelCase (frontend)
 */

/**
 * Convert a snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_: string, letter: string) =>
    letter.toUpperCase(),
  );
}

/**
 * Convert a camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively convert all keys in an object from snake_case to camelCase
 */
export function keysToCamel<T = unknown>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamel(item)) as T;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = snakeToCamel(key);
        converted[camelKey] = keysToCamel(
          (obj as Record<string, unknown>)[key],
        );
      }
    }
    return converted as T;
  }

  return obj as T;
}

/**
 * Recursively convert all keys in an object from camelCase to snake_case
 */
export function keysToSnake<T = unknown>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnake(item)) as T;
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = camelToSnake(key);
        converted[snakeKey] = keysToSnake(
          (obj as Record<string, unknown>)[key],
        );
      }
    }
    return converted as T;
  }

  return obj as T;
}
