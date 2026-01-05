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

import { isBackendApiEnabled } from "@/api";
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateProperty[]>(
          "/real-estate/properties",
          filters
        );
      }
      // Return empty array when backend is not available
      return [];
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateProperty>(
          `/real-estate/properties/${id}`
        );
      }
      return null;
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
    if (isBackendApiEnabled()) {
      return apiClient.post<RealEstateProperty>(
        "/real-estate/properties",
        property
      );
    }
    throw new Error("Backend API required for property creation");
  },

  /**
   * Update an existing property
   */
  updateProperty: async (
    id: string,
    updates: Partial<RealEstateProperty>
  ): Promise<RealEstateProperty> => {
    if (isBackendApiEnabled()) {
      return apiClient.patch<RealEstateProperty>(
        `/real-estate/properties/${id}`,
        updates
      );
    }
    throw new Error("Backend API required for property update");
  },

  /**
   * Delete a property record
   */
  deleteProperty: async (id: string): Promise<void> => {
    if (isBackendApiEnabled()) {
      return apiClient.delete(`/real-estate/properties/${id}`);
    }
    throw new Error("Backend API required for property deletion");
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateDisposal[]>(
          "/real-estate/disposals",
          filters
        );
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.post<RealEstateDisposal>(
        "/real-estate/disposals",
        disposal
      );
    }
    throw new Error("Backend API required for disposal creation");
  },

  /**
   * Update a disposal record
   */
  updateDisposal: async (
    id: string,
    updates: Partial<RealEstateDisposal>
  ): Promise<RealEstateDisposal> => {
    if (isBackendApiEnabled()) {
      return apiClient.patch<RealEstateDisposal>(
        `/real-estate/disposals/${id}`,
        updates
      );
    }
    throw new Error("Backend API required for disposal update");
  },

  /**
   * Delete a disposal record
   */
  deleteDisposal: async (id: string): Promise<void> => {
    if (isBackendApiEnabled()) {
      return apiClient.delete(`/real-estate/disposals/${id}`);
    }
    throw new Error("Backend API required for disposal deletion");
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateEncroachment[]>(
          "/real-estate/encroachments",
          filters
        );
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.post<RealEstateEncroachment>(
        "/real-estate/encroachments",
        encroachment
      );
    }
    throw new Error("Backend API required for encroachment creation");
  },

  /**
   * Update an encroachment record
   */
  updateEncroachment: async (
    id: string,
    updates: Partial<RealEstateEncroachment>
  ): Promise<RealEstateEncroachment> => {
    if (isBackendApiEnabled()) {
      return apiClient.patch<RealEstateEncroachment>(
        `/real-estate/encroachments/${id}`,
        updates
      );
    }
    throw new Error("Backend API required for encroachment update");
  },

  /**
   * Resolve an encroachment
   */
  resolveEncroachment: async (
    id: string,
    resolution: { method: string; notes?: string }
  ): Promise<RealEstateEncroachment> => {
    if (isBackendApiEnabled()) {
      return apiClient.post<RealEstateEncroachment>(
        `/real-estate/encroachments/${id}/resolve`,
        resolution
      );
    }
    throw new Error("Backend API required for encroachment resolution");
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateAcquisition[]>(
          "/real-estate/acquisitions",
          filters
        );
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.post<RealEstateAcquisition>(
        "/real-estate/acquisitions",
        acquisition
      );
    }
    throw new Error("Backend API required for acquisition creation");
  },

  /**
   * Update an acquisition record
   */
  updateAcquisition: async (
    id: string,
    updates: Partial<RealEstateAcquisition>
  ): Promise<RealEstateAcquisition> => {
    if (isBackendApiEnabled()) {
      return apiClient.patch<RealEstateAcquisition>(
        `/real-estate/acquisitions/${id}`,
        updates
      );
    }
    throw new Error("Backend API required for acquisition update");
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateUtilization[]>(
          "/real-estate/utilization",
          filters
        );
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.patch<RealEstateUtilization>(
        `/real-estate/utilization/${id}`,
        updates
      );
    }
    throw new Error("Backend API required for utilization update");
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateCostShare[]>(
          "/real-estate/cost-shares",
          filters
        );
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.post<RealEstateCostShare>(
        "/real-estate/cost-shares",
        costShare
      );
    }
    throw new Error("Backend API required for cost share creation");
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateOutgrant[]>(
          "/real-estate/outgrants",
          filters
        );
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.post<RealEstateOutgrant>(
        "/real-estate/outgrants",
        outgrant
      );
    }
    throw new Error("Backend API required for outgrant creation");
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateSolicitation[]>(
          "/real-estate/solicitations",
          filters
        );
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.post<RealEstateSolicitation>(
        "/real-estate/solicitations",
        solicitation
      );
    }
    throw new Error("Backend API required for solicitation creation");
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateRelocation[]>(
          "/real-estate/relocations",
          filters
        );
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.post<RealEstateRelocation>(
        "/real-estate/relocations",
        relocation
      );
    }
    throw new Error("Backend API required for relocation creation");
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
      if (isBackendApiEnabled()) {
        return apiClient.get<RealEstateAuditItem[]>(
          "/real-estate/audit-items",
          filters
        );
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.patch<RealEstateAuditItem>(
        `/real-estate/audit-items/${id}`,
        updates
      );
    }
    throw new Error("Backend API required for audit item update");
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PORTFOLIO STATISTICS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get portfolio summary statistics
   */
  getPortfolioStats: async (): Promise<PortfolioStats> => {
    try {
      if (isBackendApiEnabled()) {
        return apiClient.get<PortfolioStats>("/real-estate/portfolio/stats");
      }

      // Return empty stats when backend is not available
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
      if (isBackendApiEnabled()) {
        return apiClient.get("/real-estate/users");
      }
      return [];
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
    if (isBackendApiEnabled()) {
      return apiClient.patch(`/real-estate/users/${userId}/permissions`, {
        permissions,
      });
    }
    throw new Error("Backend API required for permission update");
  },
};

// Export as default for easier import
export default RealEstateService;
