import { CommunicationItem, ServiceJob } from "@/types";
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { isBackendApiEnabled } from "@/api";
import { communicationsApi } from "@/api/domains/communications.api";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import { apiClient } from "@/services/infrastructure/apiClient";
import { SystemEventType } from "@/types/integration-types";

export const CorrespondenceService = {
  getCommunications: async () =>
    communicationsApi.correspondence?.getAll?.() || [],

  getServiceJobs: async (): Promise<ServiceJob[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<ServiceJob[]>("/service-jobs");
      } catch (e) {
        console.warn("Failed to fetch service jobs", e);
        return [];
      }
    }
    return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.post<ServiceJob>("/service-jobs", job);
    }
    throw new Error("Backend API required");
  },

  updateServiceJob: async (
    id: string,
    updates: Partial<ServiceJob>
  ): Promise<ServiceJob> => {
    if (isBackendApiEnabled()) {
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
    }
    throw new Error("Backend API required");
  },

  archive: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.delete(`/communications/correspondence/${id}`);
    }
    throw new Error("Backend API required");
  },
};
