import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryWorkbenchController } from './query-workbench.controller';
import { QueryWorkbenchService } from './query-workbench.service';
import { QueryHistory } from './entities/query-history.entity';
import { SavedQuery } from './entities/saved-query.entity';
import { AuthModule } from '@auth/auth.module';

/**
 * Query Workbench Module
 * Advanced SQL query builder and data exploration tool
 * Features:
 * - Interactive SQL query builder
 * - Saved queries and query history
 * - Result export and visualization
 * - Admin-only access for data analysis
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([QueryHistory, SavedQuery]),
    AuthModule,
  ],
  controllers: [QueryWorkbenchController],
  providers: [QueryWorkbenchService],
  exports: [QueryWorkbenchService],
})
export class QueryWorkbenchModule {}
