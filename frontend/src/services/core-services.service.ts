/**
 * Core Infrastructure Services Barrel Export
 * 
 * Core data layer, repositories, and infrastructure.
 * Import from '@/services/core' for better tree-shaking.
 */

// Core Infrastructure
export * from './core/Repository';
export * from './core/microORM';
export * from './core/RepositoryFactory';
export * from './core/errors';

// Storage & Window Adapters
export * from './infrastructure/adapters/StorageAdapter';
export * from './infrastructure/adapters/WindowAdapter';

// Data Layer
export * from './data/dataService';
export * from './data/db';
export * from './data/dbSeeder';
export * from './data/syncEngine';

// Query Infrastructure
export * from './infrastructure/queryClient';
export * from './infrastructure/queryKeys';
