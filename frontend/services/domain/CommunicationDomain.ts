import { CommunicationItem, ServiceJob, DocketEntry, DocketId, DocumentId, EvidenceItem, EvidenceId, UUID } from '../../types';
import { db, STORES } from '../data/db';
import { IntegrationOrchestrator } from '../integration/integrationOrchestrator';
import { SystemEventType } from "../../types/integration-types";

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
        
        // Integration Logic: If served, trigger orchestrator
        if (updates.status === 'Served' && job.status !== 'Served') {
            // Opp #10 Integration Point
            IntegrationOrchestrator.publish(SystemEventType.SERVICE_COMPLETED, { job: updated });
        }
        
        return updated;
    },
    
    archive: async (id: string) => { 
        console.log(`[API] Archived correspondence ${id}`);
        // Soft delete logic would go here
    }
};
