/**
 * RealEstateDomain Type Definitions
 * All interfaces, types, and enums for Real Estate Asset Management
 */

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
