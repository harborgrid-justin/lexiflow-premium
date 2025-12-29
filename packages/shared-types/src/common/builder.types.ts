/**
 * Builder Pattern Types
 * Type-safe fluent API builders
 */

/**
 * Generic builder interface
 */
export interface IBuilder<T> {
  build(): T;
}

/**
 * Fluent builder with method chaining
 */
export type FluentBuilder<T> = {
  [K in keyof T]-?: (value: T[K]) => FluentBuilder<T>;
} & {
  build(): T;
  reset(): FluentBuilder<T>;
  clone(): FluentBuilder<T>;
};

/**
 * Partial builder - allows building with partial data
 */
export type PartialBuilder<T> = {
  [K in keyof T]?: (value: T[K]) => PartialBuilder<T>;
} & {
  build(): Partial<T>;
  buildRequired(): T;
};

/**
 * Step builder - enforces build order
 */
export type StepBuilder<T, Steps extends keyof T> = {
  [K in Steps]: (value: T[K]) => StepBuilder<T, Exclude<Steps, K>>;
} & (Steps extends never ? { build(): T } : {});

/**
 * Conditional builder - fields depend on previous choices
 */
export type ConditionalBuilder<T> = {
  [K in keyof T]-?: (value: T[K]) => ConditionalBuilder<Omit<T, K>>;
} & (keyof T extends never ? { build(): any } : {});

/**
 * Immutable builder - returns new instance on each call
 */
export type ImmutableBuilder<T> = {
  readonly [K in keyof T]-?: (value: T[K]) => ImmutableBuilder<T>;
} & {
  readonly build: () => Readonly<T>;
};

/**
 * Validator builder - validates each step
 */
export interface ValidatorBuilder<T> {
  validators: Map<keyof T, (value: any) => boolean>;
  addValidator<K extends keyof T>(key: K, validator: (value: T[K]) => boolean): this;
  validate(data: Partial<T>): boolean;
  getErrors(data: Partial<T>): Array<{ field: keyof T; message: string }>;
}

/**
 * Default value builder - provides defaults
 */
export type DefaultValueBuilder<T> = {
  [K in keyof T]-?: (value?: T[K]) => DefaultValueBuilder<T>;
} & {
  build(): T;
  withDefaults(defaults: Partial<T>): DefaultValueBuilder<T>;
};

/**
 * Recursive builder for nested objects
 */
export type RecursiveBuilder<T> = {
  [K in keyof T]-?: T[K] extends object
    ? (builder: (b: RecursiveBuilder<T[K]>) => RecursiveBuilder<T[K]>) => RecursiveBuilder<T>
    : (value: T[K]) => RecursiveBuilder<T>;
} & {
  build(): T;
};

/**
 * Array builder helper
 */
export interface ArrayBuilder<T> {
  add(item: T): this;
  addAll(items: T[]): this;
  remove(predicate: (item: T) => boolean): this;
  clear(): this;
  build(): T[];
}

/**
 * Map builder helper
 */
export interface MapBuilder<K, V> {
  set(key: K, value: V): this;
  setAll(entries: Map<K, V> | [K, V][]): this;
  delete(key: K): this;
  clear(): this;
  build(): Map<K, V>;
}

/**
 * Set builder helper
 */
export interface SetBuilder<T> {
  add(item: T): this;
  addAll(items: Set<T> | T[]): this;
  delete(item: T): this;
  clear(): this;
  build(): Set<T>;
}

/**
 * Query builder for complex queries
 */
export interface QueryBuilder<T> {
  where<K extends keyof T>(field: K, operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like', value: any): this;
  and(): this;
  or(): this;
  orderBy<K extends keyof T>(field: K, direction: 'asc' | 'desc'): this;
  limit(count: number): this;
  offset(count: number): this;
  build(): QuerySpec<T>;
}

/**
 * Query specification
 */
export interface QuerySpec<T> {
  filters: Array<{
    field: keyof T;
    operator: string;
    value: any;
    logic?: 'and' | 'or';
  }>;
  orderBy?: Array<{
    field: keyof T;
    direction: 'asc' | 'desc';
  }>;
  limit?: number;
  offset?: number;
}

/**
 * Factory builder for creating instances
 */
export interface FactoryBuilder<T, Args extends any[] = []> {
  create(...args: Args): T;
  createMany(count: number, ...args: Args): T[];
  register(factory: (...args: Args) => T): void;
}

/**
 * Prototype builder - clones from prototype
 */
export interface PrototypeBuilder<T> {
  from(prototype: T): this;
  modify<K extends keyof T>(field: K, value: T[K]): this;
  build(): T;
}

/**
 * Composite builder - combines multiple builders
 */
export interface CompositeBuilder<T> {
  addBuilder<K extends keyof T>(key: K, builder: IBuilder<T[K]>): this;
  build(): T;
}

/**
 * Lazy builder - builds on demand
 */
export interface LazyBuilder<T> {
  defer<K extends keyof T>(key: K, factory: () => T[K]): this;
  build(): T;
}

/**
 * Cached builder - caches built results
 */
export interface CachedBuilder<T> {
  build(): T;
  invalidate(): void;
  isCached(): boolean;
}

/**
 * Observable builder - notifies on changes
 */
export interface ObservableBuilder<T> extends IBuilder<T> {
  subscribe(listener: (partial: Partial<T>) => void): () => void;
  unsubscribe(listener: (partial: Partial<T>) => void): void;
}

/**
 * Transaction builder - supports rollback
 */
export interface TransactionBuilder<T> extends IBuilder<T> {
  begin(): this;
  commit(): T;
  rollback(): this;
  savepoint(name: string): this;
  rollbackTo(name: string): this;
}
