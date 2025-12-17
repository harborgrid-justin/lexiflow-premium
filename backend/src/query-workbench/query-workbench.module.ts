import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryWorkbenchController } from './query-workbench.controller';
import { QueryWorkbenchService } from './query-workbench.service';
import { QueryHistory } from './entities/query-history.entity';
import { SavedQuery } from './entities/saved-query.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QueryHistory, SavedQuery])],
  controllers: [QueryWorkbenchController],
  providers: [QueryWorkbenchService],
  exports: [QueryWorkbenchService],
})
export class QueryWorkbenchModule {}
