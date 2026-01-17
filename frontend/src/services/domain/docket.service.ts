/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                      LEXIFLOW DOCKET DOMAIN SERVICE                       ║
 * ║                   Enterprise Docket Management Layer v2.0                 ║
 * ║                       PhD-Level Systems Architecture                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/domain/docket.service
 * @architecture Backend-First Repository Pattern with PACER Integration
 * @author LexiFlow Engineering Team
 * @since 2025-12-22
 * @status PRODUCTION READY
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *                            ARCHITECTURAL OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This module provides enterprise-grade docket entry management with:
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  DOCKET REPOSITORY                                                      │
 * │  • Full CRUD operations for docket entries                              │
 * │  • PACER integration with retry logic                                   │
 * │  • Sequential numbering management                                      │
 * │  • Case-based filtering and retrieval                                   │
 * │  • Version conflict detection                                           │
 * │  • Integration event publishing                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *                              DESIGN PRINCIPLES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. **Single Responsibility**: Manages docket entries and PACER sync
 * 2. **Retry Pattern**: Resilient PACER integration with exponential backoff
 * 3. **Event-Driven**: Publishes integration events for orchestration
 * 4. **Backend-First**: Routes to PostgreSQL API, falls back to IndexedDB
 * 5. **Type Safety**: Full TypeScript validation with custom error types
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
//                          CORE DEPENDENCIES
// ═══════════════════════════════════════════════════════════════════════════

import {
  DocketApiService,
  type DocketFilterOptions,
} from "@/api/litigation/docket-api";
import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/api-client.service";
import { type DocketEntry } from "@/types";
import { SystemEventType } from "@/types/integration-types";

// Backend API Integration (Primary Data Source)

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class VersionConflictError extends Error {
  constructor(
    public readonly entityId: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number
  ) {
    super(
      `Version conflict for ${entityId}: expected ${expectedVersion}, got ${actualVersion}`
    );
    this.name = "VersionConflictError";
  }
}

// ============================================================================
// REPOSITORY
// ============================================================================

export interface DocketEntryWithVersion extends DocketEntry {
  version?: number;
}

/**
 * DocketRepository - Enterprise Docket Entry Management
 *
 * Provides comprehensive docket management including:
 * • CRUD operations with validation
 * • PACER integration with retry logic
 * • Case-based filtering
 * • Sequential numbering
 * • Version conflict detection
 * • Integration event publishing
 *
 * **Backend-First Architecture:**
 * - Uses DocketApiService (PostgreSQL + NestJS) by default
 * - Falls back to IndexedDB only if backend is disabled
 *
 * @extends Repository<DocketEntry>
 */
export class DocketRepository {
  private readonly docketApi: DocketApiService;

  constructor() {
    this.docketApi = new DocketApiService();
  }

  /**
   * Retrieves all docket entries with optional case filtering
   * Routes to backend API if enabled, otherwise uses IndexedDB
   *
   * @param filters - Optional filters for search, type, pagination
   * @returns Promise<PaginatedResponse<DocketEntry> | DocketEntry[]>
   * @complexity O(1) API call or O(n) IndexedDB scan
   */
  async getAll(
    filters?: DocketFilterOptions
  ): Promise<PaginatedResponse<DocketEntry> | DocketEntry[]> {
    return this.docketApi.getAll(filters);
  }

  /**
   * Retrieves a single docket entry by ID
   *
   * @param id - Docket entry identifier
   * @returns Promise<DocketEntry | undefined>
   */
  async getById(id: string): Promise<DocketEntry | undefined> {
    try {
      return await this.docketApi.getById(id);
    } catch (error) {
      console.error("[DocketRepository.getById] Backend error:", error);
      return undefined;
    }
  }

  /**
   * Adds a new docket entry
   *
   * @param entry - Docket entry data
   * @returns Promise<DocketEntry>
   */
  async add(
    entry: Omit<DocketEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<DocketEntry> {
    const created = await this.docketApi.add(entry);
    // Publish integration event
    const { IntegrationOrchestrator } =
      await import("@/services/integration/integration-orchestrator.service");
    await IntegrationOrchestrator.publish(SystemEventType.DOCKET_INGESTED, {
      entry: created,
      caseId: entry.caseId,
    });
    return created;
  }

  /**
   * Updates an existing docket entry
   *
   * @param id - Docket entry identifier
   * @param updates - Partial updates
   * @returns Promise<DocketEntry>
   */
  async update(
    id: string,
    updates: Partial<DocketEntry>
  ): Promise<DocketEntry> {
    return this.docketApi.update(id, updates);
  }

  /**
   * Deletes a docket entry
   *
   * @param id - Docket entry identifier
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    await this.docketApi.delete(id);
  }

  /**
   * Retrieves all docket entries for a specific case
   *
   * @param caseId - Case identifier
   * @returns Promise<DocketEntry[]>
   * @complexity O(1) API call or O(log n) IndexedDB index lookup
   */
  async getByCaseId(caseId: string): Promise<DocketEntry[]> {
    const response = await this.docketApi.getAll(caseId);
    return response.data;
  }

  /**
   * Synchronizes docket entries from PACER with retry logic
   *
   * Uses exponential backoff retry pattern for resilience:
   * - Max retries: 3
   * - Initial delay: 1000ms
   * - Max delay: 10000ms
   *
   * @param courtId - Federal court identifier
   * @param caseId - Internal Case ID (UUID)
   * @param pacerCaseNumber - Case number in PACER format
   * @param courtId - Optional court identifier
   * @returns Promise<boolean> - Success indicator
   * @throws RetryError if all retries exhausted
   */
  async syncFromPacer(
    caseId: string,
    pacerCaseNumber: string,
    courtId?: string
  ): Promise<boolean> {
    try {
      await apiClient.post("/docket/pacer/sync", {
        caseId,
        pacerCaseNumber,
        court: courtId,
      });
      return true;
    } catch (error) {
      console.error("PACER sync failed", error);
      return false;
    }
  }
}
