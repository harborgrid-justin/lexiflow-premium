import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalResearchController } from './legal-research.controller';
import { LegalResearchService } from './legal-research.service';
import { CaseLawSearchService } from './case-law-search.service';
import { StatuteSearchService } from './statute-search.service';
import { ResearchHistoryService } from './research-history.service';
import { CitationParserService } from './citation-parser.service';
import { CaseLaw } from './entities/case-law.entity';
import { Statute } from './entities/statute.entity';
import { ResearchQuery } from './entities/research-query.entity';
import { CitationLink } from './entities/citation-link.entity';

/**
 * Legal Research Module
 * Provides comprehensive legal research capabilities:
 * - Case law search and analysis
 * - Statute search and cross-referencing
 * - Shepard's-style citation analysis
 * - Research history and bookmarking
 * - Bluebook citation parsing
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CaseLaw,
      Statute,
      ResearchQuery,
      CitationLink,
    ]),
  ],
  controllers: [LegalResearchController],
  providers: [
    LegalResearchService,
    CaseLawSearchService,
    StatuteSearchService,
    ResearchHistoryService,
    CitationParserService,
  ],
  exports: [
    LegalResearchService,
    CaseLawSearchService,
    StatuteSearchService,
    ResearchHistoryService,
    CitationParserService,
  ],
})
export class LegalResearchModule {}
