/**
 * Shared Library - Generic Utilities
 *
 * Business-agnostic utility functions for common operations.
 * These should have zero dependencies on domain logic.
 *
 * @module shared/lib
 */

// Class name utilities
export * from "./cn";

// Date/time utilities
export * from "./dateUtils";
export * from "./formatDate";

// String utilities
export * from "./formatUtils";
export * from "./stringUtils";

// ID generation
export * from "./idGenerator";

// Validation & sanitization
export * from "./sanitize";
export * from "./validation";

// Immutability utilities
export * from "./immutability";

// General utilities
// export * from "./utils"; // Avoid duplicate export of cn
