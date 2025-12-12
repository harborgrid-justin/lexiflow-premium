import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AdvancedSearchService } from './advanced-search.service';

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
  providers: [SearchService, AdvancedSearchService],
  exports: [SearchService, AdvancedSearchService],
})
export class SearchModule {}
