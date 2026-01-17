import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";
import { db, STORES } from "@/services/data/db";
import { type CustodianInterview } from "@/types";

import { validateCaseId } from "./utils";

export const getInterviews = async (
  useBackend: boolean,
  caseId?: string
): Promise<CustodianInterview[]> => {
  validateCaseId(caseId, "getInterviews");

  if (useBackend) {
    try {
      return (await discoveryApi.custodianInterviews.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as CustodianInterview[];
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    const interviews = await db.getAll<CustodianInterview>(
      STORES.DISCOVERY_EXT_INT
    );
    return caseId ? interviews.filter((i) => i.caseId === caseId) : interviews;
  } catch (error) {
    console.error("[DiscoveryRepository.getInterviews] Error:", error);
    throw new OperationError(
      "getInterviews",
      "Failed to fetch custodian interviews"
    );
  }
};

export const createInterview = async (
  useBackend: boolean,
  interview: CustodianInterview
): Promise<CustodianInterview> => {
  if (!interview || typeof interview !== "object") {
    throw new ValidationError(
      "[DiscoveryRepository.createInterview] Invalid interview data"
    );
  }

  if (useBackend) {
    try {
      return (await discoveryApi.custodianInterviews.create(
        interview as unknown as Record<string, unknown>
      )) as unknown as CustodianInterview;
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    await db.put(STORES.DISCOVERY_EXT_INT, interview);
    return interview;
  } catch (error) {
    console.error("[DiscoveryRepository.createInterview] Error:", error);
    throw new OperationError(
      "createInterview",
      "Failed to create custodian interview"
    );
  }
};
