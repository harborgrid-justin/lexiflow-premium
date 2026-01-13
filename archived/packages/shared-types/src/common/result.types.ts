/**
 * Result/Either Pattern for Functional Error Handling
 * Type-safe error handling without exceptions
 */

import { ApiError } from '../dto/api-response.dto';

/**
 * Result type - represents success or failure
 */
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

/**
 * Success variant
 */
export interface Ok<T, E = Error> {
  readonly _tag: 'Ok';
  readonly isOk: true;
  readonly isErr: false;
  readonly value: T;
  readonly error?: never;
  readonly _phantomError?: E; // Phantom type for variance
}

/**
 * Error variant
 */
export interface Err<T, E = Error> {
  readonly _tag: 'Err';
  readonly isOk: false;
  readonly isErr: true;
  readonly value?: never;
  readonly error: E;
  readonly _phantomValue?: T; // Phantom type for variance
}

/**
 * Create a success result
 */
export function ok<T, E = Error>(value: T): Ok<T, E> {
  return {
    _tag: 'Ok',
    isOk: true,
    isErr: false,
    value,
  } as Ok<T, E>;
}

/**
 * Create an error result
 */
export function err<T, E = Error>(error: E): Err<T, E> {
  return {
    _tag: 'Err',
    isOk: false,
    isErr: true,
    error,
  } as Err<T, E>;
}

/**
 * Type guard for Ok
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T, E> {
  return result.isOk;
}

/**
 * Type guard for Err
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<T, E> {
  return result.isErr;
}

/**
 * Result utilities
 */
export namespace Result {
  /**
   * Map over the success value
   */
  export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    return result.isOk ? ok(fn(result.value)) : err(result.error);
  }

  /**
   * Map over the error value
   */
  export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    return result.isErr ? err(fn(result.error)) : ok(result.value);
  }

  /**
   * FlatMap (chain) - map and flatten
   */
  export function flatMap<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
  ): Result<U, E> {
    return result.isOk ? fn(result.value) : err(result.error);
  }

  /**
   * Match on result - execute different functions for Ok/Err
   */
  export function match<T, E, U>(
    result: Result<T, E>,
    onOk: (value: T) => U,
    onErr: (error: E) => U
  ): U {
    return result.isOk ? onOk(result.value) : onErr(result.error);
  }

  /**
   * Get value or default
   */
  export function getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
    return result.isOk ? result.value : defaultValue;
  }

  /**
   * Get value or compute default
   */
  export function getOrElseGet<T, E>(result: Result<T, E>, fn: (error: E) => T): T {
    return result.isOk ? result.value : fn(result.error);
  }

  /**
   * Get value or throw error
   */
  export function unwrap<T, E>(result: Result<T, E>): T {
    if (result.isErr) {
      throw result.error;
    }
    return result.value;
  }

  /**
   * Get value or throw with custom message
   */
  export function expect<T, E>(result: Result<T, E>, message: string): T {
    if (result.isErr) {
      throw new Error(`${message}: ${result.error}`);
    }
    return result.value;
  }

  /**
   * Combine multiple results into one
   */
  export function all<T extends readonly Result<any, any>[]>(
    results: T
  ): Result<{ [K in keyof T]: T[K] extends Result<infer U, any> ? U : never }, any> {
    const values: any[] = [];

    for (const result of results) {
      if (result.isErr) {
        return result;
      }
      values.push(result.value);
    }

    return ok(values as any);
  }

  /**
   * Wrap a function that might throw
   */
  export function tryCatch<T, E = Error>(fn: () => T, mapError?: (error: unknown) => E): Result<T, E> {
    try {
      return ok(fn());
    } catch (error) {
      return err(mapError ? mapError(error) : (error as E));
    }
  }

  /**
   * Wrap an async function that might throw
   */
  export async function tryCatchAsync<T, E = Error>(
    fn: () => Promise<T>,
    mapError?: (error: unknown) => E
  ): Promise<Result<T, E>> {
    try {
      const value = await fn();
      return ok(value);
    } catch (error) {
      return err(mapError ? mapError(error) : (error as E));
    }
  }

  /**
   * Convert nullable to Result
   */
  export function fromNullable<T, E>(value: T | null | undefined, error: E): Result<T, E> {
    return value != null ? ok(value) : err(error);
  }

  /**
   * Convert Promise to Result
   */
  export async function fromPromise<T, E = Error>(
    promise: Promise<T>,
    mapError?: (error: unknown) => E
  ): Promise<Result<T, E>> {
    return tryCatchAsync(() => promise, mapError);
  }

  /**
   * Tap into success value (for side effects)
   */
  export function tap<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E> {
    if (result.isOk) {
      fn(result.value);
    }
    return result;
  }

  /**
   * Tap into error value (for side effects)
   */
  export function tapErr<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> {
    if (result.isErr) {
      fn(result.error);
    }
    return result;
  }

  /**
   * Filter result based on predicate
   */
  export function filter<T, E>(
    result: Result<T, E>,
    predicate: (value: T) => boolean,
    error: E
  ): Result<T, E> {
    return result.isOk && predicate(result.value) ? result : err(error);
  }

  /**
   * Recover from error
   */
  export function recover<T, E>(result: Result<T, E>, fn: (error: E) => T): Result<T, E> {
    return result.isErr ? ok(fn(result.error)) : result;
  }

  /**
   * Recover from error with Result
   */
  export function recoverWith<T, E>(
    result: Result<T, E>,
    fn: (error: E) => Result<T, E>
  ): Result<T, E> {
    return result.isErr ? fn(result.error) : result;
  }

  /**
   * Partition array of results into successes and failures
   */
  export function partition<T, E>(
    results: Result<T, E>[]
  ): { oks: T[]; errs: E[] } {
    const oks: T[] = [];
    const errs: E[] = [];

    for (const result of results) {
      if (result.isOk) {
        oks.push(result.value);
      } else {
        errs.push(result.error);
      }
    }

    return { oks, errs };
  }
}

/**
 * Option type - represents presence or absence of a value
 */
export type Option<T> = Some<T> | None;

/**
 * Some variant - value is present
 */
export interface Some<T> {
  readonly _tag: 'Some';
  readonly isSome: true;
  readonly isNone: false;
  readonly value: T;
}

/**
 * None variant - value is absent
 */
export interface None {
  readonly _tag: 'None';
  readonly isSome: false;
  readonly isNone: true;
  readonly value?: never;
}

/**
 * Create Some
 */
export function some<T>(value: T): Some<T> {
  return {
    _tag: 'Some',
    isSome: true,
    isNone: false,
    value,
  } as Some<T>;
}

/**
 * Create None
 */
export function none(): None {
  return {
    _tag: 'None',
    isSome: false,
    isNone: true,
  } as None;
}

/**
 * Type guard for Some
 */
export function isSome<T>(option: Option<T>): option is Some<T> {
  return option.isSome;
}

/**
 * Type guard for None
 */
export function isNone<T>(option: Option<T>): option is None {
  return option.isNone;
}

/**
 * Option utilities
 */
export namespace Option {
  /**
   * Map over the value
   */
  export function map<T, U>(option: Option<T>, fn: (value: T) => U): Option<U> {
    return option.isSome ? some(fn(option.value)) : none();
  }

  /**
   * FlatMap (chain)
   */
  export function flatMap<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> {
    return option.isSome ? fn(option.value) : none();
  }

  /**
   * Match on option
   */
  export function match<T, U>(option: Option<T>, onSome: (value: T) => U, onNone: () => U): U {
    return option.isSome ? onSome(option.value) : onNone();
  }

  /**
   * Get value or default
   */
  export function getOrElse<T>(option: Option<T>, defaultValue: T): T {
    return option.isSome ? option.value : defaultValue;
  }

  /**
   * Get value or compute default
   */
  export function getOrElseGet<T>(option: Option<T>, fn: () => T): T {
    return option.isSome ? option.value : fn();
  }

  /**
   * Convert nullable to Option
   */
  export function fromNullable<T>(value: T | null | undefined): Option<T> {
    return value != null ? some(value) : none();
  }

  /**
   * Convert Option to Result
   */
  export function toResult<T, E>(option: Option<T>, error: E): Result<T, E> {
    return option.isSome ? ok(option.value) : err(error);
  }

  /**
   * Filter option
   */
  export function filter<T>(option: Option<T>, predicate: (value: T) => boolean): Option<T> {
    return option.isSome && predicate(option.value) ? option : none();
  }

  /**
   * Tap into value
   */
  export function tap<T>(option: Option<T>, fn: (value: T) => void): Option<T> {
    if (option.isSome) {
      fn(option.value);
    }
    return option;
  }
}

/**
 * Either type - left or right
 * Convention: Left is error, Right is success
 */
export type Either<L, R> = Left<L, R> | Right<L, R>;

/**
 * Left variant
 */
export interface Left<L, R> {
  readonly _tag: 'Left';
  readonly isLeft: true;
  readonly isRight: false;
  readonly left: L;
  readonly right?: never;
  readonly _phantom?: R; // Phantom type for variance
}

/**
 * Right variant
 */
export interface Right<L, R> {
  readonly _tag: 'Right';
  readonly isLeft: false;
  readonly isRight: true;
  readonly left?: never;
  readonly right: R;
  readonly _phantom?: L; // Phantom type for variance
}

/**
 * Create Left
 */
export function left<L, R = never>(value: L): Left<L, R> {
  return {
    _tag: 'Left',
    isLeft: true,
    isRight: false,
    left: value,
  } as Left<L, R>;
}

/**
 * Create Right
 */
export function right<L = never, R = unknown>(value: R): Right<L, R> {
  return {
    _tag: 'Right',
    isLeft: false,
    isRight: true,
    right: value,
  } as Right<L, R>;
}

/**
 * Type guard for Left
 */
export function isLeft<L, R>(either: Either<L, R>): either is Left<L, R> {
  return either.isLeft;
}

/**
 * Type guard for Right
 */
export function isRight<L, R>(either: Either<L, R>): either is Right<L, R> {
  return either.isRight;
}

/**
 * Either utilities
 */
export namespace Either {
  /**
   * Map over right value
   */
  export function map<L, R, U>(either: Either<L, R>, fn: (value: R) => U): Either<L, U> {
    return either.isRight ? right<L, U>(fn(either.right)) : (left<L, U>(either.left) as Either<L, U>);
  }

  /**
   * Map over left value
   */
  export function mapLeft<L, R, U>(either: Either<L, R>, fn: (value: L) => U): Either<U, R> {
    return either.isLeft ? (left<U, R>(fn(either.left)) as Either<U, R>) : right<U, R>(either.right);
  }

  /**
   * FlatMap over right
   */
  export function flatMap<L, R, U>(
    either: Either<L, R>,
    fn: (value: R) => Either<L, U>
  ): Either<L, U> {
    return either.isRight ? fn(either.right) : (left<L, U>(either.left) as Either<L, U>);
  }

  /**
   * Match on either
   */
  export function match<L, R, U>(
    either: Either<L, R>,
    onLeft: (value: L) => U,
    onRight: (value: R) => U
  ): U {
    return either.isLeft ? onLeft(either.left) : onRight(either.right);
  }

  /**
   * Convert Either to Result
   */
  export function toResult<L, R>(either: Either<L, R>): Result<R, L> {
    return either.isRight ? ok(either.right) : err(either.left);
  }

  /**
   * Convert Result to Either
   */
  export function fromResult<T, E>(result: Result<T, E>): Either<E, T> {
    return result.isOk ? right<E, T>(result.value) : left<E, T>(result.error);
  }
}

/**
 * API-specific Result type
 */
export type ApiResult<T> = Result<T, ApiError>;

/**
 * Create success API result
 */
export function apiOk<T>(value: T): ApiResult<T> {
  return ok(value);
}

/**
 * Create error API result
 */
export function apiErr<T>(error: ApiError): ApiResult<T> {
  return err(error);
}

/**
 * Async Result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Async API Result type
 */
export type AsyncApiResult<T> = Promise<ApiResult<T>>;
