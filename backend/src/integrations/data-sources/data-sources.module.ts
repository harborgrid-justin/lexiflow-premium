import { Module } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { DataSourcesController } from './data-sources.controller';

@Module({
  imports: [],
  controllers: [DataSourcesController],
  providers: [DataSourcesService],
  exports: [DataSourcesService],
})
export class DataSourcesModule {}
