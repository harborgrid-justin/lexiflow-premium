/**
 * @module utils/type-mapping
 * @description Implements Principle XXIII: Type-Level Mapping.
 * Uses Recursive Conditional Types to transform backend DTOs into frontend domain models.
 */

import type { Brand } from "@/types";

// Primitive types mapping
type BackendToFrontendPrimitive<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends null
        ? null
        : T extends undefined
          ? undefined
          : T;

// Recursive mapper
export type DomainMapper<T> = {
  [K in keyof T]: T[K] extends Array<infer U> // Handle Arrays
    ? Array<DomainMapper<U>>
    : // Handle Objects
      T[K] extends object
      ? DomainMapper<T[K]>
      : // Handle Date strings -> Date objects (Example rule)
        K extends "createdAt" | "updatedAt" | "postedDate"
        ? Date
        : // Handle IDs -> Branded Types (Example rule - requires specific key naming convention)
          K extends "id"
          ? Brand<string, "ID">
          : K extends "userId"
            ? Brand<string, "UserId">
            : // Default
              BackendToFrontendPrimitive<T[K]>;
};

/**
 * Runtime transformer that matches the compile-time type mapping.
 * @param dto The backend DTO object
 */
export function mapDtoToDomain<T extends object>(dto: T): DomainMapper<T> {
  if (Array.isArray(dto)) {
    const items = dto as unknown[];
    const mapped = items.map((item) =>
      typeof item === "object" && item !== null
        ? mapDtoToDomain(item)
        : item,
    ) as DomainMapper<T>;
    return mapped;
  }

  if (dto === null || typeof dto !== "object") {
    throw new Error("DTO must be a non-null object");
  }

  const result: Record<string, unknown> = {};

  for (const key of Object.keys(dto)) {
    const value = dto[key as keyof T];

    // Transform Dates
    if (["createdAt", "updatedAt", "postedDate"].includes(key)) {
      result[key] = new Date(value as string | number | Date);
    }
    // Recursion
    else if (typeof value === "object" && value !== null) {
      result[key] = mapDtoToDomain(value as object);
    }
    // Pass through
    else {
      result[key] = value;
    }
  }

  return result as DomainMapper<T>;
}
