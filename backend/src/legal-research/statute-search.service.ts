import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statute, StatuteJurisdiction, StatuteType } from './entities/statute.entity';

export interface StatuteSearchQuery {
  query?: string;
  jurisdiction?: StatuteJurisdiction[];
  type?: StatuteType[];
  state?: string;
  code?: string;
  section?: string;
  topics?: string[];
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'relevance' | 'date' | 'citations';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface StatuteSearchResult {
  statutes: Statute[];
  total: number;
  page: number;
  pageSize: number;
  executionTimeMs: number;
}

export interface StatuteCitationInfo {
  statute: Statute;
  citationCount: number;
  recentCitations: number; // Citations in last year
  relatedStatutes: Statute[];
  crossReferences: string[];
}

/**
 * Statute Search Service
 * Provides advanced search and analysis for statutes and regulations
 */
@Injectable()
export class StatuteSearchService {
  private readonly logger = new Logger(StatuteSearchService.name);

  constructor(
    @InjectRepository(Statute)
    private readonly statuteRepository: Repository<Statute>,
  ) {}

  /**
   * Search statutes with advanced filters
   */
  async searchStatutes(searchQuery: StatuteSearchQuery): Promise<StatuteSearchResult> {
    const startTime = Date.now();
    const limit = searchQuery.limit || 50;
    const offset = searchQuery.offset || 0;

    const queryBuilder = this.statuteRepository
      .createQueryBuilder('statute')
      .where('statute.deletedAt IS NULL');

    // Full-text search on title, text, and code
    if (searchQuery.query) {
      queryBuilder.andWhere(
        '(statute.title ILIKE :query OR statute.text ILIKE :query OR statute.code ILIKE :query OR statute.section ILIKE :query)',
        { query: `%${searchQuery.query}%` },
      );
    }

    // Jurisdiction filter
    if (searchQuery.jurisdiction && searchQuery.jurisdiction.length > 0) {
      queryBuilder.andWhere('statute.jurisdiction IN (:...jurisdictions)', {
        jurisdictions: searchQuery.jurisdiction,
      });
    }

    // Type filter
    if (searchQuery.type && searchQuery.type.length > 0) {
      queryBuilder.andWhere('statute.type IN (:...types)', {
        types: searchQuery.type,
      });
    }

    // State filter
    if (searchQuery.state) {
      queryBuilder.andWhere('statute.state = :state', {
        state: searchQuery.state,
      });
    }

    // Code filter
    if (searchQuery.code) {
      queryBuilder.andWhere('statute.code ILIKE :code', {
        code: `%${searchQuery.code}%`,
      });
    }

    // Section filter
    if (searchQuery.section) {
      queryBuilder.andWhere('statute.section = :section', {
        section: searchQuery.section,
      });
    }

    // Topics filter (array contains)
    if (searchQuery.topics && searchQuery.topics.length > 0) {
      queryBuilder.andWhere('statute.topics && ARRAY[:...topics]::text[]', {
        topics: searchQuery.topics,
      });
    }

    // Active status filter
    if (searchQuery.isActive !== undefined) {
      queryBuilder.andWhere('statute.is_active = :isActive', {
        isActive: searchQuery.isActive,
      });
    }

    // Date range filter (effective date)
    if (searchQuery.dateFrom) {
      queryBuilder.andWhere('statute.effective_date >= :dateFrom', {
        dateFrom: searchQuery.dateFrom,
      });
    }
    if (searchQuery.dateTo) {
      queryBuilder.andWhere('statute.effective_date <= :dateTo', {
        dateTo: searchQuery.dateTo,
      });
    }

    // Sorting
    const sortBy = searchQuery.sortBy || 'relevance';
    const sortOrder = searchQuery.sortOrder || 'DESC';

    switch (sortBy) {
      case 'date':
        queryBuilder.orderBy('statute.effective_date', sortOrder);
        break;
      case 'citations':
        queryBuilder.orderBy('statute.citation_count', sortOrder);
        break;
      case 'relevance':
      default:
        // For relevance, sort by citation count and effective date
        queryBuilder
          .orderBy('statute.citation_count', 'DESC')
          .addOrderBy('statute.effective_date', 'DESC');
        break;
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const statutes = await queryBuilder.getMany();

    const executionTimeMs = Date.now() - startTime;

    this.logger.log(
      `Statute search completed: ${statutes.length} results in ${executionTimeMs}ms`,
    );

    return {
      statutes,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      executionTimeMs,
    };
  }

  /**
   * Get statute by ID
   */
  async getStatuteById(id: string): Promise<Statute> {
    const statute = await this.statuteRepository.findOne({
      where: { id },
    });

    if (!statute) {
      throw new NotFoundException(`Statute with ID ${id} not found`);
    }

    return statute;
  }

  /**
   * Get statute by code and section
   */
  async getStatuteByCodeSection(code: string, section: string): Promise<Statute> {
    const statute = await this.statuteRepository.findOne({
      where: { code, section },
    });

    if (!statute) {
      throw new NotFoundException(`Statute ${code} § ${section} not found`);
    }

    return statute;
  }

  /**
   * Get citation information for a statute
   */
  async getStatuteCitationInfo(statuteId: string): Promise<StatuteCitationInfo> {
    const statute = await this.getStatuteById(statuteId);

    // Get recent citations (last year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // For now, use the citation_count field
    // In a full implementation, you would query cases that cite this statute
    const recentCitations = Math.floor(statute.citationCount * 0.1); // Estimate

    // Get related statutes based on topics and cross-references
    const relatedStatutes = await this.getRelatedStatutes(statuteId, 10);

    return {
      statute,
      citationCount: statute.citationCount,
      recentCitations,
      relatedStatutes,
      crossReferences: statute.crossReferences || [],
    };
  }

  /**
   * Get related statutes based on topics and cross-references
   */
  async getRelatedStatutes(statuteId: string, limit = 10): Promise<Statute[]> {
    const statute = await this.getStatuteById(statuteId);

    const queryBuilder = this.statuteRepository
      .createQueryBuilder('statute')
      .where('statute.deletedAt IS NULL')
      .andWhere('statute.id != :statuteId', { statuteId });

    // Match by topics
    if (statute.topics && statute.topics.length > 0) {
      queryBuilder.andWhere('statute.topics && ARRAY[:...topics]::text[]', {
        topics: statute.topics,
      });
    }

    // Match by code (same code family)
    queryBuilder.orWhere('statute.code = :code', { code: statute.code });

    // Prefer same jurisdiction
    queryBuilder
      .orderBy(
        `CASE WHEN statute.jurisdiction = '${statute.jurisdiction}' THEN 0 ELSE 1 END`,
      )
      .addOrderBy('statute.citation_count', 'DESC')
      .take(limit);

    return queryBuilder.getMany();
  }

  /**
   * Get statutes by code (e.g., all sections of 42 U.S.C.)
   */
  async getStatutesByCode(code: string, limit = 100): Promise<Statute[]> {
    return this.statuteRepository.find({
      where: { code },
      order: { section: 'ASC' },
      take: limit,
    });
  }

  /**
   * Get statutes by chapter
   */
  async getStatutesByChapter(code: string, chapter: string): Promise<Statute[]> {
    return this.statuteRepository.find({
      where: { code, chapter },
      order: { section: 'ASC' },
    });
  }

  /**
   * Get most cited statutes
   */
  async getMostCitedStatutes(
    jurisdiction?: StatuteJurisdiction,
    limit = 100,
  ): Promise<Statute[]> {
    const queryBuilder = this.statuteRepository
      .createQueryBuilder('statute')
      .where('statute.deletedAt IS NULL')
      .andWhere('statute.is_active = true');

    if (jurisdiction) {
      queryBuilder.andWhere('statute.jurisdiction = :jurisdiction', { jurisdiction });
    }

    queryBuilder
      .orderBy('statute.citation_count', 'DESC')
      .addOrderBy('statute.effective_date', 'DESC')
      .take(limit);

    return queryBuilder.getMany();
  }

  /**
   * Get recently amended statutes
   */
  async getRecentlyAmendedStatutes(limit = 50): Promise<Statute[]> {
    return this.statuteRepository.find({
      where: { isActive: true },
      order: { lastAmended: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get statutes by topic
   */
  async getStatutesByTopic(topic: string, limit = 50): Promise<Statute[]> {
    const queryBuilder = this.statuteRepository
      .createQueryBuilder('statute')
      .where('statute.deletedAt IS NULL')
      .andWhere(':topic = ANY(statute.topics)', { topic })
      .orderBy('statute.citation_count', 'DESC')
      .take(limit);

    return queryBuilder.getMany();
  }

  /**
   * Search statutes with cross-references
   */
  async findCrossReferences(statuteId: string): Promise<Statute[]> {
    const statute = await this.getStatuteById(statuteId);

    if (!statute.crossReferences || statute.crossReferences.length === 0) {
      return [];
    }

    // Parse cross-references and find matching statutes
    const crossRefStatutes: Statute[] = [];

    for (const crossRef of statute.crossReferences) {
      // Extract code and section from cross-reference
      // Example: "42 U.S.C. § 1988" -> code: "42 U.S.C.", section: "1988"
      const match = crossRef.match(/^([\d\w\s.]+)\s+§\s+([\d\w-]+)/);
      if (match) {
        const [, code, section] = match;
        try {
          const crossRefStatute = await this.getStatuteByCodeSection(
            code.trim(),
            section.trim(),
          );
          crossRefStatutes.push(crossRefStatute);
        } catch (error) {
          // Cross-referenced statute not found, continue
        }
      }
    }

    return crossRefStatutes;
  }

  /**
   * Get statute history (amendments over time)
   */
  async getStatuteHistory(statuteId: string): Promise<{
    statute: Statute;
    effectiveDate?: Date;
    lastAmended?: Date;
    sunsetDate?: Date;
    legislativeHistory?: string;
    notes?: string;
  }> {
    const statute = await this.getStatuteById(statuteId);

    return {
      statute,
      effectiveDate: statute.effectiveDate,
      lastAmended: statute.lastAmended,
      sunsetDate: statute.sunsetDate,
      legislativeHistory: statute.legislativeHistory,
      notes: statute.notes,
    };
  }
}
