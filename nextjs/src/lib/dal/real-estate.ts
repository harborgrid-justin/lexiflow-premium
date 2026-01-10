/**
 * Real Estate Data Access Layer (DAL)
 *
 * Server-side data access functions for the Real Estate module.
 * All functions are async and designed for use in Server Components and Server Actions.
 *
 * Next.js 16 Compliance:
 * - Uses async cookies() access
 * - Supports cache tags for revalidation
 * - Type-safe API interactions
 *
 * @module lib/dal/real-estate
 */

import "server-only";
import { ServerAPI } from "../server-api";

// ============================================================================
// Types
// ============================================================================

export type PropertyType = "Building" | "Land" | "Facility" | "Mixed-Use" | "Other";
export type PropertyStatus = "Active" | "Inactive" | "Pending" | "Under Review" | "Archived";
export type AcquisitionStatus = "Prospecting" | "Under Contract" | "Due Diligence" | "Closed" | "Cancelled";
export type DisposalStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";
export type DisposalType = "Sale" | "Transfer" | "Donation" | "Demolition";
export type OutgrantStatus = "Active" | "Expired" | "Pending Renewal" | "Terminated";
export type OutgrantType = "Lease" | "License" | "Permit" | "Easement";
export type EncroachmentStatus = "Active" | "Under Review" | "Resolved" | "Dismissed";
export type EncroachmentType = "Structural" | "Fence" | "Vegetation" | "Utility" | "Access" | "Other";
export type RelocationStatus = "Planning" | "In Progress" | "Completed" | "Cancelled";
export type RelocationType = "Department" | "Equipment" | "Staff" | "Full Facility";
export type AuditStatus = "Not Started" | "In Progress" | "Ready" | "Needs Attention" | "Completed";
export type AuditType = "Financial" | "Compliance" | "Physical" | "Environmental";
export type SolicitationStatus = "Draft" | "Open" | "Closed" | "Awarded" | "Cancelled";
export type SolicitationType = "RFP" | "RFQ" | "IFB" | "RFI";
export type CostShareStatus = "Active" | "Pending" | "Expired" | "Terminated";
export type CostShareType = "Lease Share" | "Maintenance Share" | "Utility Share" | "Capital Share";
export type BillingFrequency = "Monthly" | "Quarterly" | "Annual";

export interface RealEstateProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  squareFootage?: number;
  currentValue?: number;
  acquisitionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateAcquisition {
  id: string;
  propertyName: string;
  address: string;
  propertyType: PropertyType;
  status: AcquisitionStatus;
  askingPrice?: number;
  offeredPrice?: number;
  finalPrice?: number;
  seller?: string;
  targetCloseDate?: string;
  actualCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateDisposal {
  id: string;
  propertyId: string;
  propertyName: string;
  disposalType: DisposalType;
  status: DisposalStatus;
  reason: string;
  estimatedValue?: number;
  actualValue?: number;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateOutgrant {
  id: string;
  propertyId: string;
  propertyName: string;
  grantType: OutgrantType;
  grantee: string;
  status: OutgrantStatus;
  startDate: string;
  endDate?: string;
  monthlyRent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateEncroachment {
  id: string;
  propertyId: string;
  propertyName: string;
  encroachmentType: EncroachmentType;
  status: EncroachmentStatus;
  description: string;
  discoveredDate: string;
  resolvedDate?: string;
  resolutionMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateRelocation {
  id: string;
  fromPropertyId: string;
  fromPropertyName: string;
  toPropertyId?: string;
  toPropertyName?: string;
  relocationType: RelocationType;
  status: RelocationStatus;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  coordinator?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateAuditItem {
  id: string;
  propertyId: string;
  propertyName: string;
  auditType: AuditType;
  status: AuditStatus;
  lastAuditDate?: string;
  nextAuditDate?: string;
  score?: number;
  findings?: string;
  checklistItems?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateSolicitation {
  id: string;
  title: string;
  solicitationType: SolicitationType;
  status: SolicitationStatus;
  description: string;
  dueDate?: string;
  estimatedValue?: number;
  awardedTo?: string;
  awardedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateCostShare {
  id: string;
  propertyId: string;
  propertyName: string;
  agreementType: CostShareType;
  parties: string[];
  sharePercentages: Record<string, number>;
  effectiveDate: string;
  expirationDate?: string;
  billingFrequency: BillingFrequency;
  status: CostShareStatus;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateUtilization {
  id: string;
  propertyId: string;
  propertyName: string;
  primaryUse: string;
  utilizationRate: number;
  totalCapacity: number;
  currentOccupancy: number;
  lastAssessmentDate?: string;
  departments?: string[];
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
}

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

// ============================================================================
// API Endpoints
// ============================================================================

const REAL_ESTATE_ENDPOINTS = {
  PROPERTIES: "/api/real-estate/properties",
  ACQUISITIONS: "/api/real-estate/acquisitions",
  DISPOSALS: "/api/real-estate/disposals",
  OUTGRANTS: "/api/real-estate/outgrants",
  ENCROACHMENTS: "/api/real-estate/encroachments",
  RELOCATIONS: "/api/real-estate/relocations",
  AUDIT_ITEMS: "/api/real-estate/audit-items",
  SOLICITATIONS: "/api/real-estate/solicitations",
  COST_SHARES: "/api/real-estate/cost-shares",
  UTILIZATION: "/api/real-estate/utilization",
  STATS: "/api/real-estate/stats",
} as const;

// ============================================================================
// Cache Tags
// ============================================================================

export const REAL_ESTATE_TAGS = {
  PROPERTIES: "real-estate:properties",
  ACQUISITIONS: "real-estate:acquisitions",
  DISPOSALS: "real-estate:disposals",
  OUTGRANTS: "real-estate:outgrants",
  ENCROACHMENTS: "real-estate:encroachments",
  RELOCATIONS: "real-estate:relocations",
  AUDIT_ITEMS: "real-estate:audit-items",
  SOLICITATIONS: "real-estate:solicitations",
  COST_SHARES: "real-estate:cost-shares",
  UTILIZATION: "real-estate:utilization",
  STATS: "real-estate:stats",
} as const;

// ============================================================================
// Mock Data (Remove in production - connect to real API)
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 15);

const mockProperties: RealEstateProperty[] = [
  {
    id: generateId(),
    name: "Federal Building A",
    address: "123 Government Way",
    city: "Washington",
    state: "DC",
    zipCode: "20001",
    country: "USA",
    propertyType: "Building",
    status: "Active",
    squareFootage: 150000,
    currentValue: 45000000,
    acquisitionDate: "2015-06-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Research Facility B",
    address: "456 Science Blvd",
    city: "Bethesda",
    state: "MD",
    zipCode: "20892",
    country: "USA",
    propertyType: "Facility",
    status: "Active",
    squareFootage: 85000,
    currentValue: 28000000,
    acquisitionDate: "2018-03-22",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "Land Parcel C",
    address: "789 Reserve Rd",
    city: "Arlington",
    state: "VA",
    zipCode: "22201",
    country: "USA",
    propertyType: "Land",
    status: "Pending",
    squareFootage: 500000,
    currentValue: 12000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockAcquisitions: RealEstateAcquisition[] = [
  {
    id: generateId(),
    propertyName: "Downtown Office Complex",
    address: "100 Main Street, Washington, DC",
    propertyType: "Building",
    status: "Due Diligence",
    askingPrice: 35000000,
    offeredPrice: 32000000,
    seller: "Private Holdings LLC",
    targetCloseDate: "2026-03-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    propertyName: "Industrial Warehouse",
    address: "500 Logistics Way, Baltimore, MD",
    propertyType: "Facility",
    status: "Prospecting",
    askingPrice: 8500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockDisposals: RealEstateDisposal[] = [
  {
    id: generateId(),
    propertyId: "prop-001",
    propertyName: "Surplus Building D",
    disposalType: "Sale",
    status: "In Progress",
    reason: "Building no longer meets operational needs and requires significant maintenance",
    estimatedValue: 2500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockOutgrants: RealEstateOutgrant[] = [
  {
    id: generateId(),
    propertyId: "prop-001",
    propertyName: "Federal Building A - Suite 500",
    grantType: "Lease",
    grantee: "Tech Solutions Inc.",
    status: "Active",
    startDate: "2024-01-01",
    endDate: "2029-01-01",
    monthlyRent: 15000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockEncroachments: RealEstateEncroachment[] = [
  {
    id: generateId(),
    propertyId: "prop-002",
    propertyName: "Research Facility B",
    encroachmentType: "Fence",
    status: "Under Review",
    description: "Neighboring property has erected a fence that extends 3 feet onto federal land",
    discoveredDate: "2025-11-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockRelocations: RealEstateRelocation[] = [
  {
    id: generateId(),
    fromPropertyId: "prop-003",
    fromPropertyName: "Old Administrative Building",
    toPropertyName: "Federal Building A",
    relocationType: "Department",
    status: "Planning",
    scheduledDate: "2026-06-01",
    estimatedCost: 250000,
    coordinator: "John Smith",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockAuditItems: RealEstateAuditItem[] = [
  {
    id: generateId(),
    propertyId: "prop-001",
    propertyName: "Federal Building A",
    auditType: "Financial",
    status: "Ready",
    lastAuditDate: "2025-06-15",
    nextAuditDate: "2026-06-15",
    score: 92,
    checklistItems: ["Financial records", "Asset inventory", "Lease agreements"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    propertyId: "prop-002",
    propertyName: "Research Facility B",
    auditType: "Compliance",
    status: "Needs Attention",
    lastAuditDate: "2025-03-10",
    nextAuditDate: "2026-03-10",
    score: 78,
    findings: "Missing environmental compliance documentation",
    checklistItems: ["Compliance certificates", "Safety inspections", "Environmental reports"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockSolicitations: RealEstateSolicitation[] = [
  {
    id: generateId(),
    title: "Office Space Renovation RFP",
    solicitationType: "RFP",
    status: "Open",
    description: "Request for proposals for renovation of 3rd floor office space",
    dueDate: "2026-02-15",
    estimatedValue: 500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockCostShares: RealEstateCostShare[] = [
  {
    id: generateId(),
    propertyId: "prop-001",
    propertyName: "Federal Building A",
    agreementType: "Utility Share",
    parties: ["Department of Energy", "General Services Administration"],
    sharePercentages: { "Department of Energy": 60, "General Services Administration": 40 },
    effectiveDate: "2024-01-01",
    expirationDate: "2026-12-31",
    billingFrequency: "Monthly",
    status: "Active",
    totalAmount: 120000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockUtilization: RealEstateUtilization[] = [
  {
    id: generateId(),
    propertyId: "prop-001",
    propertyName: "Federal Building A",
    primaryUse: "Administrative",
    utilizationRate: 85.5,
    totalCapacity: 500,
    currentOccupancy: 427,
    lastAssessmentDate: "2025-12-01",
    departments: ["HR", "Finance", "Operations"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    propertyId: "prop-002",
    propertyName: "Research Facility B",
    primaryUse: "Research & Development",
    utilizationRate: 62.3,
    totalCapacity: 200,
    currentOccupancy: 125,
    lastAssessmentDate: "2025-11-15",
    departments: ["R&D", "Testing"],
    recommendations: "Consider consolidating departments or subleasing unused space",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// Data Access Functions
// ============================================================================

/**
 * Get portfolio statistics
 */
export async function getPortfolioStats(): Promise<PortfolioStats> {
  try {
    return await ServerAPI.get<PortfolioStats>(REAL_ESTATE_ENDPOINTS.STATS, {
      tags: [REAL_ESTATE_TAGS.STATS],
      revalidate: 300,
    });
  } catch {
    return {
      totalProperties: mockProperties.length,
      totalValue: mockProperties.reduce((sum, p) => sum + (p.currentValue || 0), 0),
      activeProperties: mockProperties.filter((p) => p.status === "Active").length,
      pendingAcquisitions: mockAcquisitions.filter(
        (a) => a.status === "Prospecting" || a.status === "Under Contract" || a.status === "Due Diligence"
      ).length,
      pendingDisposals: mockDisposals.filter((d) => d.status === "Pending" || d.status === "In Progress").length,
      activeEncroachments: mockEncroachments.filter((e) => e.status === "Active" || e.status === "Under Review")
        .length,
      avgUtilizationRate:
        mockUtilization.reduce((sum, u) => sum + u.utilizationRate, 0) / (mockUtilization.length || 1),
      totalSquareFootage: mockProperties.reduce((sum, p) => sum + (p.squareFootage || 0), 0),
      totalAcreage: Math.round(
        mockProperties.reduce((sum, p) => sum + (p.squareFootage || 0), 0) / 43560
      ),
    };
  }
}

/**
 * Get all properties
 */
export async function getAllProperties(): Promise<RealEstateProperty[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateProperty[] }>(
      REAL_ESTATE_ENDPOINTS.PROPERTIES,
      {
        tags: [REAL_ESTATE_TAGS.PROPERTIES],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockProperties;
  }
}

/**
 * Get property by ID
 */
export async function getPropertyById(id: string): Promise<RealEstateProperty | null> {
  try {
    return await ServerAPI.get<RealEstateProperty>(
      `${REAL_ESTATE_ENDPOINTS.PROPERTIES}/${id}`,
      {
        tags: [REAL_ESTATE_TAGS.PROPERTIES],
      }
    );
  } catch {
    return mockProperties.find((p) => p.id === id) || null;
  }
}

/**
 * Get all acquisitions
 */
export async function getAcquisitions(): Promise<RealEstateAcquisition[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateAcquisition[] }>(
      REAL_ESTATE_ENDPOINTS.ACQUISITIONS,
      {
        tags: [REAL_ESTATE_TAGS.ACQUISITIONS],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockAcquisitions;
  }
}

/**
 * Get all disposals
 */
export async function getDisposals(): Promise<RealEstateDisposal[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateDisposal[] }>(
      REAL_ESTATE_ENDPOINTS.DISPOSALS,
      {
        tags: [REAL_ESTATE_TAGS.DISPOSALS],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockDisposals;
  }
}

/**
 * Get all outgrants
 */
export async function getOutgrants(): Promise<RealEstateOutgrant[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateOutgrant[] }>(
      REAL_ESTATE_ENDPOINTS.OUTGRANTS,
      {
        tags: [REAL_ESTATE_TAGS.OUTGRANTS],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockOutgrants;
  }
}

/**
 * Get all encroachments
 */
export async function getEncroachments(): Promise<RealEstateEncroachment[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateEncroachment[] }>(
      REAL_ESTATE_ENDPOINTS.ENCROACHMENTS,
      {
        tags: [REAL_ESTATE_TAGS.ENCROACHMENTS],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockEncroachments;
  }
}

/**
 * Get all relocations
 */
export async function getRelocations(): Promise<RealEstateRelocation[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateRelocation[] }>(
      REAL_ESTATE_ENDPOINTS.RELOCATIONS,
      {
        tags: [REAL_ESTATE_TAGS.RELOCATIONS],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockRelocations;
  }
}

/**
 * Get all audit items
 */
export async function getAuditItems(): Promise<RealEstateAuditItem[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateAuditItem[] }>(
      REAL_ESTATE_ENDPOINTS.AUDIT_ITEMS,
      {
        tags: [REAL_ESTATE_TAGS.AUDIT_ITEMS],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockAuditItems;
  }
}

/**
 * Get all solicitations
 */
export async function getSolicitations(): Promise<RealEstateSolicitation[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateSolicitation[] }>(
      REAL_ESTATE_ENDPOINTS.SOLICITATIONS,
      {
        tags: [REAL_ESTATE_TAGS.SOLICITATIONS],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockSolicitations;
  }
}

/**
 * Get all cost shares
 */
export async function getCostShares(): Promise<RealEstateCostShare[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateCostShare[] }>(
      REAL_ESTATE_ENDPOINTS.COST_SHARES,
      {
        tags: [REAL_ESTATE_TAGS.COST_SHARES],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockCostShares;
  }
}

/**
 * Get all utilization records
 */
export async function getUtilization(): Promise<RealEstateUtilization[]> {
  try {
    const response = await ServerAPI.get<{ data: RealEstateUtilization[] }>(
      REAL_ESTATE_ENDPOINTS.UTILIZATION,
      {
        tags: [REAL_ESTATE_TAGS.UTILIZATION],
        revalidate: 60,
      }
    );
    return response.data || [];
  } catch {
    return mockUtilization;
  }
}

// ============================================================================
// Mutation Functions (for Server Actions)
// ============================================================================

export async function createProperty(
  data: Omit<RealEstateProperty, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateProperty> {
  return ServerAPI.post<RealEstateProperty>(REAL_ESTATE_ENDPOINTS.PROPERTIES, data);
}

export async function updateProperty(
  id: string,
  data: Partial<RealEstateProperty>
): Promise<RealEstateProperty> {
  return ServerAPI.patch<RealEstateProperty>(
    `${REAL_ESTATE_ENDPOINTS.PROPERTIES}/${id}`,
    data
  );
}

export async function deleteProperty(id: string): Promise<void> {
  return ServerAPI.delete(`${REAL_ESTATE_ENDPOINTS.PROPERTIES}/${id}`);
}

export async function createAcquisition(
  data: Omit<RealEstateAcquisition, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateAcquisition> {
  return ServerAPI.post<RealEstateAcquisition>(REAL_ESTATE_ENDPOINTS.ACQUISITIONS, data);
}

export async function updateAcquisition(
  id: string,
  data: Partial<RealEstateAcquisition>
): Promise<RealEstateAcquisition> {
  return ServerAPI.patch<RealEstateAcquisition>(
    `${REAL_ESTATE_ENDPOINTS.ACQUISITIONS}/${id}`,
    data
  );
}

export async function createDisposal(
  data: Omit<RealEstateDisposal, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateDisposal> {
  return ServerAPI.post<RealEstateDisposal>(REAL_ESTATE_ENDPOINTS.DISPOSALS, data);
}

export async function updateDisposal(
  id: string,
  data: Partial<RealEstateDisposal>
): Promise<RealEstateDisposal> {
  return ServerAPI.patch<RealEstateDisposal>(
    `${REAL_ESTATE_ENDPOINTS.DISPOSALS}/${id}`,
    data
  );
}

export async function createOutgrant(
  data: Omit<RealEstateOutgrant, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateOutgrant> {
  return ServerAPI.post<RealEstateOutgrant>(REAL_ESTATE_ENDPOINTS.OUTGRANTS, data);
}

export async function createEncroachment(
  data: Omit<RealEstateEncroachment, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateEncroachment> {
  return ServerAPI.post<RealEstateEncroachment>(REAL_ESTATE_ENDPOINTS.ENCROACHMENTS, data);
}

export async function updateEncroachment(
  id: string,
  data: Partial<RealEstateEncroachment>
): Promise<RealEstateEncroachment> {
  return ServerAPI.patch<RealEstateEncroachment>(
    `${REAL_ESTATE_ENDPOINTS.ENCROACHMENTS}/${id}`,
    data
  );
}

export async function createRelocation(
  data: Omit<RealEstateRelocation, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateRelocation> {
  return ServerAPI.post<RealEstateRelocation>(REAL_ESTATE_ENDPOINTS.RELOCATIONS, data);
}

export async function createSolicitation(
  data: Omit<RealEstateSolicitation, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateSolicitation> {
  return ServerAPI.post<RealEstateSolicitation>(REAL_ESTATE_ENDPOINTS.SOLICITATIONS, data);
}

export async function createCostShare(
  data: Omit<RealEstateCostShare, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateCostShare> {
  return ServerAPI.post<RealEstateCostShare>(REAL_ESTATE_ENDPOINTS.COST_SHARES, data);
}

export async function updateUtilization(
  id: string,
  data: Partial<RealEstateUtilization>
): Promise<RealEstateUtilization> {
  return ServerAPI.patch<RealEstateUtilization>(
    `${REAL_ESTATE_ENDPOINTS.UTILIZATION}/${id}`,
    data
  );
}

export async function createUtilization(
  data: Omit<RealEstateUtilization, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateUtilization> {
  return ServerAPI.post<RealEstateUtilization>(REAL_ESTATE_ENDPOINTS.UTILIZATION, data);
}

export async function createAuditItem(
  data: Omit<RealEstateAuditItem, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateAuditItem> {
  return ServerAPI.post<RealEstateAuditItem>(REAL_ESTATE_ENDPOINTS.AUDIT_ITEMS, data);
}

export async function updateAuditItem(
  id: string,
  data: Partial<RealEstateAuditItem>
): Promise<RealEstateAuditItem> {
  return ServerAPI.patch<RealEstateAuditItem>(
    `${REAL_ESTATE_ENDPOINTS.AUDIT_ITEMS}/${id}`,
    data
  );
}
