import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";
import { db, STORES } from "@/services/data/db";
import { Deposition } from "@/types";
import { validateCaseId } from "./utils";

export const getDepositions = async (
  useBackend: boolean,
  caseId?: string
): Promise<Deposition[]> => {
  validateCaseId(caseId, "getDepositions");

  if (useBackend) {
    try {
      return (await discoveryApi.depositions.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as Deposition[];
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    const depositions = await db.getAll<Deposition>(STORES.DISCOVERY_EXT_DEPO);
    return caseId
      ? depositions.filter((d) => d.caseId === caseId)
      : depositions;
  } catch (error) {
    console.error("[DiscoveryRepository.getDepositions] Error:", error);
    throw new OperationError("getDepositions", "Failed to fetch depositions");
  }
};

export const addDeposition = async (
  useBackend: boolean,
  deposition: Deposition
): Promise<Deposition> => {
  if (!deposition || typeof deposition !== "object") {
    throw new ValidationError(
      "[DiscoveryRepository.addDeposition] Invalid deposition data"
    );
  }

  if (useBackend) {
    try {
      return (await discoveryApi.depositions.create(
        deposition as unknown as Record<string, unknown>
      )) as unknown as Deposition;
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    await db.put(STORES.DISCOVERY_EXT_DEPO, deposition);
    return deposition;
  } catch (error) {
    console.error("[DiscoveryRepository.addDeposition] Error:", error);
    throw new OperationError("addDeposition", "Failed to add deposition");
  }
};
