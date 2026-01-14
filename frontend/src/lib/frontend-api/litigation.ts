/**
 * Litigation Frontend API
 * Enterprise-grade API layer per architectural standard
 *
 * @module lib/frontend-api/litigation
 * @description Domain-level contract for litigation operations
 *
 * Migrated from:
 * - pleadings-api.ts
 * - case-teams-api.ts
 * - parties-api.ts
 * - case-phases-api.ts
 * - motions-api.ts
 * ... and 3 more files
 *
 * ARCHITECTURE POSITION:
 * Backend API → Frontend API → Loaders/Actions → Context → Views
 *
 * KEY PRINCIPLES:
 * 1. Frontend APIs are domain contracts, not transport wrappers
 * 2. All APIs return Result<T>, never throw exceptions
 * 3. Domain errors, not HTTP codes
 * 4. Pure functions, no React/UI dependencies
 * 5. Validation at API boundary
 * 6. Centralized normalization
 *
 * RULES:
 * - No UI imports allowed
 * - No React imports allowed
 * - No context access allowed
 * - Typed inputs only
 * - Typed outputs only
 * - Errors are data, not exceptions
 * - Pure and deterministic
 */

  client,
  success,
  type Result,
  ValidationError,
  failure,
} from "./index";

/**
 * Fetch all items
 *
 * @param filters?: Record<string - Input parameter
 * @returns {Promise<Result<unknown[]>>} Typed result
 *
 * @example
 * ```typescript
 * const result = await litigation.getAll(...);
 * if (!result.ok) {
 *   // Handle error
 *   return;
 * }
 * // Use result.data
 * ```
 */
export async function getAll(
  filters?: Record<string, unknown>
): Promise<Result<unknown[]>> {
  const result = await client.get<unknown[]>("/litigation", filters || {});
  if (!result.ok) {
    return result;
  }
  return success(result.data);
}

/**
 * Fetch single item by ID
 *
 * @param id: string - Input parameter
 * @returns {Promise<Result<unknown>>} Typed result
 *
 * @example
 * ```typescript
 * const result = await litigation.getById(...);
 * if (!result.ok) {
 *   // Handle error
 *   return;
 * }
 * // Use result.data
 * ```
 */
export async function getById(id: string): Promise<Result<unknown>> {
  if (!id) {
    return failure(new ValidationError("ID is required"));
  }
  const result = await client.get<unknown>(`/litigation/${id}`);
  if (!result.ok) {
    return result;
  }
  return success(result.data);
}

/**
 * Create new item
 *
 * @param input: unknown - Input parameter
 * @returns {Promise<Result<unknown>>} Typed result
 *
 * @example
 * ```typescript
 * const result = await litigation.create(...);
 * if (!result.ok) {
 *   // Handle error
 *   return;
 * }
 * // Use result.data
 * ```
 */
export async function create(input: unknown): Promise<Result<unknown>> {
  if (!input) {
    return failure(new ValidationError("Input is required"));
  }
  const result = await client.post<unknown>("/litigation", input);
  if (!result.ok) {
    return result;
  }
  return success(result.data);
}

/**
 * Update existing item
 *
 * @param id: string - Input parameter
 * @returns {Promise<Result<unknown>>} Typed result
 *
 * @example
 * ```typescript
 * const result = await litigation.update(...);
 * if (!result.ok) {
 *   // Handle error
 *   return;
 * }
 * // Use result.data
 * ```
 */
export async function update(
  id: string,
  input: unknown
): Promise<Result<unknown>> {
  if (!id) {
    return failure(new ValidationError("ID is required"));
  }
  const result = await client.patch<unknown>(`/litigation/${id}`, input);
  if (!result.ok) {
    return result;
  }
  return success(result.data);
}

/**
 * Delete item
 *
 * @param id: string - Input parameter
 * @returns {Promise<Result<void>>} Typed result
 *
 * @example
 * ```typescript
 * const result = await litigation.delete(...);
 * if (!result.ok) {
 *   // Handle error
 *   return;
 * }
 * // Use result.data
 * ```
 */
export async function deleteLitigation(id: string): Promise<Result<void>> {
  if (!id) {
    return failure(new ValidationError("ID is required"));
  }
  const result = await client.delete<void>(`/litigation/${id}`);
  if (!result.ok) {
    return result;
  }
  return success(undefined);
}
