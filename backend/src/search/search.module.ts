import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

/**
 * Search Module
 * Full-text search across all legal entities
 * Features:
 * - Global search across cases, documents, clients, parties
 * - Advanced search filters and facets
 * - Search result ranking and relevance
 * - Saved searches and search history
 * 
 * Note: Entity imports commented out to avoid circular dependencies.
 * SearchService dynamically queries repositories at runtime.
 */
@Module({
  imports: [
    // TypeOrmModule.forFeature([
    //   Case,
    //   LegalDocument,
    //   Client,
    //   Party,
    //   Motion,
    //   DocketEntry,
    // ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
