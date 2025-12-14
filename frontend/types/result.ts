/**
 * @module types/result
 * @category Types - Core
 * @description Type-safe Result<T, E> pattern for error handling without exceptions.
 * Inspired by Rust's Result type, provides compile-time guarantees for error handling.
 * 
 * USAGE:
 * ```typescript
 * function parseData(input: string): Result<Data, ParseError> {
 *   if (valid) return ok(data);
 *   return err({ code: 'INVALID_FORMAT', message: 'Bad input' });
 * }
 * 
 * const result = parseData(input);
 * if (result.ok) {
 *   console.log(result.value);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Success result variant
 */
export interface Ok<T> {
  ok: true;
  value: T;
}

/**
 * Error result variant
 */
export interface Err<E> {
  ok: false;
  error: E;
}

/**
 * Result type representing either success (Ok) or failure (Err)
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

// ============================================================================
// CONSTRUCTORS
// ============================================================================

/**
 * Create a successful result
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/**
 * Create an error result
 */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if result is Ok
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

/**
 * Type guard to check if result is Err
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

// ============================================================================
// COMBINATORS
// ============================================================================

/**
 * Map a function over the success value
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

/**
 * Map a function over the error value
 */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (!result.ok) {
    return err(fn(result.error));
  }
  return result;
}

/**
 * Chain computations that return Results (flatMap/bind)
 */
export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

/**
 * Unwrap the value or provide a default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

/**
 * Unwrap the value or compute a default
 */
export function unwrapOrElse<T, E>(
  result: Result<T, E>,
  fn: (error: E) => T
): T {
  return result.ok ? result.value : fn(result.error);
}

/**
 * Convert Result to a tuple [value | null, error | null]
 * Useful for destructuring patterns
 */
export function toTuple<T, E>(
  result: Result<T, E>
): [T, null] | [null, E] {
  return result.ok ? [result.value, null] : [null, result.error];
}

/**
 * Collect multiple Results into a single Result with an array of values
 * Returns Err on first error encountered
 */
export function collect<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (!result.ok) {
      return result;
    }
    values.push(result.value);
  }
  return ok(values);
}

/**
 * Wrap a potentially throwing function in a Result
 */
export function tryCatch<T, E = Error>(
  fn: () => T,
  errorHandler?: (error: unknown) => E
): Result<T, E> {
  try {
    return ok(fn());
  } catch (error) {
    const mappedError = errorHandler 
      ? errorHandler(error) 
      : (error as E);
    return err(mappedError);
  }
}

/**
 * Async version of tryCatch
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => E
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (error) {
    const mappedError = errorHandler 
      ? errorHandler(error) 
      : (error as E);
    return err(mappedError);
  }
}
