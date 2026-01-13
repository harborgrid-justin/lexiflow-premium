/**
 * Base entity interface that works for both frontend and backend
 *
 * Backend: TypeORM entities extend this interface (Date fields are serialized to ISO strings)
 * Frontend: Plain objects implement this interface (dates stored as ISO strings)
 */
export interface BaseEntity {
  /**
   * Unique identifier (UUID v4)
   */
  id: string;

  /**
   * ISO 8601 timestamp of creation
   * Backend: Date object serialized to string
   * Frontend: ISO string
   */
  createdAt: string;

  /**
   * ISO 8601 timestamp of last update
   * Backend: Date object serialized to string
   * Frontend: ISO string
   */
  updatedAt: string;

  /**
   * ISO 8601 timestamp of soft deletion (optional)
   * Backend: Date object serialized to string
   * Frontend: ISO string
   */
  deletedAt?: string;

  /**
   * User ID who created this entity
   */
  createdBy?: string;

  /**
   * User ID who last updated this entity
   */
  updatedBy?: string;
}

/**
 * Frontend-specific extension with version tracking
 */
export interface BaseEntityWithVersion extends BaseEntity {
  version?: number;
  isEncrypted?: boolean;
}

/**
 * Brand types for type-safe IDs
 */
export type Brand<K, T> = K & { readonly __brand: T };
export type UUID = Brand<string, 'UUID'>;
export type CaseId = Brand<string, 'CaseId'>;
export type UserId = Brand<string, 'UserId'>;
export type OrgId = Brand<string, 'OrgId'>;
export type GroupId = Brand<string, 'GroupId'>;
export type DocumentId = Brand<string, 'DocumentId'>;
export type EvidenceId = Brand<string, 'EvidenceId'>;
export type TaskId = Brand<string, 'TaskId'>;
export type EntityId = Brand<string, 'EntityId'>;
export type PartyId = Brand<string, 'PartyId'>;
export type MotionId = Brand<string, 'MotionId'>;
export type DocketId = Brand<string, 'DocketId'>;
export type ProjectId = Brand<string, 'ProjectId'>;
export type WorkflowTemplateId = Brand<string, 'WorkflowTemplateId'>;
export type InvoiceId = Brand<string, 'InvoiceId'>;
export type ClientId = Brand<string, 'ClientId'>;
