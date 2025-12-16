import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataSourcesService } from './data-sources.service';
import { DataSourcesController } from './data-sources.controller';

@Module({
  imports: [JwtModule.register({})], // Required for JwtAuthGuard
  controllers: [DataSourcesController],
  providers: [DataSourcesService],
  exports: [DataSourcesService],
})
export class DataSourcesModule {}
