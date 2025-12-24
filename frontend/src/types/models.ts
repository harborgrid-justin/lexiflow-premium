// types/models.ts
// Main type definitions barrel export - Re-exports from domain-specific files for backward compatibility

// Re-export primitives & base types
export * from './primitives';

// Re-export system & infrastructure types
export * from './system';

// Re-export data platform types
export * from './data-infrastructure';
export * from './data-quality';

// Re-export case & litigation types
export * from './case';

// Re-export financial & billing types
export * from './financial';

// Re-export documents & discovery types
export * from './documents';

// Re-export trial & strategy types
export * from './trial';

// Re-export workflow & automation types
export * from './workflow';

// Re-export domain-specific legacy types
export * from './motion-docket';
export * from './evidence';
export * from './legal-research';
export * from './discovery';
export * from './pleadings';
export * from './compliance-risk';
export * from './misc';
