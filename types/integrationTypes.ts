// types/integrationTypes.ts

import { 
    Case, WorkflowTask, DocketEntry, LegalDocument, 
    TimeEntry, EvidenceItem, LegalEntity, ServiceJob,
    Risk, Invoice, Citation, StaffMember, EthicalWall
} from './models';

export enum SystemEventType {
    // Core Lifecycle
    CASE_CREATED = 'CASE_CREATED',
    
    // Opp #1: CRM -> Compliance
    LEAD_STAGE_CHANGED = 'LEAD_STAGE_CHANGED',
    
    // Opp #2: Docket -> Calendar
    DOCKET_INGESTED = 'DOCKET_INGESTED',
    
    // Opp #3: Task -> Billing
    TASK_COMPLETED = 'TASK_COMPLETED',
    
    // Opp #4: Doc -> Evidence
    DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
    
    // Opp #5: Billing -> Workflow
    INVOICE_STATUS_CHANGED = 'INVOICE_STATUS_CHANGED',

    // Opp #6: Evidence -> Audit
    EVIDENCE_STATUS_UPDATED = 'EVIDENCE_STATUS_UPDATED',
    
    // Opp #7: Research -> Pleading
    CITATION_SAVED = 'CITATION_SAVED',

    // Opp #8: Compliance -> Security
    WALL_ERECTED = 'WALL_ERECTED',

    // Opp #9: HR -> Admin
    STAFF_HIRED = 'STAFF_HIRED',

    // Opp #10: Service -> Docket
    SERVICE_COMPLETED = 'SERVICE_COMPLETED',
    
    // Misc
    RISK_ESCALATED = 'RISK_ESCALATED',
    TIME_LOGGED = 'TIME_LOGGED',
    ENTITY_CREATED = 'ENTITY_CREATED'
}

export interface SystemEventPayloads {
    [SystemEventType.CASE_CREATED]: { caseData: Case };
    
    // Opp #1
    [SystemEventType.LEAD_STAGE_CHANGED]: { leadId: string; stage: string; clientName: string; value: string };
    
    // Opp #2
    [SystemEventType.DOCKET_INGESTED]: { entry: DocketEntry; caseId: string };
    
    // Opp #3
    [SystemEventType.TASK_COMPLETED]: { task: WorkflowTask };
    
    // Opp #4
    [SystemEventType.DOCUMENT_UPLOADED]: { document: LegalDocument };
    
    // Opp #5
    [SystemEventType.INVOICE_STATUS_CHANGED]: { invoice: Invoice };
    
    // Opp #6
    [SystemEventType.EVIDENCE_STATUS_UPDATED]: { item: EvidenceItem; oldStatus: string; newStatus: string };

    // Opp #7
    [SystemEventType.CITATION_SAVED]: { citation: Citation; queryContext: string };

    // Opp #8
    [SystemEventType.WALL_ERECTED]: { wall: EthicalWall };

    // Opp #9
    [SystemEventType.STAFF_HIRED]: { staff: StaffMember };

    // Opp #10
    [SystemEventType.SERVICE_COMPLETED]: { job: ServiceJob };

    // Misc
    [SystemEventType.RISK_ESCALATED]: { risk: Risk };
    [SystemEventType.TIME_LOGGED]: { entry: TimeEntry };
    [SystemEventType.ENTITY_CREATED]: { entity: LegalEntity };
}

export interface IntegrationResult {
    success: boolean;
    triggeredActions: string[];
    errors?: string[];
}
