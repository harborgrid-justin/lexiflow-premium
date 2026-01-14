import { CommunicationItem, ServiceJob } from "@/types";
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { communicationsApi } from "@/api/domains/communications.api";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import { apiClient } from "@/services/infrastructure/apiClient";
import { SystemEventType } from "@/types/integration-types";

export const CorrespondenceService = {
  getCommunications: async () =>
    communicationsApi.correspondence?.getAll?.() || [],

  getServiceJobs: async (): Promise<ServiceJob[]> => {
    try {
      return await apiClient.get<ServiceJob[]>("/service-jobs");
    } catch (e) {
      console.warn("Failed to fetch service jobs", e);
      return [];
    }
  },

  addCommunication: async (item: CommunicationItem) => {
    const newItem = { ...item, id: item.id || crypto.randomUUID() };
    // Convert CommunicationItem to Correspondence format
    const correspondence = {
      id: newItem.id,
      caseId: newItem.caseId,
      correspondenceType: "email" as const,
      subject: newItem.subject,
      sender: newItem.sender,
      recipients: [newItem.recipient],
      date: newItem.date,
      status: "sent" as const,
    };
    return (
      communicationsApi.correspondence?.create?.(correspondence) ||
      correspondence
    );
  },

  addServiceJob: async (job: ServiceJob): Promise<ServiceJob> => {
    return apiClient.post<ServiceJob>("/service-jobs", job);
  },

  updateServiceJob: async (
    id: string,
    updates: Partial<ServiceJob>
  ): Promise<ServiceJob> => {
    const job = await apiClient.patch<ServiceJob>(
      `/service-jobs/${id}`,
      updates
    );

    // Integration Logic: If served, trigger orchestrator
    if (updates.status === "SERVED") {
      await IntegrationEventPublisher.publish(
        SystemEventType.SERVICE_COMPLETED,
        { job }
      );
    }

    return job;
  },

  archive: async (id: string) => {
    return apiClient.delete(`/communications/correspondence/${id}`);
  },
};
