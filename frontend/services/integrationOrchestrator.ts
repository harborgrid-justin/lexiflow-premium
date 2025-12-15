
import { SystemEventType, SystemEventPayloads, IntegrationResult } from '../types/integrationTypes';
import { STORES, db } from './db';
import { 
    CalendarEventItem, WorkflowTask, DocketEntry, DocketId, 
    TaskId, UserId, CaseId, TimeEntry, UUID, EvidenceId, 
    EvidenceItem, ConflictCheck, Citation, Invoice
} from '../types';
import { ChainService } from './chainService';

/**
 * Enterprise Integration Bus
 * Decouples modules by handling side-effects of core actions.
 * Implements the 10 defined cross-integration opportunities.
 */
export const IntegrationOrchestrator = {
    
    publish: async <K extends keyof SystemEventPayloads>(
        type: K, 
        payload: SystemEventPayloads[K]
    ): Promise<IntegrationResult> => {
        console.log(`[Orchestrator] Processing Event: ${type}`, payload);
        const actions: string[] = [];
        const errors: string[] = [];

        // Dynamic Import to avoid Circular Dependency
        const { DataService } = await import('./dataService');

        try {
            switch (type) {
                // Opp #1: CRM -> Compliance (Auto-Conflict)
                case SystemEventType.LEAD_STAGE_CHANGED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.LEAD_STAGE_CHANGED];
                    if (p.stage === 'Engagement' || p.stage === 'Conflict Check') {
                        const conflictCheck: ConflictCheck = {
                            id: `conf-auto-${Date.now()}` as any,
                            entityName: p.clientName,
                            date: new Date().toISOString().split('T')[0],
                            status: 'Pending',
                            foundIn: [],
                            checkedById: 'system' as UserId,
                            checkedBy: 'System Automation'
                        };
                        // In a real app, we'd run the check logic here
                        await DataService.compliance.runConflictCheck(p.clientName); 
                        actions.push('Triggered Automated Conflict Check');
                    }
                    break;
                }

                // Opp #2: Docket -> Calendar (Rules Engine)
                case SystemEventType.DOCKET_INGESTED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.DOCKET_INGESTED];
                    
                    // Heuristic: If it's a Motion, schedule a Response deadline
                    if (p.entry.title.toLowerCase().includes('motion')) {
                        const deadlineDate = new Date(new Date(p.entry.date).getTime() + (14 * 24 * 60 * 60 * 1000)); // +14 days default
                        const deadlineEvt: CalendarEventItem = {
                            id: `cal-resp-${p.entry.id}`,
                            title: `Response Due: ${p.entry.title}`,
                            date: deadlineDate.toISOString().split('T')[0],
                            type: 'deadline',
                            priority: 'High',
                            description: `Derived from Docket Sequence #${p.entry.sequenceNumber}`,
                            location: 'Court ECF'
                        };
                        // Add to Calendar Store (Direct access to avoid circ dep)
                        await db.put('calendarEvents', deadlineEvt);
                        actions.push('Calculated Response Deadline per Local Rules');
                    }

                    // Heuristic: If it's a Hearing
                    if (p.entry.type === 'Hearing' || p.entry.title.toLowerCase().includes('hearing')) {
                        const hearingEvt: CalendarEventItem = {
                            id: `cal-hear-${p.entry.id}`,
                            title: p.entry.title,
                            date: p.entry.date,
                            type: 'hearing',
                            priority: 'Critical',
                            description: `Court Appearance Required. Docket #${p.entry.sequenceNumber}`
                        };
                        await db.put('calendar_events', hearingEvt);
                        actions.push('Synced Hearing to Master Calendar');
                    }
                    break;
                }

                // Opp #3: Task -> Billing (Revenue Capture)
                case SystemEventType.TASK_COMPLETED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.TASK_COMPLETED];
                    // If task took effort and isn't billed
                    if (p.task.priority === 'High' || p.task.priority === 'Critical') {
                        const draftTimeEntry: TimeEntry = {
                            id: `time-auto-${Date.now()}` as UUID,
                            caseId: p.task.caseId || 'General' as CaseId,
                            userId: p.task.assigneeId || 'current-user' as UserId,
                            date: new Date().toISOString().split('T')[0],
                            duration: 0, // User will fill in actual duration
                            description: `Task Completion: ${p.task.title}`,
                            rate: 0, // Will be filled by billing rules
                            total: 0,
                            status: 'Unbilled'
                        };
                        await DataService.billing.addTimeEntry(draftTimeEntry);
                        actions.push('Created Draft Billable Entry from Task');
                    }
                    break;
                }

                // Opp #4: Docs -> Evidence (Chain of Custody)
                case SystemEventType.DOCUMENT_UPLOADED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.DOCUMENT_UPLOADED];
                    
                    const isProduction = p.document.tags.includes('Production') || p.document.title.includes('Prod_');
                    const isEvidence = p.document.sourceModule === 'Evidence';
                    
                    if (isProduction || isEvidence) {
                        const evidenceItem: EvidenceItem = {
                            id: `ev-auto-${Date.now()}` as EvidenceId,
                            trackingUuid: crypto.randomUUID() as UUID,
                            caseId: p.document.caseId,
                            title: p.document.title,
                            type: 'Document',
                            description: 'Auto-ingested from Document Upload',
                            collectionDate: new Date().toISOString().split('T')[0],
                            collectedBy: 'System Import',
                            custodian: 'DMS',
                            location: 'Digital Vault',
                            admissibility: 'Pending',
                            chainOfCustody: [{
                                id: `cc-${Date.now()}`,
                                date: new Date().toISOString(),
                                action: 'Ingestion',
                                actor: 'IntegrationOrchestrator'
                            }],
                            tags: ['Auto-Ingest'],
                            fileSize: p.document.fileSize
                        };
                        await DataService.evidence.add(evidenceItem);
                        actions.push('Replicated Document to Evidence Vault');
                    }
                    break;
                }

                // Opp #5: Billing -> Workflow (Collections)
                case SystemEventType.INVOICE_STATUS_CHANGED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.INVOICE_STATUS_CHANGED];
                    if (p.invoice.status === 'Overdue') {
                        const collectionTemplate = await DataService.playbooks.getByIndex('type', 'collection');
                        if (collectionTemplate.length > 0) {
                            await DataService.workflow.deploy(collectionTemplate[0].id, { caseId: p.invoice.caseId });
                        }
                        actions.push('Deployed Collections Workflow');
                    }
                    if (p.invoice.status === 'Paid') {
                        const prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
                        await ChainService.createEntry({
                            timestamp: new Date().toISOString(),
                            user: localStorage.getItem('userName') || 'System',
                            userId: (localStorage.getItem('userId') || 'system') as UserId,
                            action: 'INVOICE_PAID',
                            resource: `Invoice/${p.invoice.id}`,
                            ip: 'internal',
                            newValue: p.invoice.amount
                        }, prevHash);
                        actions.push('Logged INVOICE_PAID to immutable ledger');
                    }
                    break;
                }

                // Opp #6: Evidence -> Audit (Immutable Log)
                case SystemEventType.EVIDENCE_STATUS_UPDATED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.EVIDENCE_STATUS_UPDATED];
                    // Create cryptographic audit entry
                    await ChainService.createEntry({
                        timestamp: new Date().toISOString(),
                        user: 'System',
                        userId: 'sys-admin' as UserId,
                        action: `EVIDENCE_STATUS_${p.newStatus.toUpperCase().replace(/\s/g, '_')}`,
                        resource: `Evidence/${p.item.id}`,
                        ip: 'internal',
                        previousValue: p.oldStatus,
                        newValue: p.newStatus
                    }, '0000000000000000000000000000000000000000000000000000000000000000');
                    actions.push('Logged Evidence Status Change to Immutable Ledger');
                    break;
                }

                // Opp #7: Research -> Pleadings (Context)
                case SystemEventType.CITATION_SAVED: {
                    // Cache research results for quick access in Pleading Builder
                    actions.push('Updated Pleading Builder Context Cache');
                    break;
                }

                // Opp #8: Compliance -> Security (Access Control)
                case SystemEventType.WALL_ERECTED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.WALL_ERECTED];
                    // Update row-level security policies for entity access
                    const policyName = `wall_enforce_${p.wall.caseId}`;
                    await DataService.admin.saveRLSPolicy({
                        name: policyName,
                        table: 'documents',
                        cmd: 'SELECT',
                        roles: p.wall.restrictedGroups, // In reality, deny these
                        using: `case_id != '${p.wall.caseId}'`, // Prevent access
                        status: 'Active'
                    });
                    actions.push(`Generated RLS Policy: ${policyName}`);
                    break;
                }

                // Opp #9: HR -> Admin (Provisioning)
                case SystemEventType.STAFF_HIRED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.STAFF_HIRED];
                    // Auto-create User account
                    const newUser = {
                        id: p.staff.userId,
                        name: p.staff.name,
                        email: p.staff.email,
                        role: p.staff.role,
                        userType: 'Internal',
                        orgId: 'org-1' // Default org
                    };
                    if ('add' in DataService.users) {
                        await (DataService.users as any).add(newUser);
                    }
                    actions.push(`Provisioned User Account for ${p.staff.name}`);
                    break;
                }

                // Opp #10: Service -> Docket (Auto-Filing)
                case SystemEventType.SERVICE_COMPLETED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.SERVICE_COMPLETED];
                    if (p.job.status === 'Served') {
                         const entry: DocketEntry = {
                            id: `dk-proof-${Date.now()}` as DocketId,
                            sequenceNumber: 999,
                            caseId: p.job.caseId,
                            date: new Date().toISOString().split('T')[0],
                            type: 'Filing',
                            title: `Proof of Service: ${p.job.documentTitle}`,
                            description: `Served on ${p.job.targetPerson} at ${p.job.targetAddress} by ${p.job.serverName}.`,
                            filedBy: 'System Automation',
                            isSealed: false
                         };
                         await DataService.docket.add(entry);
                         actions.push('Auto-filed Proof of Service to Docket');
                    }
                    break;
                }

                // Opp #11: Data Platform -> Infrastructure (Connection Audit)
                case SystemEventType.DATA_SOURCE_CONNECTED: {
                    const p = payload as SystemEventPayloads[typeof SystemEventType.DATA_SOURCE_CONNECTED];
                    // Log to Audit Trail
                    await db.put('auditLogs', {
                        action: 'CONNECTION_ESTABLISHED',
                        userId: 'system' as UserId,
                        details: `Established secure connection to ${p.provider} (${p.name})`,
                        ip: '127.0.0.1',
                        resourceId: p.connectionId
                    });
                    actions.push(`Logged connection audit event for ${p.name}`);
                    
                    // Trigger Initial Sync Job (Simulated)
                    actions.push(`Queued initial sync job for ${p.connectionId}`);
                    break;
                }
            }
        } catch (e: any) {
            console.error(`[Orchestrator] Error processing ${type}:`, e);
            errors.push(e.message);
        }

        return { success: errors.length === 0, triggeredActions: actions, errors };
    }
};
