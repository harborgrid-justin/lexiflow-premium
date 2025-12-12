/**
 * Unified GraphQL Queries, Mutations, and Subscriptions for LexiFlow AI Legal Suite
 */

// Export all case queries
export * from './caseQueries';

// Export all document queries
export * from './documentQueries';

// Export all user queries
export * from './userQueries';

// Export all analytics queries
export * from './analyticsQueries';

// Export all subscriptions
export * from './subscriptions';

// Re-export organized modules
export { default as caseQueries } from './caseQueries';
export { default as documentQueries } from './documentQueries';
export { default as userQueries } from './userQueries';
export { default as analyticsQueries } from './analyticsQueries';
export { default as subscriptions } from './subscriptions';
