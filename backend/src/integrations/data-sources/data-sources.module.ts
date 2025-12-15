import { Module } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { DataSourcesController } from './data-sources.controller';

@Module({
  controllers: [DataSourcesController],
  providers: [DataSourcesService],
  exports: [DataSourcesService],
})
export class DataSourcesModule {}
