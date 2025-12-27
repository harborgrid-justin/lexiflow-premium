import { CommunicationItem, ServiceJob, DocketEntry, DocketId, DocumentId, EvidenceItem, EvidenceId, UUID } from '@/types';
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { communicationsApi } from "@/api/domains/communications.api";
import { IntegrationEventPublisher } from '@/services/data/integration/IntegrationEventPublisher';
import { SystemEventType } from "@/types/integration-types";

export const CorrespondenceService = {
    getCommunications: async () => communicationsApi.correspondence?.getAll?.() || [],

    getServiceJobs: async (): Promise<ServiceJob[]> => {
        // Note: serviceJobs API is not yet available in communicationsApi
        // This will need to be updated when the API is added
        // console.warn('[CorrespondenceService.getServiceJobs] Service jobs API not yet available');
        return [];
    },

    addCommunication: async (item: CommunicationItem) => {
        const newItem = { ...item, id: item.id || crypto.randomUUID() };
        // Convert CommunicationItem to Correspondence format
        const correspondence = {
            id: newItem.id,
            caseId: newItem.caseId,
            correspondenceType: 'email' as const,
            subject: newItem.subject,
            sender: newItem.sender,
            recipients: [newItem.recipient],
            date: newItem.date,
            status: 'sent' as const,
        };
        return communicationsApi.correspondence?.create?.(correspondence) || correspondence;
    },

    addServiceJob: async (job: ServiceJob): Promise<ServiceJob> => {
        const newJob = { ...job, id: job.id || crypto.randomUUID() };
        // Note: serviceJobs API is not yet available in communicationsApi
        // console.warn('[CorrespondenceService.addServiceJob] Service jobs API not yet available');
        return newJob;
    },

    updateServiceJob: async (id: string, updates: Partial<ServiceJob>): Promise<ServiceJob> => {
        // Note: serviceJobs API is not yet available in communicationsApi
        // console.warn('[CorrespondenceService.updateServiceJob] Service jobs API not yet available');

        // Mock job for type safety
        const job: ServiceJob = {
            id,
            caseId: '' as any,
            requestorId: '' as any,
            documentTitle: '',
            targetPerson: '',
            targetAddress: '',
            serverName: '',
            method: 'Personal' as any,
            status: 'DRAFT',
            dueDate: new Date().toISOString(),
            attempts: 0,
            ...updates
        };

        // Integration Logic: If served, trigger orchestrator
        if (updates.status === 'SERVED' && job.status !== 'SERVED') {
            await IntegrationEventPublisher.publish(SystemEventType.SERVICE_COMPLETED, {job});
        }

        return job;
    },

    archive: async (id: string) => {
        console.log(`[API] Archived correspondence ${id}`);
        // Soft delete logic would go here
    }
};
