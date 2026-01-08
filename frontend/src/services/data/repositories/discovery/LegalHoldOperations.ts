import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError } from "@/services/core/errors";
import { db, STORES } from "@/services/data/db";
import { LegalHold, LegalHoldEnhanced } from "@/types/discovery-enhanced";

export const getLegalHolds = async (
  useBackend: boolean
): Promise<LegalHold[]> => {
  if (useBackend) {
    try {
      return (await discoveryApi.legalHolds.getAll()) as unknown as LegalHold[];
    } catch (error) {
      console.warn(
        "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
        error
      );
    }
  }

  try {
    return await db.getAll<LegalHold>(STORES.LEGAL_HOLDS);
  } catch (error) {
    console.error("[DiscoveryRepository.getLegalHolds] Error:", error);
    throw new OperationError("getLegalHolds", "Failed to fetch legal holds");
  }
};

export const getLegalHoldsEnhanced = async (
  useBackend: boolean
): Promise<LegalHoldEnhanced[]> => {
  if (useBackend) {
    return discoveryApi.legalHolds.getEnhanced();
  }
  // Fallback to regular holds cast as enhanced (incomplete data but prevents crash)
  const holds = await getLegalHolds(useBackend);
  return holds as unknown as LegalHoldEnhanced[];
};
