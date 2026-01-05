/**
 * Discovery Domain Filter Types
 * Centralized filter interfaces for discovery API services
 */

// Legal Hold Filters
export interface LegalHoldFilters {
  caseId?: string;
  status?: 'active' | 'released' | 'expired';
  custodianId?: string;
}

// Privilege Log Filters
export interface PrivilegeLogFilters {
  caseId?: string;
  productionId?: string;
  privilegeType?: 'attorney_client' | 'work_product' | 'common_interest' | 'settlement' | 'other';
}

// Production Filters
export interface ProductionFilters {
  caseId?: string;
  status?: string;
  productionType?: string;
}

// Witness Filters
export interface WitnessFilters {
  caseId?: string;
  witnessType?: string;
  status?: string;
}

// Deposition Filters
export interface DepositionFilters {
  caseId?: string;
  witnessId?: string;
  status?: string;
}

// Custodian Interview Filters
export interface CustodianInterviewFilters {
  caseId?: string;
  custodianId?: string;
  status?: string;
}

// Discovery Request Filters
export interface DiscoveryRequestFilters {
  caseId?: string;
  requestType?: string;
  status?: string;
}

// ESI Source Filters
export interface ESISourceFilters {
  custodianId?: string;
  sourceType?: string;
  status?: string;
}
