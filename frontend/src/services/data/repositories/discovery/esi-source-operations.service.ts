import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";
import { db, STORES } from "@/services/data/db";
import { ESISource } from "@/types";
import { validateCaseId } from "./utils";

export const getESISources = async (
  useBackend: boolean,
  caseId?: string
): Promise<ESISource[]> => {
  validateCaseId(caseId, "getESISources");

  if (useBackend) {
    try {
      return (await discoveryApi.esiSources.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as ESISource[];
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    const sources = await db.getAll<ESISource>(STORES.DISCOVERY_EXT_ESI);
    return caseId ? sources.filter((e) => e.caseId === caseId) : sources;
  } catch (error) {
    console.error("[DiscoveryRepository.getESISources] Error:", error);
    throw new OperationError("getESISources", "Failed to fetch ESI sources");
  }
};

export const addESISource = async (
  useBackend: boolean,
  source: ESISource
): Promise<ESISource> => {
  if (!source || typeof source !== "object") {
    throw new ValidationError(
      "[DiscoveryRepository.addESISource] Invalid ESI source data"
    );
  }

  if (useBackend) {
    try {
      return (await discoveryApi.esiSources.create(
        source as unknown as Record<string, unknown>
      )) as unknown as ESISource;
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    await db.put(STORES.DISCOVERY_EXT_ESI, source);
    return source;
  } catch (error) {
    console.error("[DiscoveryRepository.addESISource] Error:", error);
    throw new OperationError("addESISource", "Failed to add ESI source");
  }
};
