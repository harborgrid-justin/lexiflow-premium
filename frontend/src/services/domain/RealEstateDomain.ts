/**
 * RealEstateDomain - Real Estate Asset Management Service
 *
 * Enterprise-grade service for managing real estate assets including:
 * - Property portfolio management
 * - Acquisitions and disposals
 * - Encroachment tracking
 * - Utilization monitoring
 * - Cost share agreements
 * - Outgrants and leasing
 * - Relocation management
 * - Audit readiness
 *
 * @module RealEstateDomain
 * @architecture Backend-first API with graceful degradation
 * @migrated Backend API integration 2025-01-05
 */

import { apiClient } from "@/services/infrastructure/apiClient";

// ═══════════════════════════════════════════════════════════════════════════
//                            TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Status types for various real estate records */
export type PropertyStatus =
  | "Active"
  | "Inactive"
  | "Pending"
  | "Under Review"
  | "Archived";
export type DisposalStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Cancelled";
export type EncroachmentStatus =
  | "Active"
  | "Under Review"
  | "Resolved"
  | "Dismissed";
export type AcquisitionStatus =
  | "Prospecting"
  | "Under Contract"
  | "Due Diligence"
  | "Closed"
  | "Cancelled";
export type OutgrantStatus =
  | "Active"
  | "Expired"
  | "Pending Renewal"
  | "Terminated";
export type SolicitationStatus =
  | "Draft"
  | "Open"
  | "Closed"
  | "Awarded"
  | "Cancelled";

/** Base interface for all real estate entities */
interface RealEstateBaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/** Property/Inventory record */
export interface RealEstateProperty extends RealEstateBaseEntity {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  propertyType: "Land" | "Building" | "Facility" | "Mixed-Use" | "Other";
  squareFootage?: number;
  acreage?: number;
  acquisitionDate?: string;
  acquisitionCost?: number;
  currentValue?: number;
  status: PropertyStatus;
  assignedManager?: string;
  locationCoordinates?: { lat: number; lng: number };
}

/** Disposal record */
export interface RealEstateDisposal extends RealEstateBaseEntity {
  propertyId: string;
  propertyName: string;
  disposalType: "Sale" | "Transfer" | "Donation" | "Demolition";
  status: DisposalStatus;
  estimatedValue?: number;
  actualValue?: number;
  targetDate?: string;
  completionDate?: string;
  buyerOrRecipient?: string;
  reason: string;
  approvedBy?: string;
}

/** Encroachment record */
export interface RealEstateEncroachment extends RealEstateBaseEntity {
  propertyId: string;
  propertyName: string;
  encroachmentType:
    | "Structural"
    | "Fence"
    | "Vegetation"
    | "Utility"
    | "Access"
    | "Other";
  status: EncroachmentStatus;
  description: string;
  encroachingParty?: string;
  discoveredDate: string;
  resolvedDate?: string;
  resolutionMethod?: string;
  estimatedImpact?: number;
  legalCaseId?: string;
}

/** Acquisition record */
export interface RealEstateAcquisition extends RealEstateBaseEntity {
  propertyName: string;
  address: string;
  propertyType: "Land" | "Building" | "Facility" | "Mixed-Use" | "Other";
  status: AcquisitionStatus;
  askingPrice?: number;
  offeredPrice?: number;
  finalPrice?: number;
  seller?: string;
  targetCloseDate?: string;
  actualCloseDate?: string;
  dueDate?: string;
  assignedAgent?: string;
}

/** Utilization record */
export interface RealEstateUtilization extends RealEstateBaseEntity {
  propertyId: string;
  propertyName: string;
  totalCapacity: number;
  currentOccupancy: number;
  utilizationRate: number;
  primaryUse: string;
  departments?: string[];
  lastAssessmentDate: string;
  nextAssessmentDate?: string;
  recommendations?: string;
}

/** Cost share agreement */
export interface RealEstateCostShare extends RealEstateBaseEntity {
  propertyId: string;
  propertyName: string;
  agreementType:
    | "Lease Share"
    | "Maintenance Share"
    | "Utility Share"
    | "Capital Share";
  parties: string[];
  sharePercentages: Record<string, number>;
  effectiveDate: string;
  expirationDate?: string;
  totalAmount?: number;
  billingFrequency: "Monthly" | "Quarterly" | "Annual";
  status: "Active" | "Pending" | "Expired" | "Terminated";
}

/** Outgrant record */
export interface RealEstateOutgrant extends RealEstateBaseEntity {
  propertyId: string;
  propertyName: string;
  grantType: "Lease" | "License" | "Permit" | "Easement";
  grantee: string;
  status: OutgrantStatus;
  startDate: string;
  endDate?: string;
  monthlyRent?: number;
  annualRent?: number;
  terms?: string;
  renewalOptions?: string;
}

/** Solicitation record */
export interface RealEstateSolicitation extends RealEstateBaseEntity {
  title: string;
  solicitationType: "RFP" | "RFQ" | "IFB" | "RFI";
  status: SolicitationStatus;
  description: string;
  publishDate?: string;
  dueDate?: string;
  awardDate?: string;
  estimatedValue?: number;
  awardedTo?: string;
  awardedAmount?: number;
  propertyIds?: string[];
}

/** Relocation record */
export interface RealEstateRelocation extends RealEstateBaseEntity {
  fromPropertyId: string;
  fromPropertyName: string;
  toPropertyId?: string;
  toPropertyName?: string;
  relocationType: "Department" | "Equipment" | "Staff" | "Full Facility";
  status: "Planning" | "In Progress" | "Completed" | "Cancelled";
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  affectedDepartments?: string[];
  coordinator?: string;
}

/** Audit readiness record */
export interface RealEstateAuditItem extends RealEstateBaseEntity {
  propertyId: string;
  propertyName: string;
  auditType: "Financial" | "Compliance" | "Physical" | "Environmental";
  status:
    | "Not Started"
    | "In Progress"
    | "Ready"
    | "Needs Attention"
    | "Completed";
  checklistItems: Array<{
    item: string;
    status: "Complete" | "Incomplete" | "N/A";
    notes?: string;
  }>;
  lastAuditDate?: string;
  nextAuditDate?: string;
  auditor?: string;
  findings?: string;
  score?: number;
}

/** Portfolio summary stats */
export interface PortfolioStats {
  totalProperties: number;
  totalValue: number;
  activeProperties: number;
  pendingAcquisitions: number;
  pendingDisposals: number;
  activeEncroachments: number;
  avgUtilizationRate: number;
  totalSquareFootage: number;
  totalAcreage: number;
}

// ═══════════════════════════════════════════════════════════════════════════
//                         QUERY KEYS FOR REACT QUERY
// ═══════════════════════════════════════════════════════════════════════════

export const REAL_ESTATE_QUERY_KEYS = {
  all: () => ["real-estate"] as const,
  properties: () => ["real-estate", "properties"] as const,
  property: (id: string) => ["real-estate", "properties", id] as const,
  disposals: () => ["real-estate", "disposals"] as const,
  encroachments: () => ["real-estate", "encroachments"] as const,
  acquisitions: () => ["real-estate", "acquisitions"] as const,
  utilization: () => ["real-estate", "utilization"] as const,
  costShares: () => ["real-estate", "cost-shares"] as const,
  outgrants: () => ["real-estate", "outgrants"] as const,
  solicitations: () => ["real-estate", "solicitations"] as const,
  relocations: () => ["real-estate", "relocations"] as const,
  auditItems: () => ["real-estate", "audit-items"] as const,
  portfolioStats: () => ["real-estate", "portfolio-stats"] as const,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//                         REAL ESTATE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Real Estate Service
 * Production-ready API for all real estate operations
 *
 * @example
 * // Get all properties
 * const properties = await RealEstateService.getAllProperties();
 *
 * // Get portfolio summary
 * const stats = await RealEstateService.getPortfolioStats();
 *
 * // Create new acquisition
 * await RealEstateService.createAcquisition({ ... });
 */
export const RealEstateService = {
  // ─────────────────────────────────────────────────────────────────────────
  // PROPERTY/INVENTORY OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all properties in the portfolio
   */
  getAllProperties: async (filters?: {
    status?: PropertyStatus;
    propertyType?: string;
    state?: string;
  }): Promise<RealEstateProperty[]> => {
    try {
      return await apiClient.get<RealEstateProperty[]>(
        "/real-estate/properties",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getAllProperties] Error:", error);
      return [];
    }
  },

  /**
   * Get a single property by ID
   */
  getPropertyById: async (id: string): Promise<RealEstateProperty | null> => {
    if (!id?.trim()) {
      console.error("[RealEstateService.getPropertyById] Invalid ID");
      return null;
    }

    try {
      return await apiClient.get<RealEstateProperty>(
        `/real-estate/properties/${id}`
      );
    } catch (error) {
      console.error("[RealEstateService.getPropertyById] Error:", error);
      return null;
    }
  },

  /**
   * Create a new property record
   */
  createProperty: async (
    property: Omit<RealEstateProperty, "id" | "createdAt" | "updatedAt">
  ): Promise<RealEstateProperty> => {
    return apiClient.post<RealEstateProperty>(
      "/real-estate/properties",
      property
    );
  },

  /**
   * Update an existing property
   */
  updateProperty: async (
    id: string,
    updates: Partial<RealEstateProperty>
  ): Promise<RealEstateProperty> => {
    return apiClient.patch<RealEstateProperty>(
      `/real-estate/properties/${id}`,
      updates
    );
  },

  /**
   * Delete a property record
   */
  deleteProperty: async (id: string): Promise<void> => {
    return apiClient.delete(`/real-estate/properties/${id}`);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DISPOSAL OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all disposal records
   */
  getDisposals: async (filters?: {
    status?: DisposalStatus;
    propertyId?: string;
  }): Promise<RealEstateDisposal[]> => {
    try {
      return await apiClient.get<RealEstateDisposal[]>(
        "/real-estate/disposals",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getDisposals] Error:", error);
      return [];
    }
  },

  /**
   * Create a new disposal record
   */
  createDisposal: async (
    disposal: Omit<RealEstateDisposal, "id" | "createdAt" | "updatedAt">
  ): Promise<RealEstateDisposal> => {
    return apiClient.post<RealEstateDisposal>(
      "/real-estate/disposals",
      disposal
    );
  },

  /**
   * Update a disposal record
   */
  updateDisposal: async (
    id: string,
    updates: Partial<RealEstateDisposal>
  ): Promise<RealEstateDisposal> => {
    return apiClient.patch<RealEstateDisposal>(
      `/real-estate/disposals/${id}`,
      updates
    );
  },

  /**
   * Delete a disposal record
   */
  deleteDisposal: async (id: string): Promise<void> => {
    return apiClient.delete(`/real-estate/disposals/${id}`);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ENCROACHMENT OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all encroachment records
   */
  getEncroachments: async (filters?: {
    status?: EncroachmentStatus;
    propertyId?: string;
  }): Promise<RealEstateEncroachment[]> => {
    try {
      return await apiClient.get<RealEstateEncroachment[]>(
        "/real-estate/encroachments",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getEncroachments] Error:", error);
      return [];
    }
  },

  /**
   * Create a new encroachment record
   */
  createEncroachment: async (
    encroachment: Omit<RealEstateEncroachment, "id" | "createdAt" | "updatedAt">
  ): Promise<RealEstateEncroachment> => {
    return apiClient.post<RealEstateEncroachment>(
      "/real-estate/encroachments",
      encroachment
    );
  },

  /**
   * Update an encroachment record
   */
  updateEncroachment: async (
    id: string,
    updates: Partial<RealEstateEncroachment>
  ): Promise<RealEstateEncroachment> => {
    return apiClient.patch<RealEstateEncroachment>(
      `/real-estate/encroachments/${id}`,
      updates
    );
  },

  /**
   * Resolve an encroachment
   */
  resolveEncroachment: async (
    id: string,
    resolution: { method: string; notes?: string }
  ): Promise<RealEstateEncroachment> => {
    return apiClient.post<RealEstateEncroachment>(
      `/real-estate/encroachments/${id}/resolve`,
      resolution
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACQUISITION OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all acquisition records
   */
  getAcquisitions: async (filters?: {
    status?: AcquisitionStatus;
  }): Promise<RealEstateAcquisition[]> => {
    try {
      return await apiClient.get<RealEstateAcquisition[]>(
        "/real-estate/acquisitions",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getAcquisitions] Error:", error);
      return [];
    }
  },

  /**
   * Create a new acquisition record
   */
  createAcquisition: async (
    acquisition: Omit<RealEstateAcquisition, "id" | "createdAt" | "updatedAt">
  ): Promise<RealEstateAcquisition> => {
    return apiClient.post<RealEstateAcquisition>(
      "/real-estate/acquisitions",
      acquisition
    );
  },

  /**
   * Update an acquisition record
   */
  updateAcquisition: async (
    id: string,
    updates: Partial<RealEstateAcquisition>
  ): Promise<RealEstateAcquisition> => {
    return apiClient.patch<RealEstateAcquisition>(
      `/real-estate/acquisitions/${id}`,
      updates
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // UTILIZATION OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get utilization data for all properties
   */
  getUtilization: async (filters?: {
    propertyId?: string;
    minRate?: number;
    maxRate?: number;
  }): Promise<RealEstateUtilization[]> => {
    try {
      return await apiClient.get<RealEstateUtilization[]>(
        "/real-estate/utilization",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getUtilization] Error:", error);
      return [];
    }
  },

  /**
   * Update utilization record
   */
  updateUtilization: async (
    id: string,
    updates: Partial<RealEstateUtilization>
  ): Promise<RealEstateUtilization> => {
    return apiClient.patch<RealEstateUtilization>(
      `/real-estate/utilization/${id}`,
      updates
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COST SHARE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all cost share agreements
   */
  getCostShares: async (filters?: {
    propertyId?: string;
    status?: string;
  }): Promise<RealEstateCostShare[]> => {
    try {
      return await apiClient.get<RealEstateCostShare[]>(
        "/real-estate/cost-shares",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getCostShares] Error:", error);
      return [];
    }
  },

  /**
   * Create a new cost share agreement
   */
  createCostShare: async (
    costShare: Omit<RealEstateCostShare, "id" | "createdAt" | "updatedAt">
  ): Promise<RealEstateCostShare> => {
    return apiClient.post<RealEstateCostShare>(
      "/real-estate/cost-shares",
      costShare
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OUTGRANT OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all outgrant records
   */
  getOutgrants: async (filters?: {
    status?: OutgrantStatus;
    propertyId?: string;
  }): Promise<RealEstateOutgrant[]> => {
    try {
      return await apiClient.get<RealEstateOutgrant[]>(
        "/real-estate/outgrants",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getOutgrants] Error:", error);
      return [];
    }
  },

  /**
   * Create a new outgrant record
   */
  createOutgrant: async (
    outgrant: Omit<RealEstateOutgrant, "id" | "createdAt" | "updatedAt">
  ): Promise<RealEstateOutgrant> => {
    return apiClient.post<RealEstateOutgrant>(
      "/real-estate/outgrants",
      outgrant
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SOLICITATION OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all solicitation records
   */
  getSolicitations: async (filters?: {
    status?: SolicitationStatus;
  }): Promise<RealEstateSolicitation[]> => {
    try {
      return await apiClient.get<RealEstateSolicitation[]>(
        "/real-estate/solicitations",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getSolicitations] Error:", error);
      return [];
    }
  },

  /**
   * Create a new solicitation
   */
  createSolicitation: async (
    solicitation: Omit<RealEstateSolicitation, "id" | "createdAt" | "updatedAt">
  ): Promise<RealEstateSolicitation> => {
    return apiClient.post<RealEstateSolicitation>(
      "/real-estate/solicitations",
      solicitation
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RELOCATION OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all relocation records
   */
  getRelocations: async (filters?: {
    status?: string;
  }): Promise<RealEstateRelocation[]> => {
    try {
      return await apiClient.get<RealEstateRelocation[]>(
        "/real-estate/relocations",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getRelocations] Error:", error);
      return [];
    }
  },

  /**
   * Create a new relocation record
   */
  createRelocation: async (
    relocation: Omit<RealEstateRelocation, "id" | "createdAt" | "updatedAt">
  ): Promise<RealEstateRelocation> => {
    return apiClient.post<RealEstateRelocation>(
      "/real-estate/relocations",
      relocation
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT READINESS OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get audit readiness items
   */
  getAuditItems: async (filters?: {
    propertyId?: string;
    status?: string;
  }): Promise<RealEstateAuditItem[]> => {
    try {
      return await apiClient.get<RealEstateAuditItem[]>(
        "/real-estate/audit-items",
        filters
      );
    } catch (error) {
      console.error("[RealEstateService.getAuditItems] Error:", error);
      return [];
    }
  },

  /**
   * Update audit item status
   */
  updateAuditItem: async (
    id: string,
    updates: Partial<RealEstateAuditItem>
  ): Promise<RealEstateAuditItem> => {
    return apiClient.patch<RealEstateAuditItem>(
      `/real-estate/audit-items/${id}`,
      updates
    );
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PORTFOLIO STATISTICS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get portfolio summary statistics
   */
  getPortfolioStats: async (): Promise<PortfolioStats> => {
    try {
      return await apiClient.get<PortfolioStats>(
        "/real-estate/portfolio/stats"
      );
    } catch (error) {
      console.error("[RealEstateService.getPortfolioStats] Error:", error);
      return {
        totalProperties: 0,
        totalValue: 0,
        activeProperties: 0,
        pendingAcquisitions: 0,
        pendingDisposals: 0,
        activeEncroachments: 0,
        avgUtilizationRate: 0,
        totalSquareFootage: 0,
        totalAcreage: 0,
      };
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // USER MANAGEMENT FOR REAL ESTATE MODULE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get users with real estate module access
   */
  getModuleUsers: async (): Promise<
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      permissions: string[];
      lastActive?: string;
    }>
  > => {
    try {
      return await apiClient.get("/real-estate/users");
    } catch (error) {
      console.error("[RealEstateService.getModuleUsers] Error:", error);
      return [];
    }
  },

  /**
   * Update user permissions for real estate module
   */
  updateUserPermissions: async (
    userId: string,
    permissions: string[]
  ): Promise<void> => {
    return apiClient.patch(`/real-estate/users/${userId}/permissions`, {
      permissions,
    });
  },
};

// Export as default for easier import
export default RealEstateService;
