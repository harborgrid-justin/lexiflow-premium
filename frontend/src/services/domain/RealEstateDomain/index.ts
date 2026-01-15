/**
 * RealEstateDomain - Main Export
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

// Export all types
export type {
  PropertyStatus,
  DisposalStatus,
  EncroachmentStatus,
  AcquisitionStatus,
  OutgrantStatus,
  SolicitationStatus,
  RealEstateProperty,
  RealEstateDisposal,
  RealEstateEncroachment,
  RealEstateAcquisition,
  RealEstateUtilization,
  RealEstateCostShare,
  RealEstateOutgrant,
  RealEstateSolicitation,
  RealEstateRelocation,
  RealEstateAuditItem,
  PortfolioStats,
} from "./types";

// Export query keys
export { REAL_ESTATE_QUERY_KEYS } from "./queryKeys";

// Import all operations
import * as propertyOps from "./property-operations.service";
import * as disposalOps from "./disposal-operations.service";
import * as encroachmentOps from "./encroachment-operations.service";
import * as acquisitionOps from "./acquisition-operations.service";
import * as utilizationOps from "./utilization-operations.service";
import * as costShareOps from "./cost-share-operations.service";
import * as outgrantOps from "./outgrant-operations.service";
import * as financialOps from "./other-financial-operations.service";
import * as auditOps from "./audit-operations.service";

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
  // Property Operations
  getAllProperties: propertyOps.getAllProperties,
  getPropertyById: propertyOps.getPropertyById,
  createProperty: propertyOps.createProperty,
  updateProperty: propertyOps.updateProperty,
  deleteProperty: propertyOps.deleteProperty,

  // Disposal Operations
  getDisposals: disposalOps.getDisposals,
  createDisposal: disposalOps.createDisposal,
  updateDisposal: disposalOps.updateDisposal,
  deleteDisposal: disposalOps.deleteDisposal,

  // Encroachment Operations
  getEncroachments: encroachmentOps.getEncroachments,
  createEncroachment: encroachmentOps.createEncroachment,
  updateEncroachment: encroachmentOps.updateEncroachment,
  resolveEncroachment: encroachmentOps.resolveEncroachment,

  // Acquisition Operations
  getAcquisitions: acquisitionOps.getAcquisitions,
  createAcquisition: acquisitionOps.createAcquisition,
  updateAcquisition: acquisitionOps.updateAcquisition,

  // Utilization Operations
  getUtilization: utilizationOps.getUtilization,
  updateUtilization: utilizationOps.updateUtilization,

  // Cost Share Operations
  getCostShares: costShareOps.getCostShares,
  createCostShare: costShareOps.createCostShare,

  // Outgrant Operations
  getOutgrants: outgrantOps.getOutgrants,
  createOutgrant: outgrantOps.createOutgrant,

  // Solicitation Operations
  getSolicitations: financialOps.getSolicitations,
  createSolicitation: financialOps.createSolicitation,

  // Relocation Operations
  getRelocations: financialOps.getRelocations,
  createRelocation: financialOps.createRelocation,

  // Audit Operations
  getAuditItems: auditOps.getAuditItems,
  updateAuditItem: auditOps.updateAuditItem,

  // Portfolio Statistics
  getPortfolioStats: auditOps.getPortfolioStats,

  // User Management
  getModuleUsers: auditOps.getModuleUsers,
  updateUserPermissions: auditOps.updateUserPermissions,
};

// Export as default for easier import
export default RealEstateService;
