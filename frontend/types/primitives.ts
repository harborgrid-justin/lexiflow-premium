// types/primitives.ts
// Domain Primitives & Value Objects

import { CurrencyCode } from './enums';

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
export type MatterId = Brand<string, 'MatterId'>;

export interface Money {
  amount: number;
  currency: CurrencyCode;
  precision: number;
}

export interface JurisdictionObject {
  country: string;
  state: string;
  courtLevel: 'Federal' | 'State' | 'Appellate' | 'Supreme';
  division?: string;
  county?: string;
}

export interface BaseEntity {
  id: string;
  createdAt?: string; // ISO 8601 date string from backend Date
  updatedAt?: string; // ISO 8601 date string from backend Date
  deletedAt?: string; // ISO 8601 date string from backend Date (soft delete)
  createdBy?: UserId;
  updatedBy?: UserId;
  version?: number;
  isEncrypted?: boolean;
}
