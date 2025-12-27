import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataSourcesService } from './data-sources.service';
import { DataSourcesController } from './data-sources.controller';

@Module({
  imports: [], // JWT available globally from AuthModule
  controllers: [DataSourcesController],
  providers: [DataSourcesService],
  exports: [DataSourcesService],
})
export class DataSourcesModule {}
