import { 
    Case, WorkflowTask, DocketEntry, LegalDocument, 
    TimeEntry, EvidenceItem, LegalEntity, ServiceJob,
    Risk, Invoice
} from './models';

export enum SystemEventType {
    CASE_CREATED = 'CASE_CREATED',
    DOCKET_INGESTED = 'DOCKET_INGESTED',
    DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
    TASK_COMPLETED = 'TASK_COMPLETED',
    RISK_ESCALATED = 'RISK_ESCALATED',
    SERVICE_COMPLETED = 'SERVICE_COMPLETED',
    TIME_LOGGED = 'TIME_LOGGED',
    ENTITY_CREATED = 'ENTITY_CREATED',
    WALL_ERECTED = 'WALL_ERECTED'
}

export interface SystemEventPayloads {
    [SystemEventType.CASE_CREATED]: { caseData: Case };
    [SystemEventType.DOCKET_INGESTED]: { entry: DocketEntry; caseId: string };
    [SystemEventType.DOCUMENT_UPLOADED]: { document: LegalDocument };
    [SystemEventType.TASK_COMPLETED]: { task: WorkflowTask };
    [SystemEventType.RISK_ESCALATED]: { risk: Risk };
    [SystemEventType.SERVICE_COMPLETED]: { job: ServiceJob };
    [SystemEventType.TIME_LOGGED]: { entry: TimeEntry };
    [SystemEventType.ENTITY_CREATED]: { entity: LegalEntity };
    [SystemEventType.WALL_ERECTED]: { caseId: string; restrictedGroups: string[] };
}

export interface IntegrationResult {
    success: boolean;
    triggeredActions: string[];
    errors?: string[];
}
