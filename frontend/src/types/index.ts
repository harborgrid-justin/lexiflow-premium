/**
 * Types Barrel
 *
 * NOTE:
 * - `@/types` is widely imported across the frontend.
 * - Many domain/type modules live under `src/types/`.
 *
 * This file intentionally re-exports the canonical definitions used across the
 * codebase. Avoid exporting `./shared` because it contains legacy duplicate
 * names (e.g. `BaseEntity`, `PaginationParams`) that conflict with newer
 * canonical definitions in `./primitives`, `./financial`, etc.
 */

export * from "./enums";
export * from "./errors";
export * from "./primitives";
export * from "./result";

// Core/domain types
export * from "./analytics";
// `analytics-enterprise` overlaps with `analytics` and `dashboard`.
// Import from `@/types/analytics-enterprise` directly when needed.
export * from "./api-responses";
export * from "./auth";
export * from "./billing-rate";
export * from "./bluebook";
export * from "./case";
export * from "./communications";
export * from "./compliance-risk";
export * from "./crm";
// `crm-additions` overlaps with `crm`.
// Import from `@/types/crm-additions` directly when needed.
export * from "./dashboard";
export * from "./data-infrastructure";
export * from "./data-quality";
export * from "./discovery";
// `discovery-enhanced` overlaps with other domains.
// Import from `@/types/discovery-enhanced` directly when needed.
export * from "./case-team";
export * from "./documents";
export * from "./dto";
export * from "./dto-types";
export * from "./evidence";
export * from "./filters";
export * from "./financial";
export * from "./integration-types";
export * from "./legal-research";
export * from "./messaging";
export { CalendarEventType } from "./misc";
export type { CasePhase, LegalEntity, ServiceJob, StaffMember } from "./misc";
export * from "./motion-docket";
export * from "./notifications";
export * from "./pacer";
export * from "./parser";
export * from "./pleading-types";
export * from "./pleadings";
export * from "./query-keys";
export * from "./search";
export * from "./statistics";
export * from "./system";
export * from "./trial";
export * from "./trust-accounts";
export * from "./type-mappings";
export * from "./workflow";
export * from "./workflow-advanced-types";
export * from "./workflow-types";
