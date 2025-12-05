
import { CommunicationItem, ServiceJob } from '../../types';
import { db, STORES } from '../db';

export const CorrespondenceService = {
    getCommunications: async () => db.getAll<CommunicationItem>(STORES.COMMUNICATIONS),
    getServiceJobs: async () => db.getAll<ServiceJob>(STORES.SERVICE_JOBS),
    addCommunication: async (item: CommunicationItem) => db.put(STORES.COMMUNICATIONS, { ...item, id: item.id || crypto.randomUUID() }),
    addServiceJob: async (job: ServiceJob) => db.put(STORES.SERVICE_JOBS, { ...job, id: job.id || crypto.randomUUID() }),
    archive: async (id: string) => { console.log(`[API] Archived correspondence ${id}`); }
};
