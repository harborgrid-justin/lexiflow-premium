/**
 * Data Normalization Core Utilities
 * Transform backend shapes to UI-ready formats
 */

/**
 * Base normalizer interface
 */
export interface Normalizer<TBackend, TFrontend> {
  (data: TBackend): TFrontend;
}

/**
 * Normalize ISO date string to Date object
 */
export function normalizeDate(dateString: unknown): Date | undefined {
  if (!dateString) return undefined;
  if (dateString instanceof Date) return dateString;
  if (typeof dateString === "string") {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

/**
 * Normalize currency amount (cents to dollars)
 */
export function normalizeCurrency(cents: unknown): number {
  if (typeof cents === "number") {
    return cents / 100;
  }
  return 0;
}

/**
 * Normalize enum value to frontend format
 */
export function normalizeEnum<T extends string>(
  value: unknown,
  mapping: Record<string, T>,
  defaultValue: T
): T {
  if (typeof value !== "string") return defaultValue;
  return mapping[value] || defaultValue;
}

/**
 * Normalize array, filtering out null/undefined
 */
export function normalizeArray<T>(
  items: unknown,
  normalizer: (item: unknown) => T
): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item != null).map(normalizer);
}

/**
 * Normalize boolean value
 */
export function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return false;
}

/**
 * Extract first non-null value
 */
export function coalesce<T>(
  ...values: (T | null | undefined)[]
): T | undefined {
  return values.find((v) => v != null);
}

/**
 * Safe string extraction
 */
export function normalizeString(value: unknown, defaultValue = ""): string {
  if (typeof value === "string") return value;
  if (value == null) return defaultValue;
  return String(value);
}

/**
 * Safe number extraction
 */
export function normalizeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Normalize ID (ensure string format)
 */
export function normalizeId(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value == null) return "";
  return String(value);
}

/**
 * Create snake_case to camelCase mapper
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Create camelCase to snake_case mapper
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Transform object keys from snake_case to camelCase
 */
export function transformKeys<T = unknown>(
  obj: unknown,
  transformer: (key: string) => string = snakeToCamel
): T {
  if (obj == null || typeof obj !== "object") {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, transformer)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = transformer(key);
    result[newKey] = transformKeys(value, transformer);
  }

  return result as T;
}

/**
 * Create paginated response normalizer
 */
export function normalizePaginatedResponse<TBackend, TFrontend>(
  response: unknown,
  itemNormalizer: Normalizer<TBackend, TFrontend>
): {
  data: TFrontend[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
} {
  const obj = response as Record<string, unknown>;

  const items = Array.isArray(obj.items)
    ? obj.items
    : Array.isArray(obj.data)
      ? obj.data
      : [];
  const total = normalizeNumber(obj.total || obj.count, 0);
  const page = normalizeNumber(obj.page, 1);
  const pageSize = normalizeNumber(obj.pageSize || obj.limit, 10);

  return {
    data: normalizeArray(items, (item) => itemNormalizer(item as TBackend)),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}

/**
 * Merge partial updates with existing data
 */
export function mergePartial<T extends Record<string, unknown>>(
  existing: T,
  partial: Partial<T>
): T {
  return {
    ...existing,
    ...Object.fromEntries(
      Object.entries(partial).filter(([_, v]) => v !== undefined)
    ),
  } as T;
}

/**
 * Remove undefined fields from object
 */
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}
