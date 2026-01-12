import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { CaseFilterDto } from "./dto/case-filter.dto";
import {
  CaseResponseDto,
  PaginatedCaseResponseDto,
} from "./dto/case-response.dto";
import { CaseStatsDto } from "./dto/case-stats.dto";
import { CreateCaseDto } from "./dto/create-case.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";
import { Case, CaseStatus } from "./entities/case.entity";

import {
  validateSortField,
  validateSortOrder,
} from "@common/utils/query-validation.util";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                CASES SERVICE - CORE CASE LIFECYCLE & MATTER MANAGEMENT                              ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                                                                   ║
 * ║  Frontend / API Clients             CasesController                        CasesService                           ║
 * ║       │                                   │                                     │                                 ║
 * ║       │  POST /cases                      │                                     │                                 ║
 * ║       │  GET /cases                       │                                     │                                 ║
 * ║       │  GET /cases/:id                   │                                     │                                 ║
 * ║       │  PATCH /cases/:id                 │                                     │                                 ║
 * ║       │  DELETE /cases/:id                │                                     │                                 ║
 * ║       └───────────────────────────────────┴─────────────────────────────────────▶                                 ║
 * ║                                                                                 │                                 ║
 * ║                                                             ┌───────────────────┴───────────────────┐             ║
 * ║                                                             │  LRU Cache (500 entries)     │             ║
 * ║                                                             │  Stats Cache (5 min TTL)     │             ║
 * ║                                                             │  Query Cache (1 min TTL)     │             ║
 * ║                                                             └─────────────────┬───────────────────┘             ║
 * ║                                                                              │                                    ║
 * ║                                                                              ▼                                    ║
 * ║                                                                      Case Repository                               ║
 * ║                                                                              │                                    ║
 * ║                                                                              ▼                                    ║
 * ║                                                                      PostgreSQL (cases)                            ║
 * ║                                                                                                                   ║
 * ║  DATA IN:  CreateCaseDto { caseNumber, title, status, jurisdiction, filingDate, ... }                             ║
 * ║            UpdateCaseDto { title?, status?, notes?, ... }                                                         ║
 * ║            CaseFilterDto { status?, search?, jurisdictionId?, page, limit }                                       ║
 * ║                                                                                                                   ║
 * ║  DATA OUT: Case { id, caseNumber, title, status, parties[], documents[], docket[] }                               ║
 * ║            PaginatedCaseResponseDto { data: Case[], total, page, limit, hasMore }                                 ║
 * ║            CaseStatsDto { total, byStatus{}, byJurisdiction{}, recentActivity[] }                                 ║
 * ║                                                                                                                   ║
 * ║  OPERATIONS:                                                                                                      ║
 * ║    • create()      - Create new case with validation                                                              ║
 * ║    • findAll()     - List cases with filters, search, pagination                                                  ║
 * ║    • findOne()     - Get case by ID with relations                                                                ║
 * ║    • update()      - Update case details                                                                          ║
 * ║    • remove()      - Soft delete case                                                                             ║
 * ║    • getStats()    - Get case statistics (cached)                                                                 ║
 * ║    • getMetrics()  - Get case metrics (cached)                                                                    ║
 * ║    • search()      - Full-text search cases                                                                       ║
 * ║                                                                                                                   ║
 * ║  MEMORY OPTS: LRU cache for lookups, TTL-based stats cache, query result caching, cleanup on module destroy      ║
 * ║                                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Cases Service with Memory Optimizations
 *
 * MEMORY OPTIMIZATIONS:
 * - LRU cache for case lookups (500 entries)
 * - Stats cache with TTL (5 minutes)
 * - Metrics cache with TTL (2 minutes)
 * - Query result caching for pagination
 * - Proper cleanup on module destroy
 */
@Injectable()
export class CasesService implements OnModuleDestroy {
  // Memory limits
  private readonly MAX_CASE_CACHE_SIZE = 500;
  private readonly STATS_CACHE_TTL_MS = 300000; // 5 minutes
  private readonly METRICS_CACHE_TTL_MS = 120000; // 2 minutes
  private readonly QUERY_CACHE_TTL_MS = 60000; // 1 minute

  // Caches for memory optimization
  private caseCache: Map<string, { data: CaseResponseDto; timestamp: number }> =
    new Map();
  private statsCache: { data: CaseStatsDto; timestamp: number } | null = null;
  private metricsCache: { data: unknown; timestamp: number } | null = null;
  private queryCache: Map<
    string,
    { data: PaginatedCaseResponseDto; timestamp: number }
  > = new Map();

  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>
  ) {}

  onModuleDestroy() {
    // Clear all caches to free memory
    this.caseCache.clear();
    this.statsCache = null;
    this.metricsCache = null;
    this.queryCache.clear();
  }

  /**
   * Check if cached data is still valid based on TTL
   */
  private isCacheValid(timestamp: number, ttlMs: number): boolean {
    return Date.now() - timestamp < ttlMs;
  }

  /**
   * Enforce LRU cache limits to prevent memory bloat
   * Evicts 10% of oldest entries when cache exceeds limits
   */

  private enforceCacheLRU(cache: Map<unknown, unknown>, maxSize: number): void {
    if (cache.size > maxSize) {
      const entriesToRemove = Math.ceil(maxSize * 0.1); // Remove 10% of entries
      const keysToDelete = Array.from(cache.keys()).slice(0, entriesToRemove);
      keysToDelete.forEach((key) => cache.delete(key));
    }
  }

  /**
   * Invalidate all caches when data changes
   * Ensures cache consistency across all operations
   */
  private invalidateCaches(): void {
    this.caseCache.clear();
    this.statsCache = null;
    this.metricsCache = null;
    this.queryCache.clear();
  }

  async getStats(): Promise<CaseStatsDto> {
    // Check cache first
    if (
      this.statsCache &&
      this.isCacheValid(this.statsCache.timestamp, this.STATS_CACHE_TTL_MS)
    ) {
      return this.statsCache.data;
    }

    // Compute stats with memory-efficient queries
    const totalActive = await this.caseRepository.count({
      where: { status: CaseStatus.ACTIVE },
      cache: 60000, // 1 minute cache
    });

    const intakePipeline = await this.caseRepository.count({
      where: [{ status: CaseStatus.OPEN }, { status: CaseStatus.PENDING }],
    });

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const now = new Date();

    const upcomingDeadlines = await this.caseRepository
      .createQueryBuilder("case")
      .where("case.trialDate BETWEEN :now AND :sevenDaysFromNow", {
        now,
        sevenDaysFromNow,
      })
      .getCount();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const atRisk = await this.caseRepository
      .createQueryBuilder("case")
      .where("case.status = :status", { status: CaseStatus.ACTIVE })
      .andWhere("case.updatedAt < :thirtyDaysAgo", { thirtyDaysAgo })
      .getCount();

    const totalValue = 0;
    const utilizationRate = 0;

    const { avgAge } = await this.caseRepository
      .createQueryBuilder("case")
      .select(
        "AVG(EXTRACT(EPOCH FROM (NOW() - case.createdAt)) / 86400)",
        "avgAge"
      )
      .where("case.status = :status", { status: CaseStatus.ACTIVE })
      .getRawOne();

    const conversionRate = 0;

    const stats: CaseStatsDto = {
      totalActive,
      intakePipeline,
      upcomingDeadlines,
      atRisk,
      totalValue,
      utilizationRate,
      averageAge: Math.round(parseFloat(avgAge) || 0),
      conversionRate,
    };

    // Cache the result
    this.statsCache = { data: stats, timestamp: Date.now() };
    return stats;
  }

  /**
   * Get case metrics using efficient database aggregation
   * PERFORMANCE: Uses COUNT and GROUP BY instead of loading all records
   * MEMORY OPTIMIZATION: Cached results with TTL to prevent repeated computation
   * This is critical for enterprise scale - O(1) memory usage
   */
  async getCaseMetrics(): Promise<{
    totalCases: number;
    activeCases: number;
    closedCases: number;
    pendingCases: number;
    byType: Array<{ type: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  }> {
    // Check cache first
    if (
      this.metricsCache &&
      this.isCacheValid(this.metricsCache.timestamp, this.METRICS_CACHE_TTL_MS)
    ) {
      return this.metricsCache.data as {
        totalCases: number;
        activeCases: number;
        closedCases: number;
        pendingCases: number;
        byType: Array<{ type: string; count: number }>;
        byStatus: Array<{ status: string; count: number }>;
      };
    }

    // Get total count
    const totalCases = await this.caseRepository.count({
      cache: 30000, // 30 second cache for performance
    });

    // Get counts by status using database aggregation
    const statusCounts = await this.caseRepository
      .createQueryBuilder("case")
      .select("case.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("case.status")
      .cache(30000)
      .getRawMany<{ status: string; count: string }>();

    // Get counts by type using database aggregation
    const typeCounts = await this.caseRepository
      .createQueryBuilder("case")
      .select("case.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("case.type")
      .cache(30000)
      .getRawMany<{ type: string; count: string }>();

    // Calculate specific status counts from aggregated data
    let activeCases = 0;
    let closedCases = 0;
    let pendingCases = 0;

    for (const row of statusCounts) {
      const count = parseInt(row.count, 10);
      switch (row.status) {
        case CaseStatus.ACTIVE:
          activeCases = count;
          break;
        case CaseStatus.CLOSED:
        case CaseStatus.CLOSED_LOWER:
          closedCases += count;
          break;
        case CaseStatus.PENDING:
          pendingCases = count;
          break;
      }
    }

    const metrics = {
      totalCases,
      activeCases,
      closedCases,
      pendingCases,
      byType: typeCounts.map((row) => ({
        type: row.type || "Unknown",
        count: parseInt(row.count, 10),
      })),
      byStatus: statusCounts.map((row) => ({
        status: row.status || "Unknown",
        count: parseInt(row.count, 10),
      })),
    };

    // Cache the result
    this.metricsCache = { data: metrics, timestamp: Date.now() };
    return metrics;
  }

  async findAll(filterDto: CaseFilterDto): Promise<PaginatedCaseResponseDto> {
    const {
      search,
      status,
      type,
      practiceArea,
      assignedTeamId,
      leadAttorneyId,
      jurisdiction,
      isArchived,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "DESC",
      includeParties,
      includeTeam,
      includePhases,
    } = filterDto;

    // Create cache key from filter parameters
    const cacheKey = JSON.stringify({
      search,
      status,
      type,
      practiceArea,
      assignedTeamId,
      leadAttorneyId,
      jurisdiction,
      isArchived,
      page,
      limit,
      sortBy,
      sortOrder,
      includeParties,
      includeTeam,
      includePhases,
    });

    // Check cache first
    const cachedResult = this.queryCache.get(cacheKey);
    if (
      cachedResult &&
      this.isCacheValid(cachedResult.timestamp, this.QUERY_CACHE_TTL_MS)
    ) {
      return cachedResult.data;
    }

    // Enforce LRU on query cache
    this.enforceCacheLRU(this.queryCache, 100); // Max 100 cached queries

    const queryBuilder = this.caseRepository.createQueryBuilder("case");

    // Full-text search on title, caseNumber, and description
    if (search) {
      queryBuilder.andWhere(
        "(case.title ILIKE :search OR case.caseNumber ILIKE :search OR case.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere("case.status = :status", { status });
    }

    // Filter by type
    if (type) {
      queryBuilder.andWhere("case.type = :type", { type });
    }

    // Filter by practice area
    if (practiceArea) {
      queryBuilder.andWhere("case.practiceArea = :practiceArea", {
        practiceArea,
      });
    }

    // Filter by assigned team
    if (assignedTeamId) {
      queryBuilder.andWhere("case.assignedTeamId = :assignedTeamId", {
        assignedTeamId,
      });
    }

    // Filter by lead attorney
    if (leadAttorneyId) {
      queryBuilder.andWhere("case.leadAttorneyId = :leadAttorneyId", {
        leadAttorneyId,
      });
    }

    // Filter by jurisdiction
    if (jurisdiction) {
      queryBuilder.andWhere("case.jurisdiction = :jurisdiction", {
        jurisdiction,
      });
    }

    // Filter by archived status
    if (isArchived !== undefined) {
      queryBuilder.andWhere("case.isArchived = :isArchived", { isArchived });
    }

    // Include related entities - eagerly load to prevent N+1 queries
    if (includeParties) {
      queryBuilder.leftJoinAndSelect("case.parties", "parties");
    }

    if (includeTeam) {
      queryBuilder.leftJoinAndSelect("case.team", "team");
    }

    if (includePhases) {
      queryBuilder.leftJoinAndSelect("case.phases", "phases");
    }

    // Sorting - SQL injection protection
    const safeSortField = validateSortField("case", sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);
    queryBuilder.orderBy(`case.${safeSortField}`, safeSortOrder);

    // Pagination with memory limits
    const maxLimit = Math.min(limit, 100); // Cap at 100 to prevent memory issues
    const skip = (page - 1) * maxLimit;
    queryBuilder.skip(skip).take(maxLimit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const result: PaginatedCaseResponseDto = {
      data: data.map((c) => this.toCaseResponse(c)),
      total,
      page,
      limit: maxLimit,
      totalPages: Math.ceil(total / maxLimit),
    };

    // Cache the result
    this.queryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  async findOne(id: string): Promise<CaseResponseDto> {
    // Check cache first
    const cached = this.caseCache.get(id);
    if (
      cached &&
      this.isCacheValid(cached.timestamp, this.QUERY_CACHE_TTL_MS)
    ) {
      return cached.data;
    }

    // Enforce LRU on case cache
    this.enforceCacheLRU(this.caseCache, this.MAX_CASE_CACHE_SIZE);

    const caseEntity = await this.caseRepository.findOne({
      where: { id },
    });

    if (!caseEntity) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }

    const response = this.toCaseResponse(caseEntity);

    // Cache the result
    this.caseCache.set(id, { data: response, timestamp: Date.now() });
    return response;
  }

  async create(createCaseDto: CreateCaseDto): Promise<CaseResponseDto> {
    // Check if case number already exists
    const existingCase = await this.caseRepository.findOne({
      where: { caseNumber: createCaseDto.caseNumber },
    });

    if (existingCase) {
      throw new ConflictException(
        `Case with number ${createCaseDto.caseNumber} already exists`
      );
    }

    const caseEntity = this.caseRepository.create(createCaseDto);
    const savedCase = await this.caseRepository.save(caseEntity);

    // Invalidate caches after creation
    this.invalidateCaches();

    return this.toCaseResponse(savedCase);
  }

  async update(
    id: string,
    updateCaseDto: UpdateCaseDto
  ): Promise<CaseResponseDto> {
    // If updating case number, check for duplicates
    if (updateCaseDto.caseNumber) {
      const existingCase = await this.caseRepository.findOne({
        where: { caseNumber: updateCaseDto.caseNumber },
      });

      if (existingCase && existingCase.id !== id) {
        throw new ConflictException(
          `Case with number ${updateCaseDto.caseNumber} already exists`
        );
      }
    }

    const { metadata, ...restDto } = updateCaseDto;
    const result = await this.caseRepository
      .createQueryBuilder()
      .update(Case)
      .set({
        ...restDto,
        ...(metadata ? { metadata: metadata } : {}),
      } as unknown as QueryDeepPartialEntity<Case>)
      .where("id = :id", { id })
      .returning("*")
      .execute();

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }

    // Invalidate caches after update
    this.invalidateCaches();

    return this.toCaseResponse(result.raw[0] as Case);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.caseRepository.softDelete(id);

    // Invalidate caches after deletion
    this.invalidateCaches();
  }

  async archive(id: string): Promise<CaseResponseDto> {
    await this.findOne(id);
    await this.caseRepository.update(id, { isArchived: true });

    // Invalidate caches after archiving
    this.invalidateCaches();

    return this.findOne(id);
  }

  async findArchived(
    filterDto: CaseFilterDto
  ): Promise<PaginatedCaseResponseDto> {
    // Force isArchived filter and add status filters for closed cases
    const archivedFilter = {
      ...filterDto,
      isArchived: true,
    };

    // If no status specified, default to closed/settled cases
    if (!archivedFilter.status) {
      const queryBuilder = this.caseRepository.createQueryBuilder("case");

      queryBuilder.where("case.isArchived = :isArchived", { isArchived: true });
      queryBuilder.orWhere("case.status IN (:...statuses)", {
        statuses: ["Closed", "closed", "Settled", "Archived", "archived"],
      });

      const {
        page = 1,
        limit = 20,
        sortBy = "closeDate",
        sortOrder = "DESC",
      } = filterDto;
      const skip = (page - 1) * limit;

      const safeSortField = validateSortField("case", sortBy);
      const safeSortOrder = validateSortOrder(sortOrder);
      queryBuilder.orderBy(`case.${safeSortField}`, safeSortOrder);
      queryBuilder.skip(skip).take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data: data.map((c) => ({
          ...this.toCaseResponse(c),
          date: c.closeDate || c.filingDate,
          outcome: c.status,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    return this.findAll(archivedFilter);
  }

  private toCaseResponse(caseEntity: Case): CaseResponseDto {
    return {
      id: caseEntity.id,
      title: caseEntity.title,
      caseNumber: caseEntity.caseNumber,
      description: caseEntity.description,
      type: caseEntity.type,
      status: caseEntity.status,
      practiceArea: caseEntity.practiceArea,
      jurisdiction: caseEntity.jurisdiction,
      court: caseEntity.court,
      judge: caseEntity.judge,
      filingDate: caseEntity.filingDate,
      trialDate: caseEntity.trialDate,
      closeDate: caseEntity.closeDate,
      assignedTeamId: caseEntity.assignedTeamId,
      leadAttorneyId: caseEntity.leadAttorneyId,
      metadata: caseEntity.metadata,
      isArchived: caseEntity.isArchived,
      createdAt: caseEntity.createdAt,
      updatedAt: caseEntity.updatedAt,
      deletedAt: caseEntity.deletedAt,
    };
  }
}
