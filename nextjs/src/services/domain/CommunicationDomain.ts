import {
  CaseId,
  CommunicationItem,
  ServiceJob,
  ServiceMethod,
  UserId,
} from "@/types";
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { communicationsApi } from "@/api/domains/communications.api";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import { SystemEventType } from "@/types/integration-types";

export const CorrespondenceService = {
  getCommunications: async () =>
    communicationsApi.correspondence?.getAll?.() || [],

  getServiceJobs: async (): Promise<ServiceJob[]> => {
    // Mock data until Service of Process API is available
    return [
      {
        id: "1",
        caseId: "case-1",
        requestorId: "user-1",
        documentTitle: "Summons and Complaint",
        targetPerson: "Robert Jones",
        targetAddress: "123 Main St",
        serverName: "Metro Process Servers",
        method: "Personal_Service",
        status: "In_Progress",
        dueDate: "2026-01-15",
        attempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user-1",
      },
      {
        id: "2",
        caseId: "case-2",
        requestorId: "user-1",
        documentTitle: "Subpoena",
        targetPerson: "Witness A",
        targetAddress: "456 Oak Ave",
        serverName: "City Legal Services",
        method: "Substituted_Service",
        status: "Completed",
        dueDate: "2025-12-28",
        attempts: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user-1",
      },
    ];
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
    const newJob = { ...job, id: job.id || crypto.randomUUID() };
    // Note: serviceJobs API is not yet available in communicationsApi
    // console.warn('[CorrespondenceService.addServiceJob] Service jobs API not yet available');
    return newJob;
  },

  updateServiceJob: async (
    id: string,
    updates: Partial<ServiceJob>
  ): Promise<ServiceJob> => {
    // Note: serviceJobs API is not yet available in communicationsApi
    // console.warn('[CorrespondenceService.updateServiceJob] Service jobs API not yet available');

    // Mock job for type safety
    const job: ServiceJob = {
      id,
      caseId: "" as CaseId,
      requestorId: "" as UserId,
      documentTitle: "",
      targetPerson: "",
      targetAddress: "",
      serverName: "",
      method: "Personal" as ServiceMethod,
      status: "DRAFT",
      dueDate: new Date().toISOString(),
      attempts: 0,
      ...updates,
    };

    // Integration Logic: If served, trigger orchestrator
    if (updates.status === "SERVED" && job.status !== "SERVED") {
      await IntegrationEventPublisher.publish(
        SystemEventType.SERVICE_COMPLETED,
        { job }
      );
    }

    return job;
  },

  archive: async (id: string) => {
    console.log(`[API] Archived correspondence ${id}`);
    // Soft delete logic would go here
  },
};
