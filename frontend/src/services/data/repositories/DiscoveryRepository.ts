/**
 * Discovery Repository
 * Enterprise-grade repository for discovery management with backend API integration
 *
 * @module DiscoveryRepository
 * @description Facade pattern repository that delegates to focused service modules:
 * - Depositions, ESI sources, productions
 * - Custodians, interviews, legal holds
 * - Discovery requests, privilege logs
 * - Review batches, processing jobs
 * - Examinations, transcripts, vendors
 * - Sanctions and stipulations
 *
 * @security
 * - Input validation delegated to service modules
 * - XSS prevention through type enforcement
 * - Backend-first architecture with secure fallback
 * - Proper error handling and logging
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via DISCOVERY_QUERY_KEYS
 * - Service layer pattern for separation of concerns
 * - Type-safe operations throughout
 */

import type { DiscoveryProcess } from "@/api/discovery/discovery-api";
import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError } from "@/services/core/errors";

// Import all service modules
import {
  collectionService,
  custodianService,
  dashboardService,
  depositionService,
  discoveryRequestService,
  documentReviewService,
  esiSourceService,
  examinationService,
  interviewService,
  legalHoldPrivilegeService,
  petitionService,
  processingJobService,
  productionService,
  reviewBatchService,
  sanctionStipulationService,
  timelineService,
  vendorService,
} from "./discovery/services";

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.depositions.all() });
 * queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.depositions.byCase(caseId) });
 */
export { DISCOVERY_QUERY_KEYS } from "@/services/data/query-keys/DiscoveryQueryKeys";

/**
 * Discovery Repository Class
 * Implements facade pattern to delegate to focused service modules
 */
export class DiscoveryRepository {
  constructor() {
    this.logInitialization();
  }

  /**
   * Log repository initialization mode
   * @private
   */
  private logInitialization(): void {
    const mode = "Backend API (PostgreSQL) with Service Layer";
    console.log(`[DiscoveryRepository] Initialized with ${mode}`);
  }

  // =============================================================================
  // DISCOVERY PROCESS
  // =============================================================================

  /**
   * Get all discovery processes
   * @param filters - Optional filters
   */
  getAll = async (filters?: {
    caseId?: string;
    status?: DiscoveryProcess["status"];
  }): Promise<DiscoveryProcess[]> => {
    try {
      return await discoveryApi.discovery.getAll(filters);
    } catch (error) {
      console.error("[DiscoveryRepository.getAll] Error:", error);
      throw new OperationError("getAll", "Failed to get discovery processes");
    }
  };

  // =============================================================================
  // DASHBOARD & ANALYTICS - Delegated to DashboardService
  // =============================================================================

  getFunnelStats = dashboardService.getFunnelStats.bind(dashboardService);
  getCustodianStats = dashboardService.getCustodianStats.bind(dashboardService);

  // =============================================================================
  // CUSTODIANS - Delegated to CustodianService
  // =============================================================================

  getCustodians = custodianService.getCustodians.bind(custodianService);
  addCustodian = custodianService.addCustodian.bind(custodianService);
  updateCustodian = custodianService.updateCustodian.bind(custodianService);
  deleteCustodian = custodianService.deleteCustodian.bind(custodianService);

  // =============================================================================
  // DEPOSITIONS - Delegated to DepositionService
  // =============================================================================

  getDepositions = depositionService.getDepositions.bind(depositionService);
  addDeposition = depositionService.addDeposition.bind(depositionService);

  // =============================================================================
  // ESI SOURCES - Delegated to ESISourceService
  // =============================================================================

  getESISources = esiSourceService.getESISources.bind(esiSourceService);
  addESISource = esiSourceService.addESISource.bind(esiSourceService);
  updateESISourceStatus =
    esiSourceService.updateESISourceStatus.bind(esiSourceService);

  // =============================================================================
  // PRODUCTIONS - Delegated to ProductionService
  // =============================================================================

  getProductions = productionService.getProductions.bind(productionService);
  createProduction = productionService.createProduction.bind(productionService);
  downloadProduction =
    productionService.downloadProduction.bind(productionService);

  // =============================================================================
  // CUSTODIAN INTERVIEWS - Delegated to InterviewService
  // =============================================================================

  getInterviews = interviewService.getInterviews.bind(interviewService);
  createInterview = interviewService.createInterview.bind(interviewService);

  // =============================================================================
  // DISCOVERY REQUESTS - Delegated to DiscoveryRequestService
  // =============================================================================

  getRequests = discoveryRequestService.getRequests.bind(
    discoveryRequestService
  );
  addRequest = discoveryRequestService.addRequest.bind(discoveryRequestService);
  updateRequestStatus = discoveryRequestService.updateRequestStatus.bind(
    discoveryRequestService
  );

  // =============================================================================
  // REVIEW & PROCESSING - Delegated to ReviewBatchService & ProcessingJobService
  // =============================================================================

  getReviewBatches =
    reviewBatchService.getReviewBatches.bind(reviewBatchService);
  createReviewBatch =
    reviewBatchService.createReviewBatch.bind(reviewBatchService);

  getProcessingJobs =
    processingJobService.getProcessingJobs.bind(processingJobService);
  getProcessingJob =
    processingJobService.getProcessingJob.bind(processingJobService);
  createProcessingJob =
    processingJobService.createProcessingJob.bind(processingJobService);
  updateProcessingJob =
    processingJobService.updateProcessingJob.bind(processingJobService);
  deleteProcessingJob =
    processingJobService.deleteProcessingJob.bind(processingJobService);

  // =============================================================================
  // DOCUMENT REVIEW - Delegated to DocumentReviewService
  // =============================================================================

  getReviewDocuments = documentReviewService.getReviewDocuments.bind(
    documentReviewService
  );
  updateDocumentCoding = documentReviewService.updateDocumentCoding.bind(
    documentReviewService
  );

  // =============================================================================
  // EXAMINATIONS & TRANSCRIPTS - Delegated to ExaminationService
  // =============================================================================

  getExaminations = examinationService.getExaminations.bind(examinationService);
  addExamination = examinationService.addExamination.bind(examinationService);
  getTranscripts = examinationService.getTranscripts.bind(examinationService);
  addTranscript = examinationService.addTranscript.bind(examinationService);

  // =============================================================================
  // VENDORS & REPORTERS - Delegated to VendorService
  // =============================================================================

  getVendors = vendorService.getVendors.bind(vendorService);
  addVendor = vendorService.addVendor.bind(vendorService);
  getReporters = vendorService.getReporters.bind(vendorService);

  // =============================================================================
  // SANCTIONS & STIPULATIONS - Delegated to SanctionStipulationService
  // =============================================================================

  getSanctions = sanctionStipulationService.getSanctions.bind(
    sanctionStipulationService
  );
  addSanctionMotion = sanctionStipulationService.addSanctionMotion.bind(
    sanctionStipulationService
  );
  getStipulations = sanctionStipulationService.getStipulations.bind(
    sanctionStipulationService
  );
  addStipulation = sanctionStipulationService.addStipulation.bind(
    sanctionStipulationService
  );

  // =============================================================================
  // RULE 27 PETITIONS - Delegated to PetitionService
  // =============================================================================

  getPetitions = petitionService.getPetitions.bind(petitionService);

  // =============================================================================
  // LEGAL HOLDS & PRIVILEGE LOG - Delegated to LegalHoldPrivilegeService
  // =============================================================================

  getLegalHolds = legalHoldPrivilegeService.getLegalHolds.bind(
    legalHoldPrivilegeService
  );
  getLegalHoldsEnhanced = legalHoldPrivilegeService.getLegalHoldsEnhanced.bind(
    legalHoldPrivilegeService
  );
  getPrivilegeLog = legalHoldPrivilegeService.getPrivilegeLog.bind(
    legalHoldPrivilegeService
  );
  getPrivilegeLogEnhanced =
    legalHoldPrivilegeService.getPrivilegeLogEnhanced.bind(
      legalHoldPrivilegeService
    );

  createLegalHold = legalHoldPrivilegeService.createLegalHold.bind(legalHoldPrivilegeService);
  sendReminder = legalHoldPrivilegeService.sendReminder.bind(legalHoldPrivilegeService);

  // =============================================================================
  // UTILITY OPERATIONS - Delegated to TimelineService & CollectionService
  // =============================================================================

  syncDeadlines = timelineService.syncDeadlines.bind(timelineService);
  startCollection = collectionService.startCollection.bind(collectionService);

  // =============================================================================
  // COLLECTIONS MANAGEMENT - Delegated to CollectionService
  // =============================================================================

  getCollections = collectionService.getCollections.bind(collectionService);
  getCollection = collectionService.getCollection.bind(collectionService);
  createCollection = collectionService.createCollection.bind(collectionService);
  updateCollection = collectionService.updateCollection.bind(collectionService);
  deleteCollection = collectionService.deleteCollection.bind(collectionService);

  // =============================================================================
  // TIMELINE - Delegated to TimelineService
  // =============================================================================

  getTimelineEvents = timelineService.getTimelineEvents.bind(timelineService);
}
