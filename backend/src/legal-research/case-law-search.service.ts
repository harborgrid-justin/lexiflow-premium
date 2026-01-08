import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { CaseLaw, CaseLawJurisdiction, CaseLawCourt } from './entities/case-law.entity';
import { CitationLink, CitationTreatment, CitationSignal } from './entities/citation-link.entity';

export interface CaseLawSearchQuery {
  query?: string;
  jurisdiction?: CaseLawJurisdiction[];
  court?: CaseLawCourt[];
  dateFrom?: Date;
  dateTo?: Date;
  topics?: string[];
  keyNumber?: string;
  isBinding?: boolean;
  citationTreatment?: CitationTreatment[];
  sortBy?: 'relevance' | 'date' | 'citations';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface CaseLawSearchResult {
  cases: CaseLaw[];
  total: number;
  page: number;
  pageSize: number;
  executionTimeMs: number;
}

export interface CitationAnalysis {
  caseId: string;
  citation: string;
  title: string;
  totalCitations: number;
  positiveCitations: number;
  negativeCitations: number;
  neutralCitations: number;
  treatmentSignal: CitationSignal;
  isStillGoodLaw: boolean;
  criticalTreatments: CitationLink[];
  recentTreatments: CitationLink[];
  citationHistory: {
    year: number;
    count: number;
  }[];
}

/**
 * Case Law Search Service
 * Provides advanced search and analysis for case law
 */
@Injectable()
export class CaseLawSearchService {
  private readonly logger = new Logger(CaseLawSearchService.name);

  constructor(
    @InjectRepository(CaseLaw)
    private readonly caseLawRepository: Repository<CaseLaw>,
    @InjectRepository(CitationLink)
    private readonly citationLinkRepository: Repository<CitationLink>,
  ) {}

  /**
   * Search case law with advanced filters
   */
  async searchCaseLaw(searchQuery: CaseLawSearchQuery): Promise<CaseLawSearchResult> {
    const startTime = Date.now();
    const limit = searchQuery.limit || 50;
    const offset = searchQuery.offset || 0;

    const queryBuilder = this.caseLawRepository
      .createQueryBuilder('case_law')
      .where('case_law.deletedAt IS NULL');

    // Full-text search on title, summary, and full_text
    if (searchQuery.query) {
      queryBuilder.andWhere(
        '(case_law.title ILIKE :query OR case_law.summary ILIKE :query OR case_law.full_text ILIKE :query)',
        { query: `%${searchQuery.query}%` },
      );
    }

    // Jurisdiction filter
    if (searchQuery.jurisdiction && searchQuery.jurisdiction.length > 0) {
      queryBuilder.andWhere('case_law.jurisdiction IN (:...jurisdictions)', {
        jurisdictions: searchQuery.jurisdiction,
      });
    }

    // Court filter
    if (searchQuery.court && searchQuery.court.length > 0) {
      queryBuilder.andWhere('case_law.court IN (:...courts)', {
        courts: searchQuery.court,
      });
    }

    // Date range filter
    if (searchQuery.dateFrom) {
      queryBuilder.andWhere('case_law.decision_date >= :dateFrom', {
        dateFrom: searchQuery.dateFrom,
      });
    }
    if (searchQuery.dateTo) {
      queryBuilder.andWhere('case_law.decision_date <= :dateTo', {
        dateTo: searchQuery.dateTo,
      });
    }

    // Topics filter (array contains)
    if (searchQuery.topics && searchQuery.topics.length > 0) {
      queryBuilder.andWhere('case_law.topics && ARRAY[:...topics]::text[]', {
        topics: searchQuery.topics,
      });
    }

    // Key Number filter
    if (searchQuery.keyNumber) {
      queryBuilder.andWhere('case_law.key_number = :keyNumber', {
        keyNumber: searchQuery.keyNumber,
      });
    }

    // Binding precedent filter
    if (searchQuery.isBinding !== undefined) {
      queryBuilder.andWhere('case_law.is_binding = :isBinding', {
        isBinding: searchQuery.isBinding,
      });
    }

    // Sorting
    const sortBy = searchQuery.sortBy || 'relevance';
    const sortOrder = searchQuery.sortOrder || 'DESC';

    switch (sortBy) {
      case 'date':
        queryBuilder.orderBy('case_law.decision_date', sortOrder);
        break;
      case 'citations':
        queryBuilder.orderBy('case_law.citation_count', sortOrder);
        break;
      case 'relevance':
      default:
        // For relevance, sort by citation count and date
        queryBuilder
          .orderBy('case_law.citation_count', 'DESC')
          .addOrderBy('case_law.decision_date', 'DESC');
        break;
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const cases = await queryBuilder.getMany();

    const executionTimeMs = Date.now() - startTime;

    this.logger.log(
      `Case law search completed: ${cases.length} results in ${executionTimeMs}ms`,
    );

    return {
      cases,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      executionTimeMs,
    };
  }

  /**
   * Get case law by ID
   */
  async getCaseLawById(id: string): Promise<CaseLaw> {
    const caseLaw = await this.caseLawRepository.findOne({
      where: { id },
    });

    if (!caseLaw) {
      throw new NotFoundException(`Case law with ID ${id} not found`);
    }

    return caseLaw;
  }

  /**
   * Get case law by citation
   */
  async getCaseLawByCitation(citation: string): Promise<CaseLaw> {
    const caseLaw = await this.caseLawRepository.findOne({
      where: { citation },
    });

    if (!caseLaw) {
      throw new NotFoundException(`Case law with citation ${citation} not found`);
    }

    return caseLaw;
  }

  /**
   * Perform Shepard's-style citation analysis
   * Analyzes how a case has been treated by subsequent cases
   */
  async getCitationAnalysis(caseId: string): Promise<CitationAnalysis> {
    const caseLaw = await this.getCaseLawById(caseId);

    // Get all cases that cite this case (target_case_id = caseId)
    const citationLinks = await this.citationLinkRepository.find({
      where: { targetCaseId: caseId },
      relations: ['sourceCase'],
      order: { citationDate: 'DESC' },
    });

    // Categorize citations by treatment
    const positiveTreatments = [
      CitationTreatment.FOLLOWED,
      CitationTreatment.AFFIRMED,
      CitationTreatment.APPROVED,
      CitationTreatment.CITED_FAVORABLY,
    ];

    const negativeTreatments = [
      CitationTreatment.OVERRULED,
      CitationTreatment.OVERRULED_IN_PART,
      CitationTreatment.REVERSED,
      CitationTreatment.REVERSED_IN_PART,
      CitationTreatment.SUPERSEDED,
      CitationTreatment.SUPERSEDED_BY_STATUTE,
      CitationTreatment.ABROGATED,
      CitationTreatment.DISTINGUISHED,
      CitationTreatment.CRITICIZED,
      CitationTreatment.QUESTIONED,
      CitationTreatment.LIMITED,
      CitationTreatment.NOT_FOLLOWED,
      CitationTreatment.DECLINED_TO_FOLLOW,
    ];

    const positiveCitations = citationLinks.filter((link) =>
      positiveTreatments.includes(link.treatment),
    );
    const negativeCitations = citationLinks.filter((link) =>
      negativeTreatments.includes(link.treatment),
    );
    const neutralCitations = citationLinks.filter(
      (link) =>
        !positiveTreatments.includes(link.treatment) &&
        !negativeTreatments.includes(link.treatment),
    );

    // Determine overall treatment signal
    let treatmentSignal: CitationSignal = CitationSignal.NEUTRAL;
    let isStillGoodLaw = true;

    // Check for red flag treatments (overruled, reversed)
    const redFlagTreatments = [
      CitationTreatment.OVERRULED,
      CitationTreatment.REVERSED,
      CitationTreatment.SUPERSEDED,
      CitationTreatment.ABROGATED,
    ];

    if (citationLinks.some((link) => redFlagTreatments.includes(link.treatment))) {
      treatmentSignal = CitationSignal.RED_FLAG;
      isStillGoodLaw = false;
    } else if (
      citationLinks.some((link) =>
        [CitationTreatment.QUESTIONED, CitationTreatment.CRITICIZED].includes(link.treatment),
      )
    ) {
      treatmentSignal = CitationSignal.YELLOW_FLAG;
    } else if (citationLinks.some((link) => link.treatment === CitationTreatment.AFFIRMED)) {
      treatmentSignal = CitationSignal.BLUE_A;
    } else if (positiveCitations.length > neutralCitations.length) {
      treatmentSignal = CitationSignal.GREEN_C;
    }

    // Get critical treatments (negative or important)
    const criticalTreatments = citationLinks.filter(
      (link) => link.isNegativeTreatment || link.isCritical,
    );

    // Get recent treatments (last 5 years)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const recentTreatments = citationLinks.filter(
      (link) => new Date(link.citationDate) >= fiveYearsAgo,
    );

    // Build citation history by year
    const citationHistory: { year: number; count: number }[] = [];
    const yearCounts: Record<number, number> = {};

    citationLinks.forEach((link) => {
      const year = new Date(link.citationDate).getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    Object.keys(yearCounts)
      .sort()
      .forEach((year) => {
        citationHistory.push({
          year: parseInt(year, 10),
          count: yearCounts[parseInt(year, 10)],
        });
      });

    return {
      caseId: caseLaw.id,
      citation: caseLaw.citation,
      title: caseLaw.title,
      totalCitations: citationLinks.length,
      positiveCitations: positiveCitations.length,
      negativeCitations: negativeCitations.length,
      neutralCitations: neutralCitations.length,
      treatmentSignal,
      isStillGoodLaw,
      criticalTreatments,
      recentTreatments,
      citationHistory,
    };
  }

  /**
   * Get cases that cite a specific case
   */
  async getCitingCases(caseId: string, limit = 50): Promise<CitationLink[]> {
    return this.citationLinkRepository.find({
      where: { targetCaseId: caseId },
      relations: ['sourceCase'],
      order: { citationDate: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get cases cited by a specific case
   */
  async getCitedCases(caseId: string, limit = 50): Promise<CitationLink[]> {
    return this.citationLinkRepository.find({
      where: { sourceCaseId: caseId },
      relations: ['targetCase'],
      order: { citationDate: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get similar cases based on topics and key numbers
   */
  async getSimilarCases(caseId: string, limit = 10): Promise<CaseLaw[]> {
    const caseLaw = await this.getCaseLawById(caseId);

    if (!caseLaw.topics || caseLaw.topics.length === 0) {
      return [];
    }

    const queryBuilder = this.caseLawRepository
      .createQueryBuilder('case_law')
      .where('case_law.deletedAt IS NULL')
      .andWhere('case_law.id != :caseId', { caseId })
      .andWhere('case_law.topics && ARRAY[:...topics]::text[]', {
        topics: caseLaw.topics,
      });

    if (caseLaw.keyNumber) {
      queryBuilder.orWhere('case_law.key_number = :keyNumber', {
        keyNumber: caseLaw.keyNumber,
      });
    }

    queryBuilder
      .orderBy('case_law.citation_count', 'DESC')
      .addOrderBy('case_law.decision_date', 'DESC')
      .take(limit);

    return queryBuilder.getMany();
  }

  /**
   * Get most cited cases
   */
  async getMostCitedCases(
    jurisdiction?: CaseLawJurisdiction,
    limit = 100,
  ): Promise<CaseLaw[]> {
    const queryBuilder = this.caseLawRepository
      .createQueryBuilder('case_law')
      .where('case_law.deletedAt IS NULL');

    if (jurisdiction) {
      queryBuilder.andWhere('case_law.jurisdiction = :jurisdiction', { jurisdiction });
    }

    queryBuilder
      .orderBy('case_law.citation_count', 'DESC')
      .addOrderBy('case_law.decision_date', 'DESC')
      .take(limit);

    return queryBuilder.getMany();
  }
}
