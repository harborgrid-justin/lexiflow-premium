/**
 * Mapper and Transformation Types
 * Type-safe data transformation patterns
 */

/**
 * Generic mapper interface
 */
export interface Mapper<TSource, TTarget> {
  map(source: TSource): TTarget;
  mapArray(sources: TSource[]): TTarget[];
}

/**
 * Bidirectional mapper
 */
export interface BidirectionalMapper<TSource, TTarget> extends Mapper<TSource, TTarget> {
  reverse(target: TTarget): TSource;
  reverseArray(targets: TTarget[]): TSource[];
}

/**
 * Async mapper
 */
export interface AsyncMapper<TSource, TTarget> {
  map(source: TSource): Promise<TTarget>;
  mapArray(sources: TSource[]): Promise<TTarget[]>;
}

/**
 * Conditional mapper
 */
export interface ConditionalMapper<TSource, TTarget> {
  canMap(source: TSource): boolean;
  map(source: TSource): TTarget | null;
}

/**
 * Composite mapper
 */
export interface CompositeMapper<TSource, TIntermediate, TTarget> {
  first: Mapper<TSource, TIntermediate>;
  second: Mapper<TIntermediate, TTarget>;
  map(source: TSource): TTarget;
}

/**
 * Type-safe field mapping
 */
export type FieldMapping<TSource, TTarget> = {
  [K in keyof TTarget]: K extends keyof TSource
    ? TSource[K] extends TTarget[K]
      ? K
      : never
    : never;
}[keyof TTarget];

/**
 * Mapping configuration
 */
export interface MappingConfig<TSource, TTarget> {
  fields: Partial<{
    [K in keyof TTarget]: keyof TSource | ((source: TSource) => TTarget[K]);
  }>;
  beforeMap?: (source: TSource) => TSource;
  afterMap?: (target: TTarget, source: TSource) => TTarget;
}

/**
 * Transform function
 */
export type TransformFn<TIn, TOut> = (input: TIn) => TOut;

/**
 * Async transform function
 */
export type AsyncTransformFn<TIn, TOut> = (input: TIn) => Promise<TOut>;

/**
 * Transform pipeline
 */
export interface TransformPipeline<TIn, TOut> {
  transformers: Array<TransformFn<any, any>>;
  transform(input: TIn): TOut;
  add<TNext>(transformer: TransformFn<TOut, TNext>): TransformPipeline<TIn, TNext>;
}

/**
 * DTO to Entity mapper
 */
export type DtoToEntity<TDto, TEntity> = Mapper<TDto, TEntity>;

/**
 * Entity to DTO mapper
 */
export type EntityToDto<TEntity, TDto> = Mapper<TEntity, TDto>;

/**
 * Deep mapper - maps nested structures
 */
export interface DeepMapper<TSource, TTarget> {
  map(source: TSource): TTarget;
  mapDeep(source: TSource, depth?: number): TTarget;
}

/**
 * Partial mapper - maps only specified fields
 */
export interface PartialMapper<TSource, TTarget> {
  map<K extends keyof TTarget>(
    source: TSource,
    fields: K[]
  ): Pick<TTarget, K>;
}

/**
 * Flattening mapper - converts nested object to flat dot-notation structure
 */
export type FlattenMapper<T> = T extends object
  ? {
      [K in keyof T as T[K] extends object
        ? `${K & string}.${keyof T[K] & string}`
        : K]: T[K] extends object ? FlattenMapper<T[K]> : T[K];
    }
  : T;

/**
 * Unnesting mapper - converts flat dot-notation to nested object
 */
export type UnflattenMapper<T extends Record<string, any>> = {
  [K in keyof T as K extends `${infer P}.${string}` ? P : K]: K extends `${string}.${infer R}`
    ? UnflattenMapper<{ [K in R]: T[K] }>
    : T[K];
};

/**
 * Property renaming mapper
 */
export type RenameProperties<T, Mapping extends Partial<Record<keyof T, string>>> = {
  [K in keyof T as K extends keyof Mapping
    ? Mapping[K] extends string
      ? Mapping[K]
      : K
    : K]: T[K];
};

/**
 * Type conversion mapper
 */
export type ConvertTypes<
  T,
  Conversions extends Partial<Record<keyof T, any>>
> = {
  [K in keyof T]: K extends keyof Conversions ? Conversions[K] : T[K];
};

/**
 * Serializer interface
 */
export interface Serializer<T, TSerialized = string> {
  serialize(data: T): TSerialized;
  deserialize(serialized: TSerialized): T;
}

/**
 * JSON serializer
 */
export type JsonSerializer<T> = Serializer<T, string>;

/**
 * Binary serializer
 */
export type BinarySerializer<T> = Serializer<T, Uint8Array>;

/**
 * Adapter pattern
 */
export interface Adapter<TFrom, TTo> {
  adapt(from: TFrom): TTo;
}

/**
 * Converter pattern
 */
export interface Converter<TFrom, TTo> {
  convert(from: TFrom): TTo;
  canConvert(from: unknown): from is TFrom;
}

/**
 * Registry of converters
 */
export interface ConverterRegistry {
  register<TFrom, TTo>(
    fromType: string,
    toType: string,
    converter: Converter<TFrom, TTo>
  ): void;
  convert<TFrom, TTo>(
    from: TFrom,
    fromType: string,
    toType: string
  ): TTo;
}

/**
 * Projection - select specific fields
 */
export type Projection<T, K extends keyof T> = Pick<T, K>;

/**
 * View model mapper
 */
export interface ViewModelMapper<TEntity, TViewModel> {
  toViewModel(entity: TEntity): TViewModel;
  toViewModelList(entities: TEntity[]): TViewModel[];
}

/**
 * Aggregation mapper
 */
export interface AggregationMapper<TSource, TAggregate> {
  aggregate(sources: TSource[]): TAggregate;
}

/**
 * Denormalization mapper
 */
export interface DenormalizationMapper<TNormalized, TDenormalized> {
  denormalize(normalized: TNormalized): TDenormalized;
}

/**
 * Normalization mapper
 */
export interface NormalizationMapper<TDenormalized, TNormalized> {
  normalize(denormalized: TDenormalized): TNormalized;
}

/**
 * Merge strategy
 */
export type MergeStrategy = 'overwrite' | 'preserve' | 'merge' | 'custom';

/**
 * Merger interface
 */
export interface Merger<T> {
  merge(target: T, source: Partial<T>, strategy?: MergeStrategy): T;
}

/**
 * Deep merger
 */
export interface DeepMerger<T> {
  merge(target: T, source: Partial<T>): T;
  mergeDeep(target: T, source: Partial<T>, depth?: number): T;
}

/**
 * Cloner interface
 */
export interface Cloner<T> {
  clone(source: T): T;
  cloneDeep(source: T): T;
}

/**
 * Differ interface - computes differences
 */
export interface Differ<T> {
  diff(oldValue: T, newValue: T): Diff<T>;
}

/**
 * Diff result
 */
export interface Diff<T> {
  added: Partial<T>;
  removed: Partial<T>;
  modified: Partial<T>;
  unchanged: Partial<T>;
}

/**
 * Patch - represents a change
 */
export interface Patch<T = unknown> {
  path: string;
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy';
  value?: any;
  from?: string;
  _phantom?: T; // For type association
}

/**
 * Patch applier
 */
export interface PatchApplier<T> {
  apply(target: T, patches: Patch<T>[]): T;
}

/**
 * Hydrator - fills object with data
 */
export interface Hydrator<T> {
  hydrate(target: T, data: Partial<T>): T;
  extract(source: T): Partial<T>;
}

/**
 * Factory for creating mappers
 */
export interface MapperFactory {
  create<TSource, TTarget>(
    config: MappingConfig<TSource, TTarget>
  ): Mapper<TSource, TTarget>;
}

/**
 * Auto mapper - automatically maps similar structures
 */
export interface AutoMapper {
  map<TSource, TTarget>(source: TSource, targetType: new () => TTarget): TTarget;
}

/**
 * Expression mapper - maps based on expressions
 */
export type Expression<T, TResult> = (obj: T) => TResult;

export interface ExpressionMapper<TSource, TTarget> {
  map<K extends keyof TTarget>(
    key: K,
    expression: Expression<TSource, TTarget[K]>
  ): this;
  build(): Mapper<TSource, TTarget>;
}
