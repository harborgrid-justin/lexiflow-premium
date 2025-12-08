import { SystemEventType, SystemEventPayloads, IntegrationResult } from '../types/integrationTypes';
import { DataService } from './dataService';
import { STORES, db } from './db';
// FIX: Add missing imports
import { CalendarEventItem, WorkflowTask, TimeEntry, Invoice, AuditLogEntry, UserId, CaseId, UUID, DocketId, TaskId, DocketEntry } from '../types';

/**
 * Enterprise Integration Bus
 * Decouples modules by handling side-effects of core actions.
 */
export const IntegrationOrchestrator = {
    
    /**
     * Publish an event to the system.
     * This is the entry point for all cross-module coordination.
     */
    publish: async <K extends keyof SystemEventPayloads>(
        type: K, 
        payload: SystemEventPayloads[K]
    ): Promise<IntegrationResult> => {
        console.log(`[Orchestrator] Processing Event: ${type}`, payload);
        const actions: string[] = [];
        const errors: string[] = [];

        try {
            switch (type) {
                case SystemEventType.CASE_CREATED:
                    // Opp #1: Case -> Finance (Auto-create Billing Ledger)
                    await DataService.billing.createInvoice(
                        'Retainer', 
                        (payload as SystemEventPayloads[typeof SystemEventType.CASE_CREATED]).caseData.id, 
                        []
                    );
                    actions.push('Initialized Billing Ledger');
                    
                    // Opp #14: Enforcement (Litigation Hold)
                    // (Mocking a method call to compliance)
                    actions.push('Issued Litigation Hold');
                    break;

                case SystemEventType.DOCKET_INGESTED:
                    const docketPayload = payload as SystemEventPayloads[typeof SystemEventType.DOCKET_INGESTED];
                    // Opp #2: Docket -> Calendar
                    if (docketPayload.entry.type === 'Hearing' || docketPayload.entry.description?.toLowerCase().includes('deadline')) {
                        const evt: CalendarEventItem = {
                            id: `cal-${Date.now()}`,
                            title: docketPayload.entry.title,
                            date: docketPayload.entry.date,
                            type: 'hearing',
                            priority: 'High',
                            description: `Derived from Docket Sequence #${docketPayload.entry.sequenceNumber}`
                        };
                        // Direct DB access to avoid circular dependency if CalendarService calls this
                        await db.put('calendar_events', evt); // Assuming store exists or handled by DataService
                        actions.push('Synced to Master Calendar');
                    }
                    
                    // Opp #11: Docket -> Rules (Calculate Deadlines)
                    if (docketPayload.entry.type === 'Motion') {
                        // Create Task
                        const task: WorkflowTask = {
                            id: `t-auto-${Date.now()}` as TaskId,
                            title: `Respond to ${docketPayload.entry.title}`,
                            status: 'Pending',
                            priority: 'High',
                            assignee: 'System',
                            dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], // +14 days
                            caseId: docketPayload.entry.caseId as CaseId,
                            description: 'Auto-generated based on FRCP response deadlines.',
                            relatedModule: 'Motions',
                            relatedItemId: docketPayload.entry.id
                        };
                        await DataService.tasks.add(task);
                        actions.push('Generated Response Task');
                    }
                    break;

                case SystemEventType.DOCUMENT_UPLOADED:
                    const docPayload = payload as SystemEventPayloads[typeof SystemEventType.DOCUMENT_UPLOADED];
                    // Opp #6: Document -> Workflow
                    if (docPayload.document.title.toLowerCase().includes('motion')) {
                         const task: WorkflowTask = {
                            id: `t-rev-${Date.now()}` as TaskId,
                            title: `Review New Motion: ${docPayload.document.title}`,
                            status: 'Pending',
                            priority: 'High',
                            assignee: 'Senior Partner',
                            assigneeId: 'usr-partner-alex' as UserId,
                            dueDate: new Date().toISOString().split('T')[0],
                            caseId: docPayload.document.caseId as CaseId,
                            relatedModule: 'Documents',
                            relatedItemId: docPayload.document.id
                        };
                        await DataService.tasks.add(task);
                        actions.push('Created Review Task');
                    }
                    break;

                case SystemEventType.TIME_LOGGED:
                    const timePayload = payload as SystemEventPayloads[typeof SystemEventType.TIME_LOGGED];
                    // Opp #12: Time -> Budget
                    // Logic: Fetch case, update current spend.
                    // This is a simulation of that logic.
                    actions.push(`Updated Budget Utilization for Case ${timePayload.entry.caseId}`);
                    
                    // Opp #15: Finance -> Workflow (Threshold Check)
                    if (timePayload.entry.total > 5000) {
                         actions.push('Triggered Budget Alert Notification');
                    }
                    break;

                case SystemEventType.SERVICE_COMPLETED:
                    const servicePayload = payload as SystemEventPayloads[typeof SystemEventType.SERVICE_COMPLETED];
                    // Opp #13: Service -> Docket
                    if (servicePayload.job.status === 'Served') {
                         const entry: DocketEntry = {
                            id: `dk-proof-${Date.now()}` as DocketId,
                            sequenceNumber: 999,
                            caseId: servicePayload.job.caseId,
                            date: new Date().toISOString().split('T')[0],
                            type: 'Filing',
                            title: `Proof of Service: ${servicePayload.job.documentTitle}`,
                            description: `Served on ${servicePayload.job.targetPerson}`,
                            filedBy: servicePayload.job.serverName
                         };
                         await DataService.docket.add(entry);
                         actions.push('Auto-filed Proof of Service');
                    }
                    break;
                
                case SystemEventType.ENTITY_CREATED:
                    const entityPayload = payload as SystemEventPayloads[typeof SystemEventType.ENTITY_CREATED];
                    // Opp #5: Entity -> Conflicts
                    // Trigger async background conflict check
                    actions.push(`Queued Conflict Check for ${entityPayload.entity.name}`);
                    break;
            }
        } catch (e: any) {
            console.error(`[Orchestrator] Error processing ${type}:`, e);
            errors.push(e.message);
        }

        return { success: errors.length === 0, triggeredActions: actions, errors };
    }
};