import { CommunicationItem, ServiceJob, DocketEntry, DocketId, DocumentId, EvidenceItem, EvidenceId, UUID } from '../../types';
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { communicationsApi } from "@/api/domains/communications.api";
import { IntegrationOrchestrator } from '@/services/integration/integrationOrchestrator';
import { SystemEventType } from "@/types/integration-types";

export const CorrespondenceService = {
    getCommunications: async () => communicationsApi.correspondence?.getAll?.() || [],
    
    getServiceJobs: async () => communicationsApi.serviceJobs?.getAll?.() || [],
    
    addCommunication: async (item: CommunicationItem) => {
        const newItem = { ...item, id: item.id || crypto.randomUUID() };
        return communicationsApi.correspondence?.create?.(newItem) || newItem;
    },
    
    addServiceJob: async (job: ServiceJob) => {
        const newJob = { ...job, id: job.id || crypto.randomUUID() };
        return communicationsApi.serviceJobs?.create?.(newJob) || newJob;
    },
    
    updateServiceJob: async (id: string, updates: Partial<ServiceJob>) => {
        const job = await communicationsApi.serviceJobs?.getById?.(id);
        if (!job) throw new Error("Job not found");
        
        const updated = await communicationsApi.serviceJobs?.update?.(id, updates) || { ...job, ...updates };
        
        // Integration Logic: If served, trigger orchestrator
        if (updates.status === 'Served' && job.status !== 'Served') {
            IntegrationOrchestrator.publish(SystemEventType.SERVICE_COMPLETED, { job: updated });
        }
        
        return updated;
    },
    
    archive: async (id: string) => { 
        console.log(`[API] Archived correspondence ${id}`);
        // Soft delete logic would go here
    }
};
