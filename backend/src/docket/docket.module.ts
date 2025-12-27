import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocketController } from './docket.controller';
import { DocketService } from './docket.service';
import { DocketEntry } from './entities/docket-entry.entity';

/**
 * Docket Module
 * Manages court docket entries, filings, and case activity tracking
 * Imports docket data from PACER and other court systems
 */
@Module({
  imports: [TypeOrmModule.forFeature([DocketEntry])],
  controllers: [DocketController],
  providers: [DocketService],
  exports: [DocketService],
})
export class DocketModule {}
