/**
 * Advanced Utility Types
 * Comprehensive collection of utility types for common patterns
 */

/**
 * Deep Partial - Makes all nested properties optional
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Deep Required - Makes all nested properties required
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>;
    }
  : T;

/**
 * Deep Readonly - Makes all nested properties readonly
 */
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

/**
 * Deep Mutable - Removes readonly from all nested properties
 */
export type DeepMutable<T> = T extends object
  ? {
      -readonly [P in keyof T]: DeepMutable<T[P]>;
    }
  : T;

/**
 * Non-Empty Array - Array that must have at least one element
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * At least one property must be present
 */
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

/**
 * Exactly one property must be present
 */
export type ExactlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
  }[Keys];

/**
 * Strict Omit - Ensures keys exist in type
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Strict Pick - Ensures keys exist in type
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

/**
 * Strict Exclude - Type-safe version of Exclude
 */
export type StrictExclude<T, U extends T> = Exclude<T, U>;

/**
 * Value of an object type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Keys of a specific value type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Required keys of a type
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Optional keys of a type
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * Make specific properties required
 */
export type RequireProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties nullable
 */
export type Nullable<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

/**
 * Make specific properties non-nullable
 */
export type NonNullableProps<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: globalThis.NonNullable<T[P]>;
};

/**
 * Promise type extraction
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Function return type extraction
 */
export type ReturnTypeOf<T extends (...args: any[]) => any> = ReturnType<T>;

/**
 * Function parameters extraction
 */
export type ParametersOf<T extends (...args: any[]) => any> = Parameters<T>;

/**
 * First parameter of a function
 */
export type FirstParameter<T extends (...args: any[]) => any> = Parameters<T>[0];

/**
 * Array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : T extends readonly (infer U)[] ? U : never;

/**
 * Tuple to Union
 */
export type TupleToUnion<T extends readonly unknown[]> = T[number];

/**
 * Union to Intersection
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * Merge two types deeply
 */
export type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
    ? T[K]
    : never;
};

/**
 * Override properties in T with U
 */
export type Override<T, U> = Omit<T, keyof U> & U;

/**
 * Flatten nested object type
 */
export type Flatten<T> = T extends object
  ? {
      [K in keyof T]: T[K];
    }
  : T;

/**
 * Mutable version of a type
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Constructor type
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * Abstract constructor type
 */
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;

/**
 * Class type
 */
export type Class<T = any> = Constructor<T> | AbstractConstructor<T>;

/**
 * Primitive types
 */
export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * Built-in types
 */
export type Builtin = Primitive | Function | Date | Error | RegExp;

/**
 * Check if type is any
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Check if type is never
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Check if type is unknown
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

/**
 * Opaque type for branding
 */
export type Opaque<T, K> = T & { readonly __opaque__: K };

/**
 * Nominal type for branding
 */
export type Nominal<T, K> = T & { readonly __nominal__: K };

/**
 * Branded ID type
 */
export type BrandedId<T extends string> = string & { readonly __brand: T };

/**
 * Make properties writable
 */
export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Convert union to tuple
 */
export type UnionToTuple<T> = UnionToIntersection<T extends any ? (t: T) => T : never> extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];

/**
 * Type-safe Object.keys
 */
export type ObjectKeys<T> = T extends object
  ? (keyof T)[]
  : T extends number
  ? []
  : T extends Array<any> | string
  ? string[]
  : never;

/**
 * Type-safe Object.values
 */
export type ObjectValues<T> = T extends object ? T[keyof T][] : T extends Array<infer U> ? U[] : never;

/**
 * Type-safe Object.entries
 */
export type ObjectEntries<T> = T extends object
  ? {
      [K in keyof T]: [K, T[K]];
    }[keyof T][]
  : never;

/**
 * JSON-serializable types
 */
export type JsonSerializable =
  | string
  | number
  | boolean
  | null
  | JsonSerializable[]
  | { [key: string]: JsonSerializable };

/**
 * Deep JSON-compatible version of a type
 */
export type JsonCompatible<T> = T extends JsonSerializable
  ? T
  : T extends Date
  ? string
  : T extends undefined
  ? never
  : T extends object
  ? {
      [K in keyof T as T[K] extends undefined ? never : K]: JsonCompatible<T[K]>;
    }
  : never;

/**
 * Make specific keys required and others optional
 */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

/**
 * Ensure type is object
 */
export type EnsureObject<T> = T extends object ? T : never;

/**
 * Ensure type is array
 */
export type EnsureArray<T> = T extends any[] ? T : never;

/**
 * Ensure type is function
 */
export type EnsureFunction<T> = T extends (...args: any[]) => any ? T : never;

/**
 * Path type for nested objects
 */
export type Path<T, Prefix extends string = ''> = T extends Primitive
  ? Prefix
  : {
      [K in keyof T]: K extends string | number
        ? T[K] extends Primitive | any[]
          ? `${Prefix}${K & string}`
          : `${Prefix}${K & string}` | Path<T[K], `${Prefix}${K & string}.`>
        : never;
    }[keyof T];

/**
 * Get type at path
 */
export type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : never
  : never;

/**
 * Builder pattern helper
 */
export type Builder<T> = {
  [K in keyof T]-?: (value: T[K]) => Builder<T>;
} & {
  build(): T;
};

/**
 * Fluent API helper
 */
export type Fluent<T, R = T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => any ? (...args: A) => R : T[K];
};

/**
 * Enum to union type
 */
export type EnumToUnion<T> = T[keyof T];

/**
 * Reverse mapped type
 */
export type ReverseMap<T extends Record<keyof T, keyof any>> = {
  [P in T[keyof T]]: {
    [K in keyof T]: T[K] extends P ? K : never;
  }[keyof T];
};

/**
 * Safe cast - ensures type compatibility
 */
export type SafeCast<T, U> = T extends U ? T : never;

/**
 * Expand object type - resolve complex types for better IDE hints
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * Expand recursively for nested types
 */
export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

/**
 * Pretty print - simplified type display
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Simplify - flatten intersection types
 */
export type Simplify<T> = { [K in keyof T]: T[K] };

/**
 * If - conditional type helper
 */
export type If<Condition extends boolean, Then, Else> = Condition extends true ? Then : Else;

/**
 * And - logical AND for type-level booleans
 */
export type And<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

/**
 * Or - logical OR for type-level booleans
 */
export type Or<A extends boolean, B extends boolean> = A extends true
  ? true
  : B extends true
  ? true
  : false;

/**
 * Not - logical NOT for type-level booleans
 */
export type Not<A extends boolean> = A extends true ? false : true;

/**
 * Equals - check if two types are equal
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

/**
 * Includes - check if union includes a type
 */
export type Includes<T, U> = T extends U ? true : false;

/**
 * Length - get tuple length
 */
export type Length<T extends readonly any[]> = T['length'];

/**
 * Head - get first element of tuple
 */
export type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;

/**
 * Tail - get all elements except first
 */
export type Tail<T extends readonly any[]> = T extends readonly [any, ...infer R] ? R : never;

/**
 * Last - get last element of tuple
 */
export type Last<T extends readonly any[]> = T extends readonly [...any[], infer L] ? L : never;

/**
 * Init - get all elements except last
 */
export type Init<T extends readonly any[]> = T extends readonly [...infer I, any] ? I : never;

/**
 * Concat - concatenate two tuples
 */
export type Concat<T extends readonly any[], U extends readonly any[]> = [...T, ...U];

/**
 * Reverse - reverse a tuple
 */
export type Reverse<T extends readonly any[]> = T extends readonly [infer First, ...infer Rest]
  ? [...Reverse<Rest>, First]
  : T;

/**
 * Repeat - create tuple with repeated type
 */
export type Repeat<T, N extends number, R extends T[] = []> = R['length'] extends N
  ? R
  : Repeat<T, N, [T, ...R]>;

/**
 * Range - create number literal union from range
 */
export type Range<From extends number, To extends number, Acc extends number[] = []> = Acc['length'] extends To
  ? Acc[number]
  : Range<From, To, [...Acc, Acc['length']]>;

/**
 * Split string by delimiter
 */
export type Split<S extends string, D extends string> = S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S];

/**
 * Join string array
 */
export type Join<T extends string[], D extends string> = T extends [infer F extends string, ...infer R extends string[]]
  ? R extends []
    ? F
    : `${F}${D}${Join<R, D>}`
  : '';

/**
 * Trim string
 */
export type Trim<S extends string> = S extends ` ${infer R}` | `${infer R} `
  ? Trim<R>
  : S;

/**
 * StartsWith - check if string starts with prefix
 */
export type StartsWith<S extends string, Prefix extends string> = S extends `${Prefix}${string}` ? true : false;

/**
 * EndsWith - check if string ends with suffix
 */
export type EndsWith<S extends string, Suffix extends string> = S extends `${string}${Suffix}` ? true : false;

/**
 * Replace - replace first occurrence
 */
export type Replace<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Prefix}${From}${infer Suffix}` ? `${Prefix}${To}${Suffix}` : S;

/**
 * ReplaceAll - replace all occurrences
 */
export type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Prefix}${From}${infer Suffix}`
  ? `${Prefix}${To}${ReplaceAll<Suffix, From, To>}`
  : S;

/**
 * SnakeToCamel - convert snake_case to camelCase
 */
export type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

/**
 * CamelToSnake - convert camelCase to snake_case
 */
export type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Uncapitalize<T>}${CamelToSnake<U>}`
    : `${Uncapitalize<T>}_${CamelToSnake<U>}`
  : S;

/**
 * PickByValue - pick keys by value type
 */
export type PickByValue<T, V> = Pick<T, KeysOfType<T, V>>;

/**
 * OmitByValue - omit keys by value type
 */
export type OmitByValue<T, V> = Omit<T, KeysOfType<T, V>>;

/**
 * FunctionKeys - get all function property keys
 */
export type FunctionKeys<T> = KeysOfType<T, Function>;

/**
 * NonFunctionKeys - get all non-function property keys
 */
export type NonFunctionKeys<T> = Exclude<keyof T, FunctionKeys<T>>;

/**
 * FunctionProperties - pick all function properties
 */
export type FunctionProperties<T> = Pick<T, FunctionKeys<T>>;

/**
 * NonFunctionProperties - pick all non-function properties
 */
export type NonFunctionProperties<T> = Pick<T, NonFunctionKeys<T>>;

/**
 * Promisify - convert sync return type to async
 */
export type Promisify<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

/**
 * PromisifyAll - convert all methods to async
 */
export type PromisifyAll<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[K];
};

/**
 * PartialBy - make specific keys partial
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * RequiredBy - make specific keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * ReadonlyBy - make specific keys readonly
 */
export type ReadonlyBy<T, K extends keyof T> = Omit<T, K> & Readonly<Pick<T, K>>;

/**
 * WritableBy - make specific keys writable
 */
export type WritableBy<T, K extends keyof T> = Omit<T, K> & Writable<Pick<T, K>>;

/**
 * NullableBy - make specific keys nullable
 */
export type NullableBy<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

/**
 * NonNullableBy - make specific keys non-nullable
 */
export type NonNullableBy<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: NonNullable<T[P]>;
};

/**
 * Modify - modify property types
 */
export type Modify<T, R extends Partial<Record<keyof T, any>>> = Omit<T, keyof R> & R;

/**
 * Exact - ensure exact type match (no excess properties)
 */
export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

/**
 * SetRequired - make all properties required except specified
 */
export type SetRequired<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>;

/**
 * SetOptional - make all properties optional except specified
 */
export type SetOptional<T, K extends keyof T> = Partial<Pick<T, K>> & Required<Omit<T, K>>;

/**
 * Merge - deep merge two types
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * MergeAll - merge multiple types
 */
export type MergeAll<T extends readonly any[]> = T extends [infer First, ...infer Rest]
  ? Rest extends readonly any[]
    ? Merge<First, MergeAll<Rest>>
    : First
  : {};

/**
 * PartialDeep - make all nested properties optional
 */
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

/**
 * RequiredDeep - make all nested properties required
 */
export type RequiredDeep<T> = {
  [P in keyof T]-?: T[P] extends object ? RequiredDeep<T[P]> : T[P];
};

/**
 * ReadonlyDeep - make all nested properties readonly
 */
export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P];
};

/**
 * WritableDeep - make all nested properties writable
 */
export type WritableDeep<T> = {
  -readonly [P in keyof T]: T[P] extends object ? WritableDeep<T[P]> : T[P];
};

/**
 * Get nested property type
 */
export type Get<T, K> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? Get<T[First], Rest>
    : never
  : K extends keyof T
  ? T[K]
  : never;

/**
 * Set nested property type
 */
export type Set<T, K extends string, V> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? Merge<T, Record<First, Set<T[First], Rest, V>>>
    : never
  : Merge<T, Record<K, V>>;

/**
 * Unshift - add element to start of tuple
 */
export type Unshift<T extends readonly any[], E> = [E, ...T];

/**
 * Push - add element to end of tuple
 */
export type Push<T extends readonly any[], E> = [...T, E];

/**
 * Shift - remove first element
 */
export type Shift<T extends readonly any[]> = Tail<T>;

/**
 * Pop - remove last element
 */
export type Pop<T extends readonly any[]> = Init<T>;

/**
 * Intersection - get intersection of two types
 */
export type Intersection<T, U> = Pick<
  T,
  {
    [K in keyof T]: K extends keyof U ? K : never;
  }[keyof T]
>;

/**
 * Difference - get properties in T but not in U
 */
export type Difference<T, U> = Pick<
  T,
  {
    [K in keyof T]: K extends keyof U ? never : K;
  }[keyof T]
>;

/**
 * SymmetricDifference - get properties in T or U but not both
 */
export type SymmetricDifference<T, U> = Merge<Difference<T, U>, Difference<U, T>>;

/**
 * Unbranded - remove brand from branded type
 */
export type Unbranded<T> = T extends Opaque<infer U, any>
  ? U
  : T extends Nominal<infer U, any>
  ? U
  : T extends BrandedId<any>
  ? string
  : T;
