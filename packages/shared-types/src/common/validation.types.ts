/**
 * Validation Types and Schemas
 * Type-safe validation patterns
 */

/**
 * Validation result
 */
export type ValidationResult =
  | { isValid: true; errors: never }
  | { isValid: false; errors: ValidationError[] };

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  constraint?: string;
  value?: unknown;
}

/**
 * Validator function
 */
export type ValidatorFn<T> = (value: T) => ValidationResult;

/**
 * Async validator function
 */
export type AsyncValidatorFn<T> = (value: T) => Promise<ValidationResult>;

/**
 * Field validator
 */
export interface FieldValidator<T = any> {
  validate(value: T): ValidationResult;
  message?: string;
}

/**
 * Validator chain
 */
export interface ValidatorChain<T> {
  validators: FieldValidator<T>[];
  add(validator: FieldValidator<T>): this;
  validate(value: T): ValidationResult;
}

/**
 * Schema validator
 */
export type SchemaValidator<T> = {
  [K in keyof T]?: FieldValidator<T[K]> | ValidatorChain<T[K]>;
};

/**
 * Validation rule
 */
export interface ValidationRule<T = any> {
  name: string;
  validator: (value: T, context?: any) => boolean;
  message: string | ((value: T, context?: any) => string);
}

/**
 * Common validation rules
 */
export interface CommonValidationRules {
  required: ValidationRule<any>;
  email: ValidationRule<string>;
  url: ValidationRule<string>;
  uuid: ValidationRule<string>;
  min: (value: number) => ValidationRule<number>;
  max: (value: number) => ValidationRule<number>;
  minLength: (length: number) => ValidationRule<string | any[]>;
  maxLength: (length: number) => ValidationRule<string | any[]>;
  pattern: (regex: RegExp) => ValidationRule<string>;
  custom: <T>(fn: (value: T) => boolean, message: string) => ValidationRule<T>;
}

/**
 * String validation constraints
 */
export interface StringConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  uuid?: boolean;
  enum?: string[];
  custom?: (value: string) => boolean;
}

/**
 * Number validation constraints
 */
export interface NumberConstraints {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  multipleOf?: number;
  custom?: (value: number) => boolean;
}

/**
 * Array validation constraints
 */
export interface ArrayConstraints<T = any> {
  minLength?: number;
  maxLength?: number;
  unique?: boolean;
  itemValidator?: FieldValidator<T>;
  custom?: (value: T[]) => boolean;
}

/**
 * Object validation constraints
 */
export interface ObjectConstraints<T = any> {
  schema?: SchemaValidator<T>;
  requiredFields?: (keyof T)[];
  custom?: (value: T) => boolean;
}

/**
 * Date validation constraints
 */
export interface DateConstraints {
  min?: Date | string;
  max?: Date | string;
  future?: boolean;
  past?: boolean;
  custom?: (value: Date) => boolean;
}

/**
 * Conditional validation
 */
export interface ConditionalValidation<T> {
  condition: (value: T) => boolean;
  validator: FieldValidator<T>;
}

/**
 * Cross-field validation
 */
export interface CrossFieldValidation<T> {
  fields: (keyof T)[];
  validator: (values: Partial<T>) => ValidationResult;
}

/**
 * Validation context
 */
export interface ValidationContext<T = any> {
  value: T;
  field?: string;
  parent?: any;
  root?: any;
  path?: string;
  index?: number;
}

/**
 * Validation options
 */
export interface ValidationOptions {
  abortEarly?: boolean; // Stop on first error
  stripUnknown?: boolean; // Remove unknown fields
  context?: any; // Additional context
  recursive?: boolean; // Validate nested objects
}

/**
 * Schema
 */
export interface Schema<T> {
  validate(value: unknown, options?: ValidationOptions): ValidationResult;
  validateAsync(value: unknown, options?: ValidationOptions): Promise<ValidationResult>;
  parse(value: unknown): T;
  safeParse(value: unknown): { success: true; data: T } | { success: false; errors: ValidationError[] };
  optional(): Schema<T | undefined>;
  nullable(): Schema<T | null>;
  default(value: T): Schema<T>;
  transform<U>(transformer: (value: T) => U): Schema<U>;
}

/**
 * String schema
 */
export interface StringSchema extends Schema<string> {
  min(length: number, message?: string): this;
  max(length: number, message?: string): this;
  length(length: number, message?: string): this;
  email(message?: string): this;
  url(message?: string): this;
  uuid(message?: string): this;
  pattern(regex: RegExp, message?: string): this;
  trim(): this;
  lowercase(): this;
  uppercase(): this;
}

/**
 * Number schema
 */
export interface NumberSchema extends Schema<number> {
  min(value: number, message?: string): this;
  max(value: number, message?: string): this;
  positive(message?: string): this;
  negative(message?: string): this;
  integer(message?: string): this;
  multipleOf(value: number, message?: string): this;
}

/**
 * Boolean schema
 */
export interface BooleanSchema extends Schema<boolean> {
  truthy(values?: any[]): this;
  falsy(values?: any[]): this;
}

/**
 * Array schema
 */
export interface ArraySchema<T> extends Schema<T[]> {
  min(length: number, message?: string): this;
  max(length: number, message?: string): this;
  length(length: number, message?: string): this;
  unique(message?: string): this;
  of(schema: Schema<T>): ArraySchema<T>;
}

/**
 * Object schema
 */
export interface ObjectSchema<T extends Record<string, any>> extends Schema<T> {
  shape(schema: { [K in keyof T]: Schema<T[K]> }): this;
  pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>>;
  omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>>;
  partial(): ObjectSchema<Partial<T>>;
  required(): ObjectSchema<Required<T>>;
  extend<U extends Record<string, any>>(
    schema: { [K in keyof U]: Schema<U[K]> }
  ): ObjectSchema<T & U>;
}

/**
 * Union schema
 */
export interface UnionSchema<T> extends Schema<T> {
  of(...schemas: Schema<any>[]): this;
}

/**
 * Intersection schema
 */
export interface IntersectionSchema<T> extends Schema<T> {
  and<U>(schema: Schema<U>): IntersectionSchema<T & U>;
}

/**
 * Enum schema
 */
export interface EnumSchema<T extends string | number> extends Schema<T> {
  values(values: readonly T[]): this;
}

/**
 * Literal schema
 */
export interface LiteralSchema<T extends string | number | boolean> extends Schema<T> {
  value(value: T): this;
}

/**
 * Tuple schema
 */
export interface TupleSchema<T extends any[]> extends Schema<T> {
  items(...schemas: { [K in keyof T]: Schema<T[K]> }): this;
}

/**
 * Record schema
 */
export interface RecordSchema<K extends string | number | symbol, V> extends Schema<Record<K, V>> {
  key(schema: Schema<K>): this;
  value(schema: Schema<V>): this;
}

/**
 * Lazy schema - for recursive types
 */
export interface LazySchema<T> extends Schema<T> {
  lazy(factory: () => Schema<T>): this;
}

/**
 * Refinement - custom validation
 */
export interface Refinement<T> {
  check: (value: T) => boolean;
  message: string | ((value: T) => string);
}

/**
 * Schema builder
 */
export interface SchemaBuilder {
  string(): StringSchema;
  number(): NumberSchema;
  boolean(): BooleanSchema;
  array<T>(schema?: Schema<T>): ArraySchema<T>;
  object<T extends Record<string, any>>(shape: { [K in keyof T]: Schema<T[K]> }): ObjectSchema<T>;
  union<T>(...schemas: Schema<T>[]): UnionSchema<T>;
  intersection<T, U>(first: Schema<T>, second: Schema<U>): IntersectionSchema<T & U>;
  enum<T extends string | number>(values: readonly T[]): EnumSchema<T>;
  literal<T extends string | number | boolean>(value: T): LiteralSchema<T>;
  tuple<T extends any[]>(...schemas: { [K in keyof T]: Schema<T[K]> }): TupleSchema<T>;
  record<K extends string | number | symbol, V>(key: Schema<K>, value: Schema<V>): RecordSchema<K, V>;
  lazy<T>(factory: () => Schema<T>): LazySchema<T>;
  any(): Schema<any>;
  unknown(): Schema<unknown>;
  never(): Schema<never>;
  void(): Schema<void>;
  null(): Schema<null>;
  undefined(): Schema<undefined>;
}

/**
 * Validation middleware
 */
export interface ValidationMiddleware<T = any> {
  before?(value: unknown, context: ValidationContext): unknown;
  after?(result: ValidationResult, value: T, context: ValidationContext): ValidationResult;
}

/**
 * Validator registry
 */
export interface ValidatorRegistry {
  register<T>(name: string, validator: FieldValidator<T>): void;
  get<T>(name: string): FieldValidator<T> | undefined;
  has(name: string): boolean;
  remove(name: string): void;
}

/**
 * Validation error formatter
 */
export interface ValidationErrorFormatter {
  format(errors: ValidationError[]): any;
  formatSingle(error: ValidationError): any;
}

/**
 * Type guard validation
 */
export type TypeGuardValidator<T> = (value: unknown) => value is T;

/**
 * Assertion validation
 */
export type AssertionValidator<T> = (value: unknown) => asserts value is T;
