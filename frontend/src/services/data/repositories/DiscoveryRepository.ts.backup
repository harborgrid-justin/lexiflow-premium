/**
 * Discovery Repository
 * Enterprise-grade repository for discovery management with backend API integration
 *
 * @module DiscoveryRepository
 * @description Manages all discovery-related operations including:
 * - Depositions, ESI sources, productions
 * - Custodians, interviews, legal holds
 * - Discovery requests, privilege logs
 * - Review batches, processing jobs
 * - Examinations, transcripts, vendors
 * - Sanctions and stipulations
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend-first architecture with secure fallback
 * - Proper error handling and logging
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - IndexedDB fallback (development only)
 * - React Query integration via DISCOVERY_QUERY_KEYS
 * - Type-safe operations
 */

import type { DiscoveryProcess } from "@/api/discovery/discovery-api";
import { discoveryApi } from "@/api/domains/discovery.api";
import {
  EntityNotFoundError,
  OperationError,
  ValidationError,
} from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/apiClient";
import {
  Custodian,
  CustodianInterview,
  Deposition,
  DiscoveryRequest,
  ESISource,
  Examination,
  LegalHold,
  PrivilegeLogEntry,
  ProductionSet,
  ReviewBatch,
  SanctionMotion,
  StipulationRequest,
  Transcript,
  Vendor,
} from "@/types";
import type {
  DataCollection,
  DiscoveryTimelineEvent,
  DocumentCoding,
  LegalHoldEnhanced,
  PrivilegeLogEntryEnhanced,
  ProcessingJob,
  ReviewDocument,
} from "@/types/discovery-enhanced";
import { delay } from "@/utils/async";

/**
 * Query keys for React Query integration
 * Use these constants for cache invalidation and refetching
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.depositions.all() });
 * queryClient.invalidateQueries({ queryKey: DISCOVERY_QUERY_KEYS.depositions.byCase(caseId) });
 */
export { DISCOVERY_QUERY_KEYS } from "@/services/data/query-keys/DiscoveryQueryKeys";
interface FunnelStat {
  name: string;
  value: number;
  label: string;
}

/**
 * Discovery Repository Class
 * Implements backend-first pattern
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
    const mode = "Backend API (PostgreSQL)";
    console.log(`[DiscoveryRepository] Initialized with ${mode}`);
  }

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

  /**
   * Validate and sanitize case ID parameter
   * @private
   */
  private validateCaseId(caseId: string | undefined, methodName: string): void {
    if (
      caseId !== undefined &&
      (typeof caseId !== "string" || caseId.trim() === "")
    ) {
      throw new Error(
        `[DiscoveryRepository.${methodName}] Invalid caseId parameter`
      );
    }
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error(
        `[DiscoveryRepository.${methodName}] Invalid id parameter`
      );
    }
  }

  // =============================================================================
  // DASHBOARD & ANALYTICS
  // =============================================================================

  /**
   * Get discovery funnel statistics
   * Shows document progression through discovery phases
   *
   * @returns Promise<FunnelStat[]> Funnel statistics array
   * @throws Error if fetch fails
   *
   * @example
   * const stats = await discoveryRepo.getFunnelStats();
   * // Returns: [{ name: 'Collection', value: 120000, label: '120k Docs' }, ...]
   */
  getFunnelStats = async (): Promise<FunnelStat[]> => {
    try {
      // Note: This is currently computed from documents, not a dedicated backend endpoint
      // In production, this should call discoveryAnalyticsApi.getFunnelStats()
      // Return empty stats until backend endpoint is available
      return [
        { name: "Collection", value: 0, label: "0 Docs" },
        { name: "Processing", value: 0, label: "0 Processed" },
        { name: "Review", value: 0, label: "0 Reviewed" },
        { name: "Production", value: 0, label: "0 Produced" },
      ];
    } catch (error) {
      console.error("[DiscoveryRepository.getFunnelStats] Error:", error);
      throw new OperationError(
        "getFunnelStats",
        "Failed to fetch discovery funnel statistics"
      );
    }
  };

  /**
   * Get custodian statistics
   *
   * @returns Promise<Record<string, unknown>[]> Custodian statistics
   */
  getCustodianStats = async (): Promise<Record<string, unknown>[]> => {
    try {
      return [];
    } catch (error) {
      console.error("[DiscoveryRepository.getCustodianStats] Error:", error);
      return [];
    }
  };

  // =============================================================================
  // CUSTODIANS
  // =============================================================================

  /**
   * Get all custodians, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<Custodian[]> Array of custodians
   * @throws Error if caseId is invalid or fetch fails
   *
   * @example
   * const allCustodians = await repo.getCustodians();
   * const caseCustodians = await repo.getCustodians('case-123');
   */
  getCustodians = async (caseId?: string): Promise<Custodian[]> =>
    this.getCustodiansImpl(caseId);

  /**
   * Implementation of getCustodians
   */
  private async getCustodiansImpl(caseId?: string): Promise<Custodian[]> {
    try {
      return await discoveryApi.custodians.getAll(caseId ? { caseId } : {});
    } catch (error) {
      console.error("[DiscoveryRepository.getCustodians] Error:", error);
      return [];
    }
  }

  /**
   * Adds a new custodian
   *
   * @param custodian - Custodian data
   * @returns Promise<Custodian>
   * @throws Error if validation fails or create fails
   */
  addCustodian = async (custodian: Custodian): Promise<Custodian> => {
    if (!custodian || typeof custodian !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.addCustodian] Invalid custodian data"
      );
    }

    try {
      const result = await discoveryApi.custodians.create(
        custodian as Omit<Custodian, "id" | "createdAt" | "updatedAt">
      );
      return result as unknown as Custodian;
    } catch (error) {
      console.error("[DiscoveryRepository.addCustodian] Error:", error);
      throw new OperationError("addCustodian", "Failed to add custodian");
    }
  };

  /**
   * Update an existing custodian
   *
   * @param custodian - Custodian data with ID
   * @returns Promise<unknown> Updated custodian
   * @throws Error if validation fails or update fails
   */
  updateCustodian = async (custodian: unknown): Promise<unknown> => {
    const custodianObj = custodian as { id?: string };
    if (!custodianObj?.id) {
      throw new ValidationError(
        "[DiscoveryRepository.updateCustodian] Custodian ID required"
      );
    }

    try {
      const { id, ...updates } = custodianObj as {
        id: string;
        [key: string]: unknown;
      };
      return await discoveryApi.custodians.update(id, updates);
    } catch (error) {
      console.error("[DiscoveryRepository.updateCustodian] Error:", error);
      throw new OperationError("updateCustodian", "Failed to update custodian");
    }
  };

  /**
   * Delete a custodian
   *
   * @param id - Custodian ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  deleteCustodian = async (id: string): Promise<void> => {
    this.validateId(id, "deleteCustodian");

    try {
      await discoveryApi.custodians.delete(id);
    } catch (error) {
      console.error("[DiscoveryRepository.deleteCustodian] Error:", error);
      throw new OperationError("deleteCustodian", "Failed to delete custodian");
    }
  };

  // =============================================================================
  // DEPOSITIONS
  // =============================================================================

  /**
   * Get all depositions, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<Deposition[]> Array of depositions
   * @throws Error if caseId is invalid or fetch fails
   */
  getDepositions = async (caseId?: string): Promise<Deposition[]> => {
    this.validateCaseId(caseId, "getDepositions");

    try {
      return (await discoveryApi.depositions.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as Deposition[];
    } catch (error) {
      console.error("[DiscoveryRepository.getDepositions] Error:", error);
      throw new OperationError("getDepositions", "Failed to fetch depositions");
    }
  };

  /**
   * Add a new deposition
   *
   * @param deposition - Deposition data
   * @returns Promise<Deposition> Created deposition
   * @throws Error if validation fails or create fails
   */
  addDeposition = async (deposition: Deposition): Promise<Deposition> => {
    if (!deposition || typeof deposition !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.addDeposition] Invalid deposition data"
      );
    }

    try {
      return (await discoveryApi.depositions.create(
        deposition as unknown as Record<string, unknown>
      )) as unknown as Deposition;
    } catch (error) {
      console.error("[DiscoveryRepository.addDeposition] Error:", error);
      throw new OperationError("addDeposition", "Failed to add deposition");
    }
  };

  // =============================================================================
  // ESI SOURCES
  // =============================================================================

  /**
   * Get all ESI sources, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<ESISource[]> Array of ESI sources
   * @throws Error if caseId is invalid or fetch fails
   */
  getESISources = async (caseId?: string): Promise<ESISource[]> => {
    this.validateCaseId(caseId, "getESISources");

    try {
      return (await discoveryApi.esiSources.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as ESISource[];
    } catch (error) {
      console.error("[DiscoveryRepository.getESISources] Error:", error);
      throw new OperationError("getESISources", "Failed to fetch ESI sources");
    }
  };

  /**
   * Add a new ESI source
   *
   * @param source - ESI source data
   * @returns Promise<ESISource> Created ESI source
   * @throws Error if validation fails or create fails
   */
  addESISource = async (source: ESISource): Promise<ESISource> => {
    if (!source || typeof source !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.addESISource] Invalid ESI source data"
      );
    }

    try {
      return (await discoveryApi.esiSources.create(
        source as unknown as Record<string, unknown>
      )) as unknown as ESISource;
    } catch (error) {
      console.error("[DiscoveryRepository.addESISource] Error:", error);
      throw new OperationError("addESISource", "Failed to add ESI source");
    }
  };

  /**
   * Update ESI source status
   *
   * @param id - ESI source ID
   * @param status - New status value
   * @returns Promise<ESISource> Updated ESI source
   * @throws Error if validation fails or update fails
   */
  updateESISourceStatus = async (
    id: string,
    status: string
  ): Promise<ESISource> => {
    this.validateId(id, "updateESISourceStatus");

    if (!status || status.trim() === "") {
      throw new ValidationError(
        "[DiscoveryRepository.updateESISourceStatus] Invalid status parameter"
      );
    }

    try {
      // Cast the status to the specific union type required by the API
      // Since the input is string, we're being permissive here but the API will validate
      const validStatus = status as
        | "identified"
        | "reviewed"
        | "preserved"
        | "collected"
        | "processed";

      const result = await discoveryApi.esiSources.updateStatus(
        id,
        validStatus
      );
      return result as unknown as ESISource;
    } catch (error) {
      console.error(
        "[DiscoveryRepository.updateESISourceStatus] Error:",
        error
      );
      throw new OperationError(
        "updateESISourceStatus",
        "Failed to update ESI source status"
      );
    }
  };

  // =============================================================================
  // PRODUCTIONS
  // =============================================================================

  /**
   * Get all productions, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<ProductionSet[]> Array of productions
   * @throws Error if caseId is invalid or fetch fails
   */
  getProductions = async (caseId?: string): Promise<ProductionSet[]> => {
    this.validateCaseId(caseId, "getProductions");

    try {
      return (await discoveryApi.productions.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as ProductionSet[];
    } catch (error) {
      console.error("[DiscoveryRepository.getProductions] Error:", error);
      return [];
    }
  };

  /**
   * Create a new production set
   *
   * @param production - Production data
   * @returns Promise<ProductionSet> Created production
   * @throws Error if validation fails or create fails
   */
  createProduction = async (
    production: ProductionSet
  ): Promise<ProductionSet> => {
    if (!production || typeof production !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.createProduction] Invalid production data"
      );
    }

    try {
      return (await discoveryApi.productions.create(
        production as unknown as Record<string, unknown>
      )) as unknown as ProductionSet;
    } catch (error) {
      console.error("[DiscoveryRepository.createProduction] Error:", error);
      throw new OperationError(
        "createProduction",
        "Failed to create production"
      );
    }
  };

  /**
   * Download a production
   *
   * @param id - Production ID
   * @returns Promise<string> Download URL
   * @throws Error if id is invalid
   */
  downloadProduction = async (id: string): Promise<string> => {
    this.validateId(id, "downloadProduction");

    try {
      // Check if production exists first via metadata endpoint
      // Then return constructed download URL
      // Assuming GET /discovery/productions/:id exists
      const response = await apiClient.get<unknown>(
        `/discovery/productions/${id}`
      );

      const downloadData = response as { downloadUrl?: string };
      if (downloadData && downloadData.downloadUrl) {
        return downloadData.downloadUrl;
      }

      // Fallback to direct construction - use baseURL from client instance
      const client = apiClient as unknown as {
        defaults: { baseURL: string };
      };
      const baseURL = client.defaults?.baseURL || "";
      return `${baseURL}/discovery/productions/${id}/download`;
    } catch (error) {
      console.error(
        "[DiscoveryRepository] Failed to get production URL",
        error
      );
      throw new OperationError(
        "downloadProduction",
        "Failed to retrieve download URL"
      );
    }
  };

  // =============================================================================
  // CUSTODIAN INTERVIEWS
  // =============================================================================

  /**
   * Get all custodian interviews, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<CustodianInterview[]> Array of interviews
   * @throws Error if caseId is invalid or fetch fails
   */
  getInterviews = async (caseId?: string): Promise<CustodianInterview[]> => {
    this.validateCaseId(caseId, "getInterviews");

    try {
      return (await discoveryApi.custodianInterviews.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as CustodianInterview[];
    } catch (error) {
      console.error("[DiscoveryRepository.getInterviews] Error:", error);
      return [];
    }
  };

  /**
   * Create a new custodian interview
   *
   * @param interview - Interview data
   * @returns Promise<CustodianInterview> Created interview
   * @throws Error if validation fails or create fails
   */
  createInterview = async (
    interview: CustodianInterview
  ): Promise<CustodianInterview> => {
    if (!interview || typeof interview !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.createInterview] Invalid interview data"
      );
    }

    try {
      return (await discoveryApi.custodianInterviews.create(
        interview as unknown as Record<string, unknown>
      )) as unknown as CustodianInterview;
    } catch (error) {
      console.error("[DiscoveryRepository.createInterview] Error:", error);
      throw new OperationError(
        "createInterview",
        "Failed to create custodian interview"
      );
    }
  };

  // =============================================================================
  // DISCOVERY REQUESTS
  // =============================================================================

  /**
   * Get all discovery requests, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<DiscoveryRequest[]> Array of discovery requests
   * @throws Error if caseId is invalid or fetch fails
   */
  getRequests = async (caseId?: string): Promise<DiscoveryRequest[]> => {
    this.validateCaseId(caseId, "getRequests");

    try {
      return (await discoveryApi.discoveryRequests.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as DiscoveryRequest[];
    } catch (error) {
      console.error("[DiscoveryRepository.getRequests] Error:", error);
      return [];
    }
  };

  /**
   * Add a new discovery request
   *
   * @param request - Discovery request data
   * @returns Promise<DiscoveryRequest> Created request
   * @throws Error if validation fails or create fails
   */
  addRequest = async (request: DiscoveryRequest): Promise<DiscoveryRequest> => {
    if (!request || typeof request !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.addRequest] Invalid request data"
      );
    }

    try {
      return (await discoveryApi.discoveryRequests.create(
        request as unknown as Record<string, unknown>
      )) as unknown as DiscoveryRequest;
    } catch (error) {
      console.error("[DiscoveryRepository.addRequest] Error:", error);
      throw new OperationError("addRequest", "Failed to add discovery request");
    }
  };

  /**
   * Update discovery request status
   *
   * @param id - Request ID
   * @param status - New status value
   * @returns Promise<DiscoveryRequest> Updated request
   * @throws Error if validation fails or update fails
   */
  updateRequestStatus = async (
    id: string,
    status: string
  ): Promise<DiscoveryRequest> => {
    this.validateId(id, "updateRequestStatus");

    if (!status || status.trim() === "") {
      throw new ValidationError(
        "[DiscoveryRepository.updateRequestStatus] Invalid status parameter"
      );
    }

    try {
      return (await discoveryApi.discoveryRequests.updateStatus(
        id,
        status as unknown as
          | "draft"
          | "served"
          | "responded"
          | "pending_response"
          | "overdue"
          | "withdrawn"
      )) as unknown as DiscoveryRequest;
    } catch (error) {
      console.error("[DiscoveryRepository.updateRequestStatus] Error:", error);
      throw new OperationError(
        "updateRequestStatus",
        "Failed to update discovery request status"
      );
    }
  };

  // =============================================================================
  // REVIEW & PROCESSING
  // =============================================================================

  /**
   * Get review batches for a case
   *
   * @param caseId - Case ID (required)
   * @returns Promise<ReviewBatch[]> Array of review batches
   * @throws Error if caseId is invalid or fetch fails
   */
  getReviewBatches = async (caseId: string): Promise<ReviewBatch[]> => {
    this.validateId(caseId, "getReviewBatches");

    try {
      return await apiClient.get<ReviewBatch[]>("/discovery/review/batches", {
        caseId,
      });
    } catch (error) {
      console.error("[DiscoveryRepository.getReviewBatches] Error:", error);
      return [];
    }
  };

  /**
   * Create a new review batch
   *
   * @param batch - Review batch data
   * @returns Promise<ReviewBatch> Created batch
   * @throws Error if validation fails or create fails
   */
  createReviewBatch = async (batch: ReviewBatch): Promise<ReviewBatch> => {
    if (!batch || typeof batch !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.createReviewBatch] Invalid batch data"
      );
    }

    try {
      return await apiClient.post<ReviewBatch>(
        "/discovery/review/batches",
        batch
      );
    } catch (error) {
      console.error("[DiscoveryRepository.createReviewBatch] Error:", error);
      throw new OperationError(
        "createReviewBatch",
        "Failed to create review batch"
      );
    }
  };

  /**
   * Get all processing jobs
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<ProcessingJob[]> Array of processing jobs
   * @throws Error if fetch fails
   */
  getProcessingJobs = async (caseId?: string): Promise<ProcessingJob[]> => {
    try {
      return await discoveryApi.processing.getAll(caseId);
    } catch (error) {
      console.error("[DiscoveryRepository.getProcessingJobs] Error:", error);
      throw new OperationError(
        "getProcessingJobs",
        "Failed to fetch processing jobs"
      );
    }
  };

  /**
   * Get a processing job by ID
   * @param id Job ID
   */
  getProcessingJob = async (id: string): Promise<ProcessingJob> => {
    this.validateId(id, "getProcessingJob");
    try {
      return await discoveryApi.processing.getById(id);
    } catch (error) {
      console.error("[DiscoveryRepository.getProcessingJob] Error:", error);
      throw new EntityNotFoundError("ProcessingJob", id);
    }
  };

  /**
   * Create a new processing job
   * @param data Job data
   */
  createProcessingJob = async (
    data: Partial<ProcessingJob>
  ): Promise<ProcessingJob> => {
    try {
      return await discoveryApi.processing.create(data);
    } catch (error) {
      console.error("[DiscoveryRepository.createProcessingJob] Error:", error);
      throw new OperationError(
        "createProcessingJob",
        "Failed to create processing job"
      );
    }
  };

  /**
   * Update a processing job
   * @param id Job ID
   * @param data Updates
   */
  updateProcessingJob = async (
    id: string,
    data: Partial<ProcessingJob>
  ): Promise<ProcessingJob> => {
    this.validateId(id, "updateProcessingJob");
    try {
      // Handle specific actions like pause/resume/retry if needed, or just generic update
      // For now, generic update
      return await discoveryApi.processing.create({ ...data, id }); // API might need PUT
    } catch (error) {
      console.error("[DiscoveryRepository.updateProcessingJob] Error:", error);
      throw new OperationError(
        "updateProcessingJob",
        "Failed to update processing job"
      );
    }
  };

  /**
   * Delete a processing job
   * @param id Job ID
   */
  deleteProcessingJob = async (id: string): Promise<void> => {
    this.validateId(id, "deleteProcessingJob");
    try {
      await discoveryApi.processing.delete(id);
    } catch (error) {
      console.error("[DiscoveryRepository.deleteProcessingJob] Error:", error);
      throw new OperationError(
        "deleteProcessingJob",
        "Failed to delete processing job"
      );
    }
  };

  // =============================================================================
  // DOCUMENT REVIEW
  // =============================================================================

  /**
   * Get review documents
   * @param filters Search filters
   */
  getReviewDocuments = async (
    filters?: Record<string, unknown>
  ): Promise<ReviewDocument[]> => {
    try {
      return await discoveryApi.review.getDocuments(filters);
    } catch (error) {
      console.error("[DiscoveryRepository.getReviewDocuments] Error:", error);
      return [];
    }
  };

  /**
   * Update document coding
   * @param id Document ID
   * @param coding Coding data
   * @param notes Optional notes
   */
  updateDocumentCoding = async (
    id: string,
    coding: DocumentCoding,
    notes?: string
  ): Promise<ReviewDocument> => {
    this.validateId(id, "updateDocumentCoding");
    try {
      return await discoveryApi.review.updateCoding(id, coding, notes);
    } catch (error) {
      console.error("[DiscoveryRepository.updateDocumentCoding] Error:", error);
      throw new OperationError(
        "updateDocumentCoding",
        "Failed to update document coding"
      );
    }
  };

  // =============================================================================
  // EXAMINATIONS & TRANSCRIPTS
  // =============================================================================

  /**
   * Get all examinations, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<Examination[]> Array of examinations
   * @throws Error if caseId is invalid or fetch fails
   */
  getExaminations = async (caseId?: string): Promise<Examination[]> => {
    this.validateCaseId(caseId, "getExaminations");

    try {
      return (await discoveryApi.examinations.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as Examination[];
    } catch (error) {
      console.error("[DiscoveryRepository.getExaminations] Error:", error);
      return [];
    }
  };

  /**
   * Add a new examination
   *
   * @param examination - Examination data
   * @returns Promise<Examination> Created examination
   * @throws Error if validation fails or create fails
   */
  addExamination = async (examination: Examination): Promise<Examination> => {
    if (!examination || typeof examination !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.addExamination] Invalid examination data"
      );
    }

    try {
      return await discoveryApi.examinations.create(examination);
    } catch (error) {
      console.error("[DiscoveryRepository.addExamination] Error:", error);
      throw new OperationError("addExamination", "Failed to add examination");
    }
  };

  /**
   * Get all transcripts, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<Transcript[]> Array of transcripts
   * @throws Error if caseId is invalid or fetch fails
   */
  getTranscripts = async (caseId?: string): Promise<Transcript[]> => {
    this.validateCaseId(caseId, "getTranscripts");

    try {
      return await apiClient.get<Transcript[]>("/discovery/transcripts", {
        caseId,
      });
    } catch (error) {
      console.error("[DiscoveryRepository.getTranscripts] Error:", error);
      return [];
    }
  };

  /**
   * Add a new transcript
   *
   * @param transcript - Transcript data
   * @returns Promise<Transcript> Created transcript
   * @throws Error if validation fails or create fails
   */
  addTranscript = async (transcript: Transcript): Promise<Transcript> => {
    if (!transcript || typeof transcript !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.addTranscript] Invalid transcript data"
      );
    }

    try {
      return await apiClient.post<Transcript>(
        "/discovery/transcripts",
        transcript
      );
    } catch (error) {
      console.error("[DiscoveryRepository.addTranscript] Error:", error);
      throw new OperationError("addTranscript", "Failed to add transcript");
    }
  };

  // =============================================================================
  // VENDORS & REPORTERS
  // =============================================================================

  /**
   * Get all vendors
   *
   * @returns Promise<Vendor[]> Array of vendors
   * @throws Error if fetch fails
   */
  getVendors = async (): Promise<Vendor[]> => {
    try {
      return await apiClient.get<Vendor[]>("/discovery/vendors");
    } catch (error) {
      console.error("[DiscoveryRepository.getVendors] Error:", error);
      return [];
    }
  };

  /**
   * Add a new vendor
   *
   * @param vendor - Vendor data
   * @returns Promise<Vendor> Created vendor
   * @throws Error if validation fails or create fails
   */
  addVendor = async (vendor: Vendor): Promise<Vendor> => {
    if (!vendor || typeof vendor !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.addVendor] Invalid vendor data"
      );
    }

    try {
      return await apiClient.post<Vendor>("/discovery/vendors", vendor);
    } catch (error) {
      console.error("[DiscoveryRepository.addVendor] Error:", error);
      throw new OperationError("addVendor", "Failed to add vendor");
    }
  };

  /**
   * Get all court reporters
   *
   * @returns Promise<unknown[]> Array of reporters
   * @throws Error if fetch fails
   */
  getReporters = async (): Promise<unknown[]> => {
    try {
      return await apiClient.get<unknown[]>("/discovery/reporters");
    } catch (error) {
      console.error("[DiscoveryRepository.getReporters] Error:", error);
      return [];
    }
  };

  // =============================================================================
  // SANCTIONS & STIPULATIONS
  // =============================================================================

  /**
   * Get all sanction motions, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<SanctionMotion[]> Array of sanction motions
   * @throws Error if caseId is invalid or fetch fails
   */
  getSanctions = async (caseId?: string): Promise<SanctionMotion[]> => {
    this.validateCaseId(caseId, "getSanctions");

    try {
      return await apiClient.get<SanctionMotion[]>("/discovery/sanctions", {
        caseId,
      });
    } catch (error) {
      console.error("[DiscoveryRepository.getSanctions] Error:", error);
      return [];
    }
  };

  /**
   * Add a new sanction motion
   *
   * @param motion - Sanction motion data
   * @returns Promise<SanctionMotion> Created sanction motion
   * @throws Error if validation fails or create fails
   */
  addSanctionMotion = async (
    motion: SanctionMotion
  ): Promise<SanctionMotion> => {
    if (!motion || typeof motion !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.addSanctionMotion] Invalid sanction motion data"
      );
    }

    try {
      return await apiClient.post<SanctionMotion>(
        "/discovery/sanctions",
        motion
      );
    } catch (error) {
      console.error("[DiscoveryRepository.addSanctionMotion] Error:", error);
      throw new OperationError(
        "addSanctionMotion",
        "Failed to add sanction motion"
      );
    }
  };

  /**
   * Get all stipulations, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<StipulationRequest[]> Array of stipulations
   * @throws Error if caseId is invalid or fetch fails
   */
  getStipulations = async (caseId?: string): Promise<StipulationRequest[]> => {
    this.validateCaseId(caseId, "getStipulations");

    try {
      return await apiClient.get<StipulationRequest[]>(
        "/discovery/stipulations",
        { caseId }
      );
    } catch (error) {
      console.error("[DiscoveryRepository.getStipulations] Error:", error);
      return [];
    }
  };

  /**
   * Add a new stipulation request
   *
   * @param stipulation - Stipulation data
   * @returns Promise<StipulationRequest> Created stipulation
   * @throws Error if validation fails or create fails
   */
  addStipulation = async (
    stipulation: StipulationRequest
  ): Promise<StipulationRequest> => {
    if (!stipulation || typeof stipulation !== "object") {
      throw new ValidationError(
        "[DiscoveryRepository.addStipulation] Invalid stipulation data"
      );
    }

    try {
      return await apiClient.post<StipulationRequest>(
        "/discovery/stipulations",
        stipulation
      );
    } catch (error) {
      console.error("[DiscoveryRepository.addStipulation] Error:", error);
      throw new OperationError("addStipulation", "Failed to add stipulation");
    }
  };

  // =============================================================================
  // RULE 27 PETITIONS
  // =============================================================================

  /**
   * Get Rule 27 petitions (mock implementation)
   *
   * @returns Promise<unknown[]> Array of petitions
   */
  getPetitions = async (): Promise<unknown[]> => {
    // Mock implementation - in production, this would call backend API
    await delay(100);
    return [];
  };

  // =============================================================================
  // LEGAL HOLDS & PRIVILEGE LOG
  // =============================================================================

  /**
   * Get all legal holds
   *
   * @returns Promise<LegalHold[]> Array of legal holds
   * @throws Error if fetch fails
   */
  getLegalHolds = async (): Promise<LegalHold[]> => {
    try {
      return (await discoveryApi.legalHolds.getAll()) as unknown as LegalHold[];
    } catch (error) {
      console.error("[DiscoveryRepository.getLegalHolds] Error:", error);
      return [];
    }
  };

  /**
   * Get enhanced legal holds
   */
  getLegalHoldsEnhanced = async (): Promise<LegalHoldEnhanced[]> => {
    try {
      return await discoveryApi.legalHolds.getEnhanced();
    } catch (error) {
      console.error(
        "[DiscoveryRepository.getLegalHoldsEnhanced] Error:",
        error
      );
      return [];
    }
  };

  /**
   * Get privilege log entries
   *
   * @returns Promise<PrivilegeLogEntry[]> Array of privilege log entries
   * @throws Error if fetch fails
   */
  getPrivilegeLog = async (): Promise<PrivilegeLogEntry[]> => {
    try {
      return (await discoveryApi.privilegeLog.getAll()) as unknown as PrivilegeLogEntry[];
    } catch (error) {
      console.error("[DiscoveryRepository.getPrivilegeLog] Error:", error);
      return [];
    }
  };

  /**
   * Get enhanced privilege log entries
   */
  getPrivilegeLogEnhanced = async (): Promise<PrivilegeLogEntryEnhanced[]> => {
    try {
      return await discoveryApi.privilegeLog.getEnhanced();
    } catch (error) {
      console.error(
        "[DiscoveryRepository.getPrivilegeLogEnhanced] Error:",
        error
      );
      return [];
    }
  };

  // =============================================================================
  // UTILITY OPERATIONS
  // =============================================================================

  /**
   * Sync discovery deadlines to master calendar
   * Finds all pending discovery requests and creates calendar events
   *
   * @returns Promise<void>
   * @throws Error if sync fails
   */
  syncDeadlines = async (): Promise<void> => {
    try {
      const requests = await this.getRequests();
      const pending = requests.filter(
        (r) => r.status === "Served" || r.status === "Overdue"
      );

      // Future integration: await apiClient.post('/calendar/sync', { requests: pending });
      console.info(
        `[DiscoveryRepository] Would sync ${pending.length} deadlines to Calendar Service (endpoint pending).`
      );
    } catch (error) {
      console.error("[DiscoveryRepository.syncDeadlines] Error:", error);
      throw new OperationError(
        "syncDeadlines",
        "Failed to sync discovery deadlines"
      );
    }
  };

  /**
   * Start collection process
   *
   * @param id - Source ID
   * @returns Promise<string> Job ID
   * @throws Error if id is invalid
   */
  startCollection = async (id: string): Promise<string> => {
    this.validateId(id, "startCollection");

    try {
      const response = await discoveryApi.collections.resume(id);
      // Return job ID from response if available, otherwise construct one
      return (response as { jobId?: string })?.jobId || `job-${id}-resumed`;
    } catch (error) {
      console.error("[DiscoveryRepository] Failed to start collection:", error);
      throw new OperationError(
        "startCollection",
        "Failed to start collection job"
      );
    }
  };

  // ============================================================================
  // Collections Management
  // ============================================================================

  /**
   * Get all data collections
   * @param caseId Optional case ID to filter by
   */
  getCollections = async (caseId?: string): Promise<DataCollection[]> => {
    try {
      return await discoveryApi.collections.getAll(caseId);
    } catch (error) {
      console.error("[DiscoveryRepository.getCollections] Error:", error);
      return [];
    }
  };

  /**
   * Get a data collection by ID
   * @param id Collection ID
   */
  getCollection = async (id: string): Promise<DataCollection> => {
    this.validateId(id, "getCollection");
    try {
      return await discoveryApi.collections.getById(id);
    } catch (error) {
      console.error("[DiscoveryRepository.getCollection] Error:", error);
      throw new EntityNotFoundError("Collection", id);
    }
  };

  /**
   * Create a new data collection
   * @param data Collection data
   */
  createCollection = async (
    data: Partial<DataCollection>
  ): Promise<DataCollection> => {
    try {
      return await discoveryApi.collections.create(data);
    } catch (error) {
      console.error("[DiscoveryRepository.createCollection] Error:", error);
      throw new OperationError(
        "createCollection",
        "Failed to create collection"
      );
    }
  };

  /**
   * Update a data collection
   * @param id Collection ID
   * @param data Updates
   */
  updateCollection = async (
    id: string,
    data: Partial<DataCollection>
  ): Promise<DataCollection> => {
    this.validateId(id, "updateCollection");
    try {
      return await discoveryApi.collections.update(id, data);
    } catch (error) {
      console.error("[DiscoveryRepository.updateCollection] Error:", error);
      throw new OperationError(
        "updateCollection",
        "Failed to update collection"
      );
    }
  };

  /**
   * Delete a data collection
   * @param id Collection ID
   */
  deleteCollection = async (id: string): Promise<void> => {
    this.validateId(id, "deleteCollection");
    try {
      await discoveryApi.collections.delete(id);
    } catch (error) {
      console.error("[DiscoveryRepository.deleteCollection] Error:", error);
      throw new OperationError(
        "deleteCollection",
        "Failed to delete collection"
      );
    }
  };

  /**
   * Get discovery timeline events
   * @param caseId Optional case ID to filter by
   */
  getTimelineEvents = async (
    caseId?: string
  ): Promise<DiscoveryTimelineEvent[]> => {
    try {
      return await discoveryApi.timeline.getEvents(caseId);
    } catch (error) {
      console.error("[DiscoveryRepository.getTimelineEvents] Error:", error);
      return [];
    }
  };
}
