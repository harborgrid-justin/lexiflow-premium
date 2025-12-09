
import { CommunicationItem, ServiceJob, DocketEntry, DocketId, DocumentId, EvidenceItem, EvidenceId, UUID } from '../../types';
import { db, STORES } from '../db';
import { IntegrationOrchestrator } from '../integrationOrchestrator';
import { SystemEventType } from '../../types/integrationTypes';

export const CorrespondenceService = {
    getCommunications: async () => db.getAll<CommunicationItem>(STORES.COMMUNICATIONS),
    
    getServiceJobs: async () => db.getAll<ServiceJob>(STORES.SERVICE_JOBS),
    
    addCommunication: async (item: CommunicationItem) => {
        const newItem = { ...item, id: item.id || crypto.randomUUID() };
        await db.put(STORES.COMMUNICATIONS, newItem);
        return newItem;
    },
    
    addServiceJob: async (job: ServiceJob) => {
        const newJob = { ...job, id: job.id || crypto.randomUUID() };
        await db.put(STORES.SERVICE_JOBS, newJob);
        return newJob;
    },
    
    updateServiceJob: async (id: string, updates: Partial<ServiceJob>) => {
        const job = await db.get<ServiceJob>(STORES.SERVICE_JOBS, id);
        if (!job) throw new Error("Job not found");
        
        const updated = { ...job, ...updates };
        await db.put(STORES.SERVICE_JOBS, updated);
        
        // Integration Logic: If served, auto-generate docket entry and evidence
        if (updates.status === 'Served' && job.status !== 'Served') {
            const now = new Date().toISOString();
            
            // 1. Trigger Orchestrator for generic hooks
            IntegrationOrchestrator.publish(SystemEventType.SERVICE_COMPLETED, { job: updated });

            // 2. Auto-Create Evidence (Proof of Service)
            const proofId = `ev-proof-${Date.now()}` as EvidenceId;
            const evidence: EvidenceItem = {
                id: proofId,
                trackingUuid: crypto.randomUUID() as UUID,
                caseId: job.caseId,
                title: `Proof of Service: ${job.documentTitle}`,
                type: 'Document',
                description: `Automated proof of service generated for ${job.targetPerson} via ${job.method}.`,
                collectionDate: now.split('T')[0],
                collectedBy: 'System',
                custodian: 'Court Records',
                location: 'Digital Vault',
                admissibility: 'Admissible',
                tags: ['Service', 'Automated'],
                chainOfCustody: []
            };
            await db.put(STORES.EVIDENCE, evidence);

            // 3. Auto-Create Docket Entry
            const docketEntry: DocketEntry = {
                id: `dk-proof-${Date.now()}` as DocketId,
                sequenceNumber: 9999, // Next available ideally
                caseId: job.caseId,
                date: now.split('T')[0],
                type: 'Filing',
                title: `PROOF OF SERVICE Filed`,
                description: `Service executed on ${job.targetPerson} at ${job.targetAddress} by ${job.serverName}.`,
                filedBy: 'System',
                isSealed: false,
                documentId: proofId as unknown as DocumentId
            };
            await db.put(STORES.DOCKET, docketEntry);
        }
        
        return updated;
    },
    
    archive: async (id: string) => { 
        console.log(`[API] Archived correspondence ${id}`);
        // Soft delete logic would go here
    }
};
