import { CommunicationItem, ServiceJob } from '../../types';
import { db, STORES } from '../db';
import { IntegrationOrchestrator } from '../integrationOrchestrator';
import { SystemEventType } from '../../types/integrationTypes';
// FIX: Add missing imports
import { DocketEntry, DocketId } from '../../types';

export const CorrespondenceService = {
    getCommunications: async () => db.getAll<CommunicationItem>(STORES.COMMUNICATIONS),
    getServiceJobs: async () => db.getAll<ServiceJob>(STORES.SERVICE_JOBS),
    addCommunication: async (item: CommunicationItem) => db.put(STORES.COMMUNICATIONS, { ...item, id: item.id || crypto.randomUUID() }),
    addServiceJob: async (job: ServiceJob) => db.put(STORES.SERVICE_JOBS, { ...job, id: job.id || crypto.randomUUID() }),
    updateServiceJob: async (id: string, updates: Partial<ServiceJob>) => {
        const job = await db.get<ServiceJob>(STORES.SERVICE_JOBS, id);
        if (!job) throw new Error("Job not found");
        const updated = { ...job, ...updates };
        await db.put(STORES.SERVICE_JOBS, updated);
        if (updates.status === 'Served' && job.status !== 'Served') {
            IntegrationOrchestrator.publish(SystemEventType.SERVICE_COMPLETED, { job: updated });
        }
        return updated;
    },
    archive: async (id: string) => { console.log(`[API] Archived correspondence ${id}`); }
};