import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

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
