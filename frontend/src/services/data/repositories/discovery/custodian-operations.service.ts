import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";
import { db, STORES } from "@/services/data/db";
import { type Custodian } from "@/types";

import { validateCaseId, validateId } from "./utils";

export const getCustodians = async (
  useBackend: boolean,
  caseId?: string
): Promise<Custodian[]> => {
  validateCaseId(caseId, "getCustodians");

  if (useBackend) {
    try {
      const result = await discoveryApi.custodians.getAll(
        caseId ? { caseId } : undefined
      );
      return result as unknown as Custodian[];
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    const custodians = await db.getAll<Custodian>(STORES.CUSTODIANS);
    return caseId ? custodians.filter((c) => c.caseId === caseId) : custodians;
  } catch (error) {
    console.error("[DiscoveryRepository.getCustodians] Error:", error);
    throw new OperationError("getCustodians", "Failed to fetch custodians");
  }
};

export const addCustodian = async (
  useBackend: boolean,
  custodian: Custodian
): Promise<Custodian> => {
  if (!custodian || typeof custodian !== "object") {
    throw new ValidationError(
      "[DiscoveryRepository.addCustodian] Invalid custodian data"
    );
  }

  if (useBackend) {
    try {
      const result = await discoveryApi.custodians.create(custodian);
      return result as unknown as Custodian;
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    await db.put(STORES.CUSTODIANS, custodian);
    return custodian;
  } catch (error) {
    console.error("[DiscoveryRepository.addCustodian] Error:", error);
    throw new OperationError("addCustodian", "Failed to add custodian");
  }
};

export const updateCustodian = async (
  useBackend: boolean,
  custodian: unknown
): Promise<unknown> => {
  const custodianObj = custodian as { id?: string };
  if (!custodianObj?.id) {
    throw new ValidationError(
      "[DiscoveryRepository.updateCustodian] Custodian ID required"
    );
  }

  if (useBackend) {
    try {
      const { id, ...updates } = custodianObj as {
        id: string;
        [key: string]: unknown;
      };
      return await discoveryApi.custodians.update(id, updates);
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    return await db.put(STORES.CUSTODIANS, custodian);
  } catch (error) {
    console.error("[DiscoveryRepository.updateCustodian] Error:", error);
    throw new OperationError("updateCustodian", "Failed to update custodian");
  }
};

export const deleteCustodian = async (
  useBackend: boolean,
  id: string
): Promise<void> => {
  validateId(id, "deleteCustodian");

  if (useBackend) {
    try {
      await discoveryApi.custodians.delete(id);
      return;
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    await db.delete(STORES.CUSTODIANS, id);
  } catch (error) {
    console.error("[DiscoveryRepository.deleteCustodian] Error:", error);
    throw new OperationError("deleteCustodian", "Failed to delete custodian");
  }
};
