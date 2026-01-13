/**
 * Type Guards and Runtime Validators
 * Provides type-safe runtime checking utilities
 */

import { JsonValue, JsonObject, JsonArray, JsonPrimitive } from './json-value.types';

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Type guard for checking if value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Type guard for string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard for boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard for non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard for function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Type guard for Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard for Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (isObject(value) && isFunction((value as any).then));
}

/**
 * Type guard for Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard for JsonPrimitive
 */
export function isJsonPrimitive(value: unknown): value is JsonPrimitive {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  );
}

/**
 * Type guard for JsonObject
 */
export function isJsonObject(value: unknown): value is JsonObject {
  if (!isObject(value)) return false;

  return Object.values(value).every((v) => isJsonValue(v));
}

/**
 * Type guard for JsonArray
 */
export function isJsonArray(value: unknown): value is JsonArray {
  if (!isArray(value)) return false;

  return value.every((v) => isJsonValue(v));
}

/**
 * Type guard for JsonValue
 */
export function isJsonValue(value: unknown): value is JsonValue {
  return isJsonPrimitive(value) || isJsonObject(value) || isJsonArray(value);
}

/**
 * Type guard for Record with specific value type
 */
export function isRecordOf<T>(
  value: unknown,
  guard: (val: unknown) => val is T
): value is Record<string, T> {
  if (!isObject(value)) return false;

  return Object.values(value).every(guard);
}

/**
 * Type guard for Array with specific element type
 */
export function isArrayOf<T>(value: unknown, guard: (val: unknown) => val is T): value is T[] {
  if (!isArray(value)) return false;

  return value.every(guard);
}

/**
 * Type guard for checking if object has specific key
 */
export function hasKey<K extends string>(value: unknown, key: K): value is Record<K, unknown> {
  return isObject(value) && key in value;
}

/**
 * Type guard for checking if object has specific keys
 */
export function hasKeys<K extends string>(
  value: unknown,
  ...keys: K[]
): value is Record<K, unknown> {
  return isObject(value) && keys.every((key) => key in value);
}

/**
 * Type guard for UUID v4
 */
export function isUUID(value: unknown): value is string {
  if (!isString(value)) return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard for email
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Type guard for URL
 */
export function isUrl(value: unknown): value is string {
  if (!isString(value)) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for ISO date string
 */
export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;

  const date = new Date(value);
  return isDate(date) && date.toISOString() === value;
}

/**
 * Type guard for positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * Type guard for non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

/**
 * Type guard for integer
 */
export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

/**
 * Assertion function - throws if condition is false
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assertion function for defined values
 */
export function assertDefined<T>(
  value: T | undefined | null,
  message?: string
): asserts value is T {
  if (!isDefined(value)) {
    throw new Error(message || 'Value must be defined');
  }
}

/**
 * Assertion function for non-null values
 */
export function assertNonNull<T>(value: T | null, message?: string): asserts value is T {
  if (value === null) {
    throw new Error(message || 'Value must not be null');
  }
}

/**
 * Assertion function for string values
 */
export function assertString(value: unknown, message?: string): asserts value is string {
  if (!isString(value)) {
    throw new Error(message || 'Value must be a string');
  }
}

/**
 * Assertion function for number values
 */
export function assertNumber(value: unknown, message?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message || 'Value must be a number');
  }
}

/**
 * Assertion function for object values
 */
export function assertObject(
  value: unknown,
  message?: string
): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error(message || 'Value must be an object');
  }
}

/**
 * Assertion function for array values
 */
export function assertArray(value: unknown, message?: string): asserts value is unknown[] {
  if (!isArray(value)) {
    throw new Error(message || 'Value must be an array');
  }
}

/**
 * Assertion function for non-empty array
 */
export function assertNonEmptyArray<T>(
  value: unknown,
  message?: string
): asserts value is [T, ...T[]] {
  if (!isNonEmptyArray(value)) {
    throw new Error(message || 'Value must be a non-empty array');
  }
}

/**
 * Type guard for enum values
 */
export function isEnumValue<T extends Record<string, string | number>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] {
  return Object.values(enumObj).includes(value as any);
}

/**
 * Assertion function for enum values
 */
export function assertEnumValue<T extends Record<string, string | number>>(
  enumObj: T,
  value: unknown,
  message?: string
): asserts value is T[keyof T] {
  if (!isEnumValue(enumObj, value)) {
    throw new Error(
      message || `Value must be one of: ${Object.values(enumObj).join(', ')}`
    );
  }
}

/**
 * Exhaustive check for discriminated unions
 * Use in default case of switch statements
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(message || `Unexpected value: ${JSON.stringify(value)}`);
}

/**
 * Type guard for tuple
 */
export function isTuple<T extends any[]>(
  value: unknown,
  length: number,
  guards?: Array<(val: unknown) => boolean>
): value is T {
  if (!isArray(value) || value.length !== length) return false;

  if (guards) {
    return guards.every((guard, index) => guard(value[index]));
  }

  return true;
}

/**
 * Type guard for literal types
 */
export function isLiteral<T extends string | number | boolean>(
  value: unknown,
  literal: T
): value is T {
  return value === literal;
}

/**
 * Type guard for union of literals
 */
export function isOneOf<T extends readonly (string | number | boolean)[]>(
  value: unknown,
  literals: T
): value is T[number] {
  return literals.includes(value as any);
}

/**
 * Runtime validator builder
 */
export interface Validator<T> {
  validate(value: unknown): value is T;
  assert(value: unknown, message?: string): asserts value is T;
}

/**
 * Create a validator
 */
export function createValidator<T>(guard: (value: unknown) => value is T): Validator<T> {
  return {
    validate: guard,
    assert(value: unknown, message?: string): asserts value is T {
      if (!guard(value)) {
        throw new Error(message || 'Validation failed');
      }
    },
  };
}

/**
 * Compose validators
 */
export function composeValidators<T>(
  ...validators: Array<(value: unknown) => value is T>
): Validator<T> {
  return createValidator((value): value is T => {
    return validators.every((validator) => validator(value));
  });
}

/**
 * Type guard for Map
 */
export function isMap<K = unknown, V = unknown>(value: unknown): value is Map<K, V> {
  return value instanceof Map;
}

/**
 * Type guard for Set
 */
export function isSet<T = unknown>(value: unknown): value is Set<T> {
  return value instanceof Set;
}

/**
 * Type guard for WeakMap
 */
export function isWeakMap(value: unknown): value is WeakMap<object, any> {
  return value instanceof WeakMap;
}

/**
 * Type guard for WeakSet
 */
export function isWeakSet(value: unknown): value is WeakSet<object> {
  return value instanceof WeakSet;
}

/**
 * Type guard for RegExp
 */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

/**
 * Type guard for Symbol
 */
export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

/**
 * Type guard for BigInt
 */
export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

/**
 * Type guard for class instance
 */
export function isInstanceOf<T>(value: unknown, constructor: new (...args: any[]) => T): value is T {
  return value instanceof constructor;
}

/**
 * Type guard for plain object (not class instance)
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Type guard for empty object
 */
export function isEmptyObject(value: unknown): value is Record<string, never> {
  return isObject(value) && Object.keys(value).length === 0;
}

/**
 * Type guard for empty array
 */
export function isEmptyArray(value: unknown): value is [] {
  return Array.isArray(value) && value.length === 0;
}

/**
 * Type guard for empty string
 */
export function isEmptyString(value: unknown): value is '' {
  return value === '';
}

/**
 * Type guard for whitespace-only string
 */
export function isWhitespaceString(value: unknown): value is string {
  return isString(value) && value.trim().length === 0;
}

/**
 * Type guard for numeric string
 */
export function isNumericString(value: unknown): value is string {
  return isString(value) && !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

/**
 * Type guard for hex color
 */
export function isHexColor(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value);
}

/**
 * Type guard for alpha-numeric
 */
export function isAlphaNumeric(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Type guard for alpha only
 */
export function isAlpha(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^[a-zA-Z]+$/.test(value);
}

/**
 * Type guard for lowercase
 */
export function isLowerCase(value: unknown): value is string {
  return isString(value) && value === value.toLowerCase();
}

/**
 * Type guard for uppercase
 */
export function isUpperCase(value: unknown): value is string {
  return isString(value) && value === value.toUpperCase();
}

/**
 * Type guard for JSON string
 */
export function isJsonString(value: unknown): value is string {
  if (!isString(value)) return false;

  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for base64 string
 */
export function isBase64(value: unknown): value is string {
  if (!isString(value)) return false;

  try {
    return btoa(atob(value)) === value;
  } catch {
    return false;
  }
}

/**
 * Type guard for phone number (basic)
 */
export function isPhoneNumber(value: unknown): value is string {
  if (!isString(value)) return false;

  // Basic international phone number pattern
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(value.replace(/[\s()-]/g, ''));
}

/**
 * Type guard for credit card number (basic Luhn check)
 */
export function isCreditCard(value: unknown): value is string {
  if (!isString(value)) return false;

  const cleaned = value.replace(/[\s-]/g, '');
  if (!/^\d+$/.test(cleaned)) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Type guard for IP address (v4)
 */
export function isIPv4(value: unknown): value is string {
  if (!isString(value)) return false;

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(value)) return false;

  return value.split('.').every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Type guard for IP address (v6)
 */
export function isIPv6(value: unknown): value is string {
  if (!isString(value)) return false;

  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|(([0-9a-fA-F]{1,4}:){1,7}:))$/;
  return ipv6Regex.test(value);
}

/**
 * Type guard for MAC address
 */
export function isMACAddress(value: unknown): value is string {
  if (!isString(value)) return false;

  const macRegex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i;
  return macRegex.test(value);
}

/**
 * Type guard for semantic version
 */
export function isSemVer(value: unknown): value is string {
  if (!isString(value)) return false;

  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(value);
}

/**
 * Type guard for ISO 8601 duration
 */
export function isISO8601Duration(value: unknown): value is string {
  if (!isString(value)) return false;

  const durationRegex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
  return durationRegex.test(value);
}

/**
 * Type guard for JWT token
 */
export function isJWT(value: unknown): value is string {
  if (!isString(value)) return false;

  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtRegex.test(value);
}

/**
 * Type guard for slug (URL-friendly string)
 */
export function isSlug(value: unknown): value is string {
  if (!isString(value)) return false;

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(value);
}

/**
 * Type guard for ObjectId (MongoDB)
 */
export function isObjectId(value: unknown): value is string {
  if (!isString(value)) return false;

  return /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * Type guard for CUID
 */
export function isCUID(value: unknown): value is string {
  if (!isString(value)) return false;

  return /^c[0-9a-z]{24}$/.test(value);
}

/**
 * Type guard for nanoid
 */
export function isNanoId(value: unknown): value is string {
  if (!isString(value)) return false;

  return /^[A-Za-z0-9_-]{21}$/.test(value);
}

/**
 * Type guard for safe integer
 */
export function isSafeInteger(value: unknown): value is number {
  return isNumber(value) && Number.isSafeInteger(value);
}

/**
 * Type guard for finite number
 */
export function isFiniteNumber(value: unknown): value is number {
  return isNumber(value) && Number.isFinite(value);
}

/**
 * Type guard for even number
 */
export function isEvenNumber(value: unknown): value is number {
  return isInteger(value) && value % 2 === 0;
}

/**
 * Type guard for odd number
 */
export function isOddNumber(value: unknown): value is number {
  return isInteger(value) && value % 2 !== 0;
}

/**
 * Type guard for port number
 */
export function isPort(value: unknown): value is number {
  return isInteger(value) && value >= 0 && value <= 65535;
}

/**
 * Type guard for buffer (Node.js)
 */
export function isBuffer(value: unknown): value is { type: 'Buffer'; data: number[] } {
  return (
    value != null &&
    typeof value === 'object' &&
    'type' in value &&
    (value as any).type === 'Buffer' &&
    'data' in value &&
    Array.isArray((value as any).data)
  );
}

/**
 * Type guard for typed array
 */
export function isTypedArray(value: unknown): value is
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

/**
 * Type guard for ArrayBuffer
 */
export function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return value instanceof ArrayBuffer;
}

/**
 * Type guard for DataView
 */
export function isDataView(value: unknown): value is DataView {
  return value instanceof DataView;
}

/**
 * Type guard for Blob
 */
export function isBlob(value: unknown): value is Blob {
  return value instanceof Blob;
}

/**
 * Type guard for File
 */
export function isFile(value: unknown): value is File {
  return value instanceof File;
}

/**
 * Type guard for FormData
 */
export function isFormData(value: unknown): value is FormData {
  return value instanceof FormData;
}

/**
 * Type guard for URLSearchParams
 */
export function isURLSearchParams(value: unknown): value is URLSearchParams {
  return value instanceof URLSearchParams;
}

/**
 * Type guard for URL
 */
export function isURLObject(value: unknown): value is URL {
  return value instanceof URL;
}

/**
 * Type guard for iterable
 */
export function isIterable<T = unknown>(value: unknown): value is Iterable<T> {
  return value != null && typeof (value as any)[Symbol.iterator] === 'function';
}

/**
 * Type guard for async iterable
 */
export function isAsyncIterable<T = unknown>(value: unknown): value is AsyncIterable<T> {
  return value != null && typeof (value as any)[Symbol.asyncIterator] === 'function';
}

/**
 * Type guard for generator
 */
export function isGenerator(value: unknown): value is Generator {
  return (
    value != null &&
    typeof (value as any).next === 'function' &&
    typeof (value as any).throw === 'function' &&
    typeof (value as any).return === 'function'
  );
}

/**
 * Type guard for async generator
 */
export function isAsyncGenerator(value: unknown): value is AsyncGenerator {
  return (
    value != null &&
    typeof (value as any).next === 'function' &&
    typeof (value as any).throw === 'function' &&
    typeof (value as any).return === 'function' &&
    Symbol.asyncIterator in (value as any)
  );
}

/**
 * Narrow type based on discriminant
 */
export function narrow<T, K extends keyof T, V extends T[K]>(
  value: T,
  key: K,
  discriminant: V
): value is Extract<T, Record<K, V>> {
  return value[key] === discriminant;
}

/**
 * Type guard for Record with specific keys
 */
export function hasExactKeys<K extends string>(
  value: unknown,
  keys: readonly K[]
): value is Record<K, unknown> {
  if (!isObject(value)) return false;

  const valueKeys = Object.keys(value);
  return (
    valueKeys.length === keys.length &&
    keys.every(key => key in value)
  );
}

/**
 * Type guard for branded types
 * Note: Runtime check not possible for phantom brands - always returns true
 */
export function isBranded<T, B>(
  _value: unknown,
  _brand: B
): _value is T & { readonly __brand: B } {
  return true; // Runtime check not possible for phantom brands
}

/**
 * Type guard for non-empty object
 */
export function isNonEmptyObject<T extends Record<string, unknown>>(
  value: unknown
): value is T & { [K in keyof T]: T[K] } {
  return isObject(value) && Object.keys(value).length > 0;
}

/**
 * Type guard for array with minimum length
 */
export function hasMinLength<T, N extends number>(
  value: readonly T[],
  minLength: N
): value is readonly T[] & { length: N } {
  return value.length >= minLength;
}

/**
 * Type guard for array with maximum length
 */
export function hasMaxLength<T, N extends number>(
  value: readonly T[],
  maxLength: N
): value is readonly T[] & { length: N } {
  return value.length <= maxLength;
}

/**
 * Type guard for exact length array
 */
export function hasExactLength<T, N extends number>(
  value: readonly T[],
  length: N
): value is readonly T[] & { length: N } {
  return value.length === length;
}
