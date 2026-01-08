// types/models.ts
// Main type definitions barrel export - Re-exports from domain-specific files for backward compatibility

// Re-export primitives & base types
export * from "./primitives";

// Re-export auth & security types
export * from "./auth";

// Re-export system & infrastructure types
export * from "./system";

// Re-export data platform types
export * from "./data-infrastructure";
export * from "./data-quality";

// Re-export case & litigation types
export * from "./case";
export * from "./case-team";

// Re-export statistics & analytics
export * from "./statistics";

// Re-export DTOs
export * from "./dto";

// Re-export financial & billing types
export * from "./financial";
export * from "./trust-accounts";

// Re-export documents & discovery types
export * from "./documents";

// Re-export trial & strategy types
export * from "./trial";

// Re-export workflow & automation types
export * from "./workflow";

// Re-export domain-specific legacy types
export * from "./compliance-risk";
export * from "./discovery";

// Export discovery-enhanced types explicitly to avoid conflicts with documents.ts and misc.ts
export type {
  AnalyticsJob,
  ConceptCluster,
  CustodianAcknowledgment,
  DataCollection,
  DocumentReview,
  EmailThread,
  HoldRelease,
  LegalHold,
  LegalHoldNotice,
  PrivilegeLog,
  ProcessingJob as ProcessingJobEnhanced,
  ProductionDelivery,
  ProductionSet as ProductionSetEnhanced,
  ProductionSpecification,
  ReviewDecision,
  ReviewProject,
  ReviewWorkspace,
  SavedSearch,
  SearchQuery,
} from "./discovery-enhanced";

export * from "./evidence";
export * from "./legal-research";
export * from "./misc";
export * from "./motion-docket";
export * from "./pleadings";
