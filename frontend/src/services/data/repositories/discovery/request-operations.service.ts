import { discoveryApi } from "@/api/domains/discovery.api";
import { DiscoveryRequest } from "@/types";
import { db, STORES } from "@/services/data/db";
import {
  EntityNotFoundError,
  OperationError,
  ValidationError,
} from "@/services/core/errors";
import { validateCaseId, validateId } from "./utils";

export const getRequests = async (
  useBackend: boolean,
  caseId?: string
): Promise<DiscoveryRequest[]> => {
  validateCaseId(caseId, "getRequests");

  if (useBackend) {
    try {
      return (await discoveryApi.discoveryRequests.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as DiscoveryRequest[];
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    const requests = await db.getAll<DiscoveryRequest>(STORES.REQUESTS);
    return caseId ? requests.filter((r) => r.caseId === caseId) : requests;
  } catch (error) {
    console.error("[DiscoveryRepository.getRequests] Error:", error);
    throw new OperationError(
      "getRequests",
      "Failed to fetch discovery requests"
    );
  }
};

export const addRequest = async (
  useBackend: boolean,
  request: DiscoveryRequest
): Promise<DiscoveryRequest> => {
  if (!request || typeof request !== "object") {
    throw new ValidationError(
      "[DiscoveryRepository.addRequest] Invalid request data"
    );
  }

  if (useBackend) {
    try {
      return (await discoveryApi.discoveryRequests.create(
        request as unknown as Record<string, unknown>
      )) as unknown as DiscoveryRequest;
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    await db.put(STORES.REQUESTS, request);
    return request;
  } catch (error) {
    console.error("[DiscoveryRepository.addRequest] Error:", error);
    throw new OperationError("addRequest", "Failed to add discovery request");
  }
};

export const updateRequestStatus = async (
  useBackend: boolean,
  id: string,
  status: string
): Promise<DiscoveryRequest> => {
  validateId(id, "updateRequestStatus");

  if (!status || status.trim() === "") {
    throw new ValidationError(
      "[DiscoveryRepository.updateRequestStatus] Invalid status parameter"
    );
  }

  if (useBackend) {
    try {
      return (await discoveryApi.discoveryRequests.updateStatus(
        id,
        status as unknown as
          | "draft"
          | "served"
          | "responded"
          | "pending_response"
          | "overdue"
          | "withdrawn"
      )) as unknown as DiscoveryRequest;
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    const request = await db.get<DiscoveryRequest>(STORES.REQUESTS, id);
    if (!request) {
      throw new EntityNotFoundError("DiscoveryRequest", id);
    }
    const updated: DiscoveryRequest = {
      ...request,
      status: status as unknown as DiscoveryRequest["status"],
    };
    await db.put(STORES.REQUESTS, updated);
    return updated;
  } catch (error) {
    console.error("[DiscoveryRepository.updateRequestStatus] Error:", error);
    throw new OperationError(
      "updateRequestStatus",
      "Failed to update discovery request status"
    );
  }
};
