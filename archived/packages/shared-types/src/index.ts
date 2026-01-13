/**
 * @lexiflow/shared-types
 *
 * Comprehensive TypeScript type definitions for LexiFlow
 * Ensures type safety across frontend and backend applications
 *
 * Features:
 * - Strict discriminated unions for state management
 * - Comprehensive API response types
 * - Advanced utility types
 * - Type-safe validation patterns
 * - Result/Either monads for functional error handling
 * - Event and messaging types for real-time features
 * - Builder and mapper patterns
 * - Runtime type guards and validators
 *
 * @packageDocumentation
 */

// ============================================================================
// Common Types
// ============================================================================
// Includes: utility types, API enhancements, state management,
// type guards, Result/Either, events, builders, mappers, validation
export * from './common';

// ============================================================================
// Entities
// ============================================================================
// Base entity types and branded IDs for type safety
export * from './entities';

// ============================================================================
// Enums
// ============================================================================
// Shared enumerations for domain models
export * from './enums';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================
// Request/response types for API communication
export * from './dto';

// ============================================================================
// Interfaces
// ============================================================================
// Domain-specific interfaces (auth, etc.)
export * from './interfaces';

/**
 * Package version
 */
export const SHARED_TYPES_VERSION = '2.0.0';
