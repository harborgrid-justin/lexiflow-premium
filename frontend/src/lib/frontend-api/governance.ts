/**
 * Frontend API Governance
 * Type guards and validation to enforce architecture rules
 *
 * @module lib/frontend-api/governance
 * @description Compile-time and runtime checks per spec XIV:
 *
 * GOVERNANCE RULES:
 * 1. No UI imports allowed (React, components, etc.)
 * 2. No React imports allowed
 * 3. No context access allowed
 * 4. Typed inputs only
 * 5. Typed outputs only (Result<T>)
 * 6. Errors are data, not exceptions
 * 7. Pure and deterministic
 *
 * USAGE:
 * Add to ESLint config:
 * ```json
 * {
 *   "overrides": [{
 *     "files": ["src/lib/frontend-api/**/*.ts"],
 *     "rules": {
 *       "no-restricted-imports": ["error", {
 *         "patterns": [
 *           "react",
 *           "react-dom",
 *           "@/components/*",
 *           "@/contexts/*",
 *           "@/hooks/*",
 *           "*.tsx"
 *         ]
 *       }]
 *     }
 *   }]
 * }
 * ```
 *
 * REVIEW CHECKLIST:
 * [ ] Does this code bypass the frontend API?
 * [ ] Are backend errors mapped to domain errors?
 * [ ] Is normalization centralized?
 * [ ] Are return types stable?
 * [ ] Is optimism handled outside the API?
 * [ ] Is revalidation guaranteed?
 */

import type { Result } from "./types";

/**
 * Type guard: ensure function returns Result<T>
 */
export type ApiFunction<TArgs extends unknown[], TData> = (
  ...args: TArgs
) => Promise<Result<TData>>;

/**
 * Validate that all exports are API functions
 */
export type ApiModule<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => Promise<Result<infer Data>>
    ? ApiFunction<Args, Data>
    : never;
};

/**
 * Runtime check: ensure no React imports
 * Use in tests to validate API purity
 */
export function assertNoReactImports(module: unknown): void {
  const moduleString = String(module);

  const forbiddenPatterns = [
    /import.*from\s+['"]react['"]/,
    /import.*from\s+['"]react-dom['"]/,
    /React\./,
    /useState/,
    /useEffect/,
    /useContext/,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(moduleString)) {
      throw new Error(
        `Frontend API module contains forbidden React import: ${pattern}`
      );
    }
  }
}

/**
 * Runtime check: ensure function is pure (no side effects)
 * Use in tests to validate determinism
 */
export async function assertPure<TArgs extends unknown[], TData>(
  fn: ApiFunction<TArgs, TData>,
  args: TArgs
): Promise<void> {
  const result1 = await fn(...args);
  const result2 = await fn(...args);

  // Results should be structurally equal
  if (JSON.stringify(result1) !== JSON.stringify(result2)) {
    throw new Error(
      `Function is not pure - multiple calls with same args produced different results`
    );
  }
}

/**
 * Runtime check: ensure return type is Result<T>
 */
export function assertReturnsResult<T>(
  value: unknown
): asserts value is Result<T> {
  if (typeof value !== "object" || value === null) {
    throw new Error("API function must return Result<T>");
  }

  const result = value as Record<string, unknown>;

  if (!("ok" in result) || typeof result.ok !== "boolean") {
    throw new Error("Result must have boolean 'ok' property");
  }

  if (result.ok === true) {
    if (!("data" in result)) {
      throw new Error("Success result must have 'data' property");
    }
  } else {
    if (!("error" in result)) {
      throw new Error("Failure result must have 'error' property");
    }
  }
}

/**
 * Forbidden imports for frontend API modules
 * Use with ESLint no-restricted-imports
 */
export const FORBIDDEN_IMPORTS = [
  "react",
  "react-dom",
  "react-router-dom",
  "@/components/*",
  "@/contexts/*",
  "@/hooks/*",
  "@/providers/*",
  "*.tsx",
] as const;

/**
 * ESLint configuration for frontend API
 */
export const ESLINT_CONFIG = {
  files: ["src/lib/frontend-api/**/*.ts"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [...FORBIDDEN_IMPORTS],
        message:
          "Frontend API modules must not import React, components, or UI code. " +
          "APIs are pure domain contracts and must remain UI-agnostic.",
      },
    ],
    "no-console": [
      "error",
      {
        allow: ["error", "warn"],
      },
    ],
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        allowExpressions: false,
      },
    ],
  },
};

/**
 * Type-only import checker for build-time validation
 */
type AssertNoReactTypes<T> = T extends { React: unknown }
  ? "ERROR: Frontend API cannot depend on React types"
  : T;

/**
 * Test helper: validate entire API module
 */
export async function validateApiModule<T extends Record<string, unknown>>(
  module: T,
  moduleName: string
): Promise<void> {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(module)) {
    // Check if export is a function
    if (typeof value !== "function") {
      errors.push(`${moduleName}.${key} is not a function`);
      continue;
    }

    // Check if function is async
    if (value.constructor.name !== "AsyncFunction") {
      errors.push(`${moduleName}.${key} is not async`);
      continue;
    }

    // Note: Can't validate return type at runtime without calling
    // Use TypeScript compiler for that
  }

  if (errors.length > 0) {
    throw new Error(
      `Frontend API validation failed for ${moduleName}:\n${errors.join("\n")}`
    );
  }
}

/**
 * Example test usage:
 * ```typescript
 * import { casesApi } from '@/lib/frontend-api/cases';
 * import { validateApiModule, assertReturnsResult } from '@/lib/frontend-api/governance';
 *
 * describe('Cases API Governance', () => {
 *   it('should be a valid API module', async () => {
 *     await validateApiModule(casesApi, 'casesApi');
 *   });
 *
 *   it('should return Result<T>', async () => {
 *     const result = await casesApi.getAll();
 *     assertReturnsResult(result);
 *   });
 * });
 * ```
 */
