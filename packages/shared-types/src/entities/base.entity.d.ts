export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}
export interface BaseEntityWithVersion extends BaseEntity {
    version?: number;
    isEncrypted?: boolean;
}
export type Brand<K, T> = K & {
    readonly __brand: T;
};
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
