/**
 * Migration helper file for backend
 * Re-exports types from @lexiflow/shared-types
 *
 * This file allows the backend to start using shared types alongside TypeORM decorators.
 * The shared types provide the interface contract, while TypeORM entities extend them.
 */

// Re-export all shared types
export * from '@lexiflow/shared-types';

/**
 * Helper type for converting shared entity interfaces to TypeORM entities
 * TypeORM entities will:
 * 1. Implement the shared interface
 * 2. Add TypeORM decorators (@Entity, @Column, etc.)
 * 3. Use Date objects internally (automatically converted to ISO strings in responses)
 */
export type TypeORMEntity<T> = T & {
  // TypeORM entities can have Date objects that get serialized to strings
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};
