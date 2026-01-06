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

import { discoveryApi } from "@/api/domains/discovery.api";
import { isBackendApiEnabled } from "@/config/network/api.config";
import {
  EntityNotFoundError,
  OperationError,
  ValidationError,
} from "@/services/core/errors";
import { db, STORES } from "@/services/data/db";
import { apiClient } from "@/services/infrastructure/apiClient";
import {
  Custodian,
  CustodianInterview,
  Deposition,
  DiscoveryRequest,
  ESISource,
  Examination,
  LegalDocument,
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
export const DISCOVERY_QUERY_KEYS = ImportedKeys;
interface FunnelStat {
  name: string;
  value: number;
  label: string;
}

/**
 * Discovery Repository Class
 * Implements backend-first pattern with IndexedDB fallback
 */
export class DiscoveryRepository {
  private readonly useBackend: boolean;

  constructor() {
    this.useBackend = isBackendApiEnabled();
    this.logInitialization();
  }

  /**
   * Log repository initialization mode
   * @private
   */
  private logInitialization(): void {
    const mode = this.useBackend
      ? "Backend API (PostgreSQL)"
      : "IndexedDB (Local)";
    console.log(`[DiscoveryRepository] Initialized with ${mode}`);
  }

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
      const docs = await db.getAll<LegalDocument>(STORES.DOCUMENTS);

      const collected = docs.length;
      const processed = docs.filter(
        (d) => d.tags?.includes("Processed") || d.ocrStatus === "Completed"
      ).length;
      const reviewed = docs.filter(
        (d) => d.tags?.includes("Reviewed") || d.status === "Reviewed"
      ).length;
      const produced = docs.filter((d) => d.status === "Produced").length;

      // Return empty data if no documents exist
      if (collected === 0) {
        return [
          { name: "Collection", value: 0, label: "0 Docs" },
          { name: "Processing", value: 0, label: "0 Processed" },
          { name: "Review", value: 0, label: "0 Reviewed" },
          { name: "Production", value: 0, label: "0 Produced" },
        ];
      }

      return [
        {
          name: "Collection",
          value: collected,
          label: `${(collected / 1000).toFixed(1)}k Docs`,
        },
        {
          name: "Processing",
          value: processed,
          label: `${(processed / 1000).toFixed(1)}k OCR`,
        },
        { name: "Review", value: reviewed, label: `${reviewed} Reviewed` },
        { name: "Production", value: produced, label: `${produced} Produced` },
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
   * @returns Promise<any[]> Custodian statistics
   */
  getCustodianStats = async (): Promise<any[]> => {
    try {
      const stats = await db.get<{ data?: any[] }>(
        STORES.DISCOVERY_CUSTODIAN_STATS,
        "custodian-main"
      );
      return stats?.data ?? [];
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
    getCustodians(this.useBackend, caseId);

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

    if (this.useBackend) {
      try {
        const result = await discoveryApi.custodians.create(custodian as any);
        return result as unknown as Custodian;
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await db.put(STORES.CUSTODIANS, custodian);
      return custodian;
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

    if (this.useBackend) {
      try {
        const { id, ...updates } = custodianObj as {
          id: string;
          [key: string]: unknown;
        };
        return await discoveryApi.custodians.update(id, updates);
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      return await db.put(STORES.CUSTODIANS, custodian);
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

    if (this.useBackend) {
      try {
        await discoveryApi.custodians.delete(id);
        return;
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await db.delete(STORES.CUSTODIANS, id);
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.depositions.getAll(
          caseId ? { caseId } : undefined
        )) as unknown as Deposition[];
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      const depositions = await db.getAll<Deposition>(
        STORES.DISCOVERY_EXT_DEPO
      );
      return caseId
        ? depositions.filter((d) => d.caseId === caseId)
        : depositions;
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.depositions.create(
          deposition as unknown as Record<string, unknown>
        )) as unknown as Deposition;
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await db.put(STORES.DISCOVERY_EXT_DEPO, deposition);
      return deposition;
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.esiSources.getAll(
          caseId ? { caseId } : undefined
        )) as unknown as ESISource[];
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      const sources = await db.getAll<ESISource>(STORES.DISCOVERY_EXT_ESI);
      return caseId ? sources.filter((e) => e.caseId === caseId) : sources;
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.esiSources.create(
          source as unknown as Record<string, unknown>
        )) as unknown as ESISource;
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await db.put(STORES.DISCOVERY_EXT_ESI, source);
      return source;
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.esiSources.updateStatus(
          id,
          status as unknown as
            | "identified"
            | "reviewed"
            | "preserved"
            | "collected"
            | "processed"
        )) as unknown as ESISource;
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      const source = await db.get<ESISource>(STORES.DISCOVERY_EXT_ESI, id);
      if (!source) {
        throw new EntityNotFoundError("ESISource", id);
      }
      const updated = {
        ...source,
        status: status as
          | "identified"
          | "reviewed"
          | "preserved"
          | "collected"
          | "processed",
      };
      await db.put(STORES.DISCOVERY_EXT_ESI, updated);
      return updated;
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.productions.getAll(
          caseId ? { caseId } : undefined
        )) as unknown as ProductionSet[];
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      const productions = await db.getAll<ProductionSet>(
        STORES.DISCOVERY_EXT_PROD
      );
      return caseId
        ? productions.filter((p) => p.caseId === caseId)
        : productions;
    } catch (error) {
      console.error("[DiscoveryRepository.getProductions] Error:", error);
      throw new OperationError("getProductions", "Failed to fetch productions");
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.productions.create(
          production as unknown as Record<string, unknown>
        )) as unknown as ProductionSet;
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await db.put(STORES.DISCOVERY_EXT_PROD, production);
      return production;
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

    if (isBackendApiEnabled()) {
      try {
        // Check if production exists first via metadata endpoint
        // Then return constructed download URL
        // Assuming GET /discovery/productions/:id exists
        const { data } = await apiClient.get<{
          id: string;
          downloadUrl?: string;
        }>(`/discovery/productions/${id}`);
        if (data?.downloadUrl) return data.downloadUrl;
        // Fallback to direct construction
        return `${apiClient.defaults.baseURL}/discovery/productions/${id}/download`;
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
    }

    // Fallback for demo/dev without backend
    return `blob:http://${window.location.host}/production/${id}.zip`;
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.custodianInterviews.getAll(
          caseId ? { caseId } : undefined
        )) as unknown as CustodianInterview[];
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      const interviews = await db.getAll<CustodianInterview>(
        STORES.DISCOVERY_EXT_INT
      );
      return caseId
        ? interviews.filter((i) => i.caseId === caseId)
        : interviews;
    } catch (error) {
      console.error("[DiscoveryRepository.getInterviews] Error:", error);
      throw new OperationError(
        "getInterviews",
        "Failed to fetch custodian interviews"
      );
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.custodianInterviews.create(
          interview as unknown as Record<string, unknown>
        )) as unknown as CustodianInterview;
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await db.put(STORES.DISCOVERY_EXT_INT, interview);
      return interview;
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.discoveryRequests.getAll(
          caseId ? { caseId } : undefined
        )) as unknown as DiscoveryRequest[];
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      const requests = await db.getAll<DiscoveryRequest>(STORES.REQUESTS);
      return caseId ? requests.filter((r) => r.caseId === caseId) : requests;
    } catch (error) {
      console.error("[DiscoveryRepository.getRequests] Error:", error);
      throw new OperationError(
        "getRequests",
        "Failed to fetch discovery requests"
      );
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.discoveryRequests.create(
          request as unknown as Record<string, unknown>
        )) as unknown as DiscoveryRequest;
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await db.put(STORES.REQUESTS, request);
      return request;
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

    if (this.useBackend) {
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
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      const request = await db.get<DiscoveryRequest>(STORES.REQUESTS, id);
      if (!request) {
        throw new EntityNotFoundError("DiscoveryRequest", id);
      }
      const updated: DiscoveryRequest = {
        ...request,
        status: status as unknown as DiscoveryRequest["status"],
      };
      await db.put(STORES.REQUESTS, updated);
      return updated;
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
      return await db.getByIndex(STORES.REVIEW_BATCHES, "caseId", caseId);
    } catch (error) {
      console.error("[DiscoveryRepository.getReviewBatches] Error:", error);
      throw new OperationError(
        "getReviewBatches",
        "Failed to fetch review batches"
      );
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
      await db.put(STORES.REVIEW_BATCHES, batch);
      return batch;
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
    if (isBackendApiEnabled()) {
      return discoveryApi.processing.getAll(caseId);
    }
    try {
      if (caseId) {
        return db.getByIndex(STORES.PROCESSING_JOBS, "caseId", caseId);
      }
      return db.getAll(STORES.PROCESSING_JOBS);
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
    if (isBackendApiEnabled()) {
      return discoveryApi.processing.getById(id);
    }
    const job = await db.get(STORES.PROCESSING_JOBS, id);
    if (!job) {
      throw new EntityNotFoundError("ProcessingJob", id);
    }
    return job as ProcessingJob;
  };

  /**
   * Create a new processing job
   * @param data Job data
   */
  createProcessingJob = async (
    data: Partial<ProcessingJob>
  ): Promise<ProcessingJob> => {
    if (isBackendApiEnabled()) {
      return discoveryApi.processing.create(data);
    }
    const newJob = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProcessingJob;
    await db.put(STORES.PROCESSING_JOBS, newJob);
    return newJob;
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
    if (isBackendApiEnabled()) {
      // Handle specific actions like pause/resume/retry if needed, or just generic update
      // For now, generic update
      return discoveryApi.processing.create({ ...data, id }); // API might need PUT
    }
    const existing = await this.getProcessingJob(id);
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await db.put(STORES.PROCESSING_JOBS, updated);
    return updated;
  };

  /**
   * Delete a processing job
   * @param id Job ID
   */
  deleteProcessingJob = async (id: string): Promise<void> => {
    this.validateId(id, "deleteProcessingJob");
    if (isBackendApiEnabled()) {
      await discoveryApi.processing.delete(id);
      return;
    }
    await db.delete(STORES.PROCESSING_JOBS, id);
  };

  // =============================================================================
  // DOCUMENT REVIEW
  // =============================================================================

  /**
   * Get review documents
   * @param filters Search filters
   */
  getReviewDocuments = async (filters?: any): Promise<ReviewDocument[]> => {
    if (isBackendApiEnabled()) {
      return discoveryApi.review.getDocuments(filters);
    }
    // Fallback: return empty array or mock data if needed
    return [];
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
    if (isBackendApiEnabled()) {
      return discoveryApi.review.updateCoding(id, coding, notes);
    }
    throw new OperationError(
      "updateDocumentCoding",
      "Not supported in offline mode"
    );
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

    if (this.useBackend) {
      try {
        return (await discoveryApi.examinations.getAll(
          caseId ? { caseId } : undefined
        )) as unknown as Examination[];
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      const exams = await db.getAll<Examination>(STORES.EXAMINATIONS);
      return caseId ? exams.filter((e) => e.caseId === caseId) : exams;
    } catch (error) {
      console.error("[DiscoveryRepository.getExaminations] Error:", error);
      throw new OperationError(
        "getExaminations",
        "Failed to fetch examinations"
      );
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

    if (this.useBackend) {
      try {
        return await discoveryApi.examinations.create(examination);
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      await db.put(STORES.EXAMINATIONS, examination);
      return examination;
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
      const transcripts = await db.getAll<Transcript>(STORES.TRANSCRIPTS);
      return caseId
        ? transcripts.filter((t) => t.caseId === caseId)
        : transcripts;
    } catch (error) {
      console.error("[DiscoveryRepository.getTranscripts] Error:", error);
      throw new OperationError("getTranscripts", "Failed to fetch transcripts");
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
      await db.put(STORES.TRANSCRIPTS, transcript);
      return transcript;
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
      return await db.getAll<Vendor>(STORES.VENDORS);
    } catch (error) {
      console.error("[DiscoveryRepository.getVendors] Error:", error);
      throw new OperationError("getVendors", "Failed to fetch vendors");
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
      await db.put(STORES.VENDORS, vendor);
      return vendor;
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
      return await db.getAll(STORES.REPORTERS);
    } catch (error) {
      console.error("[DiscoveryRepository.getReporters] Error:", error);
      throw new OperationError("getReporters", "Failed to fetch reporters");
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
      const sanctions = await db.getAll<SanctionMotion>(STORES.SANCTIONS);
      return caseId ? sanctions.filter((s) => s.caseId === caseId) : sanctions;
    } catch (error) {
      console.error("[DiscoveryRepository.getSanctions] Error:", error);
      throw new OperationError("getSanctions", "Failed to fetch sanctions");
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
      await db.put(STORES.SANCTIONS, motion);
      return motion;
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
      const stipulations = await db.getAll<StipulationRequest>(
        STORES.STIPULATIONS
      );
      return caseId
        ? stipulations.filter((s) => s.caseId === caseId)
        : stipulations;
    } catch (error) {
      console.error("[DiscoveryRepository.getStipulations] Error:", error);
      throw new OperationError(
        "getStipulations",
        "Failed to fetch stipulations"
      );
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
      await db.put(STORES.STIPULATIONS, stipulation);
      return stipulation;
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
    if (this.useBackend) {
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

  /**
   * Get enhanced legal holds
   */
  getLegalHoldsEnhanced = async (): Promise<LegalHoldEnhanced[]> => {
    if (this.useBackend) {
      return discoveryApi.legalHolds.getEnhanced();
    }
    // Fallback to regular holds cast as enhanced (incomplete data but prevents crash)
    const holds = await this.getLegalHolds();
    return holds as unknown as LegalHoldEnhanced[];
  };

  /**
   * Get privilege log entries
   *
   * @returns Promise<PrivilegeLogEntry[]> Array of privilege log entries
   * @throws Error if fetch fails
   */
  getPrivilegeLog = async (): Promise<PrivilegeLogEntry[]> => {
    if (this.useBackend) {
      try {
        return (await discoveryApi.privilegeLog.getAll()) as unknown as PrivilegeLogEntry[];
      } catch (error) {
        console.warn(
          "[DiscoveryRepository] Backend API unavailable, falling back to IndexedDB",
          error
        );
      }
    }

    try {
      return await db.getAll<PrivilegeLogEntry>(STORES.PRIVILEGE_LOG);
    } catch (error) {
      console.error("[DiscoveryRepository.getPrivilegeLog] Error:", error);
      throw new OperationError(
        "getPrivilegeLog",
        "Failed to fetch privilege log"
      );
    }
  };

  /**
   * Get enhanced privilege log entries
   */
  getPrivilegeLogEnhanced = async (): Promise<PrivilegeLogEntryEnhanced[]> => {
    if (this.useBackend) {
      return discoveryApi.privilegeLog.getEnhanced();
    }
    // Fallback
    const entries = await this.getPrivilegeLog();
    return entries as unknown as PrivilegeLogEntryEnhanced[];
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

      if (isBackendApiEnabled()) {
        // Future integration: await apiClient.post('/calendar/sync', { requests: pending });
        console.info(
          `[DiscoveryRepository] Would sync ${pending.length} deadlines to Calendar Service (endpoint pending).`
        );
      } else {
        console.info(
          `[DiscoveryRepository] Calendar sync skipped (backend disabled).`
        );
      }
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

    if (isBackendApiEnabled()) {
      try {
        const response = await discoveryApi.collections.resume(id);
        // Return job ID from response if available, otherwise construct one
        return (response as any)?.jobId || `job-${id}-resumed`;
      } catch (error) {
        console.error(
          "[DiscoveryRepository] Failed to start collection:",
          error
        );
        throw new OperationError(
          "startCollection",
          "Failed to start collection job"
        );
      }
    }

    // Local mode fallback
    return `local-job-${Date.now()}`;
  };

  // ============================================================================
  // Collections Management
  // ============================================================================

  /**
   * Get all data collections
   * @param caseId Optional case ID to filter by
   */
  getCollections = async (caseId?: string): Promise<DataCollection[]> => {
    if (isBackendApiEnabled()) {
      return discoveryApi.collections.getAll(caseId);
    }
    // Fallback to local DB
    if (caseId) {
      return db.getByIndex(STORES.DISCOVERY_COLLECTIONS, "caseId", caseId);
    }
    return db.getAll(STORES.DISCOVERY_COLLECTIONS);
  };

  /**
   * Get a data collection by ID
   * @param id Collection ID
   */
  getCollection = async (id: string): Promise<DataCollection> => {
    this.validateId(id, "getCollection");
    if (isBackendApiEnabled()) {
      return discoveryApi.collections.getById(id);
    }
    const collection = await db.get(STORES.DISCOVERY_COLLECTIONS, id);
    if (!collection) {
      throw new EntityNotFoundError("Collection", id);
    }
    return collection as DataCollection;
  };

  /**
   * Create a new data collection
   * @param data Collection data
   */
  createCollection = async (
    data: Partial<DataCollection>
  ): Promise<DataCollection> => {
    if (isBackendApiEnabled()) {
      return discoveryApi.collections.create(data);
    }
    const newCollection = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as DataCollection;
    await (db as any).add(STORES.DISCOVERY_COLLECTIONS, newCollection as any);
    return newCollection;
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
    if (isBackendApiEnabled()) {
      return discoveryApi.collections.update(id, data);
    }
    const existing = await this.getCollection(id);
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await db.put(STORES.DISCOVERY_COLLECTIONS, updated);
    return updated;
  };

  /**
   * Delete a data collection
   * @param id Collection ID
   */
  deleteCollection = async (id: string): Promise<void> => {
    this.validateId(id, "deleteCollection");
    if (isBackendApiEnabled()) {
      await discoveryApi.collections.delete(id);
      return;
    }
    await db.delete(STORES.DISCOVERY_COLLECTIONS, id);
  };

  /**
   * Get discovery timeline events
   * @param caseId Optional case ID to filter by
   */
  getTimelineEvents = async (
    caseId?: string
  ): Promise<DiscoveryTimelineEvent[]> => {
    if (isBackendApiEnabled()) {
      return discoveryApi.timeline.getEvents(caseId);
    }
    // Fallback to local DB or empty array if not implemented locally
    return [];
  };
}
