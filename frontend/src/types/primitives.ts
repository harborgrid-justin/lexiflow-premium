// types/primitives.ts
// Domain Primitives & Value Objects

import { type CurrencyCode } from "./enums";

export type Brand<K, T> = K & { readonly __brand: T };
export type UUID = Brand<string, "UUID">;
export type CaseId = Brand<string, "CaseId">;
export type UserId = Brand<string, "UserId">;
export type OrgId = Brand<string, "OrgId">;
export type GroupId = Brand<string, "GroupId">;
export type DocumentId = Brand<string, "DocumentId">;
export type EvidenceId = Brand<string, "EvidenceId">;
export type TaskId = Brand<string, "TaskId">;
export type EntityId = Brand<string, "EntityId">;
export type PartyId = Brand<string, "PartyId">;
export type MotionId = Brand<string, "MotionId">;
export type DocketId = Brand<string, "DocketId">;
export type ProjectId = Brand<string, "ProjectId">;
export type WorkflowTemplateId = Brand<string, "WorkflowTemplateId">;
export type MatterId = Brand<string, "MatterId">;
export type ClientId = Brand<string, "ClientId">;
export type InvoiceId = Brand<string, "InvoiceId">;
export type RiskId = Brand<string, "RiskId">;
export type TemplateId = Brand<string, "TemplateId">;
export type RuleId = Brand<string, "RuleId">;
export type AnalysisId = Brand<string, "AnalysisId">;
export type JurorId = Brand<string, "JurorId">;
export type WitnessId = Brand<string, "WitnessId">;
export type ExhibitId = Brand<string, "ExhibitId">;

// EntityRole is exported from enums.ts, removing here to avoid conflict
// export type EntityRole = string;

export type SimulationResult = {
  scenarioId: string;
  expectedValue: number;
  probability: number;
  lowEstimate: number;
  highEstimate: number;
};

/**
 * Enterprise-grade JSON value types for type-safe metadata and dynamic fields
 * Ensures all JSON-serializable values are properly typed
 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Type-safe metadata record for extensible entities
 */
export type MetadataRecord = Record<string, JsonValue>;

/**
 * Money value object
 * Immutable representation of currency amounts
 * @property amount - Numeric amount in the smallest currency unit
 * @property currency - ISO 4217 currency code
 * @property precision - Decimal places for display formatting
 */
export type Money = {
  readonly amount: number;
  readonly currency: CurrencyCode;
  readonly precision: number;
};

/**
 * Jurisdiction value object
 * Represents legal jurisdiction hierarchy
 * @property country - Country code (e.g., 'US')
 * @property state - State/province code (e.g., 'CA')
 * @property courtLevel - Type of court in jurisdiction
 * @property division - Optional district/division identifier
 * @property county - Optional county identifier for local courts
 */
export type JurisdictionObject = {
  readonly country: string;
  readonly state: string;
  readonly courtLevel: "Federal" | "State" | "Appellate" | "Supreme";
  readonly division?: string;
  readonly county?: string;
};

/**
 * Base entity pattern for all domain objects
 * Provides common fields for persistence, auditing, and soft deletion
 *
 * @property id - Unique identifier (UUID v4)
 * @property createdAt - ISO 8601 timestamp of creation
 * @property updatedAt - ISO 8601 timestamp of last modification
 * @property deletedAt - ISO 8601 timestamp of soft deletion (null if active)
 * @property createdBy - User ID who created the entity
 * @property updatedBy - User ID who last modified the entity
 * @property version - Optimistic locking version number
 * @property isEncrypted - Whether entity data is encrypted at rest
 */
export type BaseEntity = {
  readonly id: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly deletedAt?: string;
  readonly createdBy?: UserId;
  readonly updatedBy?: UserId;
  readonly version?: number;
  readonly isEncrypted?: boolean;
};
