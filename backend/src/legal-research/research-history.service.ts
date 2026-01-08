import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResearchQuery, QueryType, QueryStatus, SearchFilters, SearchResult } from './entities/research-query.entity';

export interface CreateResearchQueryDto {
  userId: string;
  query: string;
  queryType: QueryType;
  filters?: SearchFilters;
  results: SearchResult[];
  resultCount: number;
  executionTimeMs?: number;
  notes?: string;
}

export interface UpdateResearchQueryDto {
  notes?: string;
  isBookmarked?: boolean;
  tags?: string[];
}

export interface ResearchHistoryStats {
  totalQueries: number;
  totalBookmarked: number;
  averageExecutionTime: number;
  queryTypeDistribution: {
    type: QueryType;
    count: number;
  }[];
  recentQueries: ResearchQuery[];
  topTopics: string[];
}

/**
 * Research History Service
 * Manages user research queries and history
 */
@Injectable()
export class ResearchHistoryService {
  private readonly logger = new Logger(ResearchHistoryService.name);

  constructor(
    @InjectRepository(ResearchQuery)
    private readonly researchQueryRepository: Repository<ResearchQuery>,
  ) {}

  /**
   * Create a new research query record
   */
  async createResearchQuery(dto: CreateResearchQueryDto): Promise<ResearchQuery> {
    const researchQuery = this.researchQueryRepository.create({
      userId: dto.userId,
      query: dto.query,
      queryType: dto.queryType,
      filters: dto.filters,
      results: dto.results,
      resultCount: dto.resultCount,
      status: QueryStatus.COMPLETED,
      executionTimeMs: dto.executionTimeMs,
      notes: dto.notes,
    });

    const saved = await this.researchQueryRepository.save(researchQuery);
    this.logger.log(`Research query created: ${saved.id}`);

    return saved;
  }

  /**
   * Update a research query
   */
  async updateResearchQuery(
    queryId: string,
    userId: string,
    dto: UpdateResearchQueryDto,
  ): Promise<ResearchQuery> {
    const query = await this.researchQueryRepository.findOne({
      where: { id: queryId, userId },
    });

    if (!query) {
      throw new NotFoundException(`Research query with ID ${queryId} not found`);
    }

    if (dto.notes !== undefined) {
      query.notes = dto.notes;
    }

    if (dto.isBookmarked !== undefined) {
      query.isBookmarked = dto.isBookmarked;
    }

    if (dto.tags !== undefined) {
      query.tags = dto.tags;
    }

    const updated = await this.researchQueryRepository.save(query);
    this.logger.log(`Research query updated: ${updated.id}`);

    return updated;
  }

  /**
   * Get research query by ID
   */
  async getResearchQueryById(queryId: string, userId: string): Promise<ResearchQuery> {
    const query = await this.researchQueryRepository.findOne({
      where: { id: queryId, userId },
    });

    if (!query) {
      throw new NotFoundException(`Research query with ID ${queryId} not found`);
    }

    return query;
  }

  /**
   * Get user research history
   */
  async getUserResearchHistory(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<{
    queries: ResearchQuery[];
    total: number;
  }> {
    const [queries, total] = await this.researchQueryRepository.findAndCount({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { queries, total };
  }

  /**
   * Get bookmarked queries
   */
  async getBookmarkedQueries(
    userId: string,
    limit = 50,
  ): Promise<ResearchQuery[]> {
    return this.researchQueryRepository.find({
      where: { userId, isBookmarked: true },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Search research history
   */
  async searchResearchHistory(
    userId: string,
    searchText: string,
    queryType?: QueryType,
    limit = 50,
  ): Promise<ResearchQuery[]> {
    const queryBuilder = this.researchQueryRepository
      .createQueryBuilder('research_query')
      .where('research_query.user_id = :userId', { userId })
      .andWhere('research_query.query ILIKE :searchText', {
        searchText: `%${searchText}%`,
      });

    if (queryType) {
      queryBuilder.andWhere('research_query.query_type = :queryType', { queryType });
    }

    queryBuilder.orderBy('research_query.timestamp', 'DESC').take(limit);

    return queryBuilder.getMany();
  }

  /**
   * Get queries by tag
   */
  async getQueriesByTag(userId: string, tag: string): Promise<ResearchQuery[]> {
    return this.researchQueryRepository
      .createQueryBuilder('research_query')
      .where('research_query.user_id = :userId', { userId })
      .andWhere(':tag = ANY(research_query.tags)', { tag })
      .orderBy('research_query.timestamp', 'DESC')
      .getMany();
  }

  /**
   * Get research history statistics
   */
  async getResearchHistoryStats(userId: string): Promise<ResearchHistoryStats> {
    // Get total queries
    const totalQueries = await this.researchQueryRepository.count({
      where: { userId },
    });

    // Get total bookmarked
    const totalBookmarked = await this.researchQueryRepository.count({
      where: { userId, isBookmarked: true },
    });

    // Get average execution time
    const avgResult = await this.researchQueryRepository
      .createQueryBuilder('research_query')
      .select('AVG(research_query.execution_time_ms)', 'avgTime')
      .where('research_query.user_id = :userId', { userId })
      .andWhere('research_query.execution_time_ms IS NOT NULL')
      .getRawOne();

    const averageExecutionTime = avgResult?.avgTime
      ? parseFloat(avgResult.avgTime)
      : 0;

    // Get query type distribution
    const typeDistResult = await this.researchQueryRepository
      .createQueryBuilder('research_query')
      .select('research_query.query_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('research_query.user_id = :userId', { userId })
      .groupBy('research_query.query_type')
      .getRawMany();

    const queryTypeDistribution = typeDistResult.map((row) => ({
      type: row.type as QueryType,
      count: parseInt(row.count, 10),
    }));

    // Get recent queries (last 10)
    const recentQueries = await this.researchQueryRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: 10,
    });

    // Get top topics from filters
    const allQueries = await this.researchQueryRepository.find({
      where: { userId },
      select: ['filters'],
    });

    const topicCounts: Record<string, number> = {};
    allQueries.forEach((query) => {
      if (query.filters?.topics) {
        query.filters.topics.forEach((topic) => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }
    });

    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic]) => topic);

    return {
      totalQueries,
      totalBookmarked,
      averageExecutionTime,
      queryTypeDistribution,
      recentQueries,
      topTopics,
    };
  }

  /**
   * Delete research query
   */
  async deleteResearchQuery(queryId: string, userId: string): Promise<void> {
    const query = await this.researchQueryRepository.findOne({
      where: { id: queryId, userId },
    });

    if (!query) {
      throw new NotFoundException(`Research query with ID ${queryId} not found`);
    }

    await this.researchQueryRepository.softDelete(queryId);
    this.logger.log(`Research query deleted: ${queryId}`);
  }

  /**
   * Delete all research history for a user
   */
  async deleteUserHistory(userId: string): Promise<number> {
    const result = await this.researchQueryRepository.softDelete({ userId });
    this.logger.log(`Deleted ${result.affected} research queries for user ${userId}`);
    return result.affected || 0;
  }

  /**
   * Get similar queries (based on query text similarity)
   */
  async getSimilarQueries(
    userId: string,
    query: string,
    limit = 5,
  ): Promise<ResearchQuery[]> {
    // Simple implementation using ILIKE
    // In production, consider using full-text search or vector similarity
    return this.researchQueryRepository
      .createQueryBuilder('research_query')
      .where('research_query.user_id = :userId', { userId })
      .andWhere('research_query.query ILIKE :query', { query: `%${query}%` })
      .orderBy('research_query.timestamp', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Export research history
   */
  async exportResearchHistory(userId: string): Promise<ResearchQuery[]> {
    return this.researchQueryRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Get query statistics for a date range
   */
  async getQueryStatsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalQueries: number;
    averageResultCount: number;
    averageExecutionTime: number;
    queryTypes: { type: QueryType; count: number }[];
  }> {
    const queries = await this.researchQueryRepository
      .createQueryBuilder('research_query')
      .where('research_query.user_id = :userId', { userId })
      .andWhere('research_query.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    const totalQueries = queries.length;

    const averageResultCount =
      totalQueries > 0
        ? queries.reduce((sum, q) => sum + q.resultCount, 0) / totalQueries
        : 0;

    const queriesWithTime = queries.filter((q) => q.executionTimeMs !== null);
    const averageExecutionTime =
      queriesWithTime.length > 0
        ? queriesWithTime.reduce((sum, q) => sum + (q.executionTimeMs || 0), 0) /
          queriesWithTime.length
        : 0;

    // Query type distribution
    const typeCount: Record<string, number> = {};
    queries.forEach((q) => {
      typeCount[q.queryType] = (typeCount[q.queryType] || 0) + 1;
    });

    const queryTypes = Object.entries(typeCount).map(([type, count]) => ({
      type: type as QueryType,
      count,
    }));

    return {
      totalQueries,
      averageResultCount,
      averageExecutionTime,
      queryTypes,
    };
  }
}
