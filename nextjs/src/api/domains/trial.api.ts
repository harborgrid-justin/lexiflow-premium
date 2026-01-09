/**
 * Trial Management Domain API Services
 * Trial events, exhibits, witness preparation, ADR & settlements
 */

import { TrialApiService } from "../trial/trial-api";
import { ExhibitsApiService } from "../trial/exhibits-api";
import { ADRApiService } from "../trial/adr-api";

// Export service classes
export { TrialApiService, ExhibitsApiService, ADRApiService };

// Export types from ADR API
export type {
  ADRSession,
  ADROutcome,
  Settlement,
  MediationDetails,
  ArbitrationDetails,
  ADRType,
  ADRStatus,
  SettlementStatus,
  ADRFilters,
  SettlementFilters,
  CreateADRSessionDto,
  CreateSettlementDto,
} from "../trial/adr-api";

export { ADR_QUERY_KEYS } from "../trial/adr-api";

// Export singleton instances
export const trialApi = {
  trial: new TrialApiService(),
  exhibits: new ExhibitsApiService(),
  adr: new ADRApiService(),
} as const;
