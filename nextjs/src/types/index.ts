// index.ts - Main types barrel export
// Alphabetically sorted to prevent duplicates

export * from "./intelligence";
export * from "./analytics";
export * from "./api-responses";
export * from "./auth";
export * from "./bluebook";
export * from "./canvas-constants";
export * from "./case";
export * from "./case-team";
export * from "./compliance-risk";
export * from "./dashboard";
export * from "./data-infrastructure";
export * from "./data-quality";
export * from "./discovery";
export * from "./documents";
export * from "./dto";
export * from "./dto-types";
export * from "./enums";
export * from "./errors";
export * from "./evidence";
export * from "./filters";
export * from "./financial";
export * from "./integration-types";
export * from "./legal-research";
export * from "./misc";
export * from "./motion-docket";
export * from "./notifications";
export * from "./pacer";
export * from "./parser";
export * from "./pleading-types";
export * from "./pleadings";
export * from "./primitives";
export * from "./query-keys";
export * from "./result";
export * from "./search";
export * from "./statistics";
export * from "./system";
export * from "./trial";
export * from "./trust-accounts";
export * from "./type-mappings";
export * from "./workflow";
export * from "./workflow-types";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
// Force TS re-eval
