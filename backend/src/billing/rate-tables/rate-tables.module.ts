import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateTablesController } from './rate-tables.controller';
import { RateTablesService } from './rate-tables.service';
import { RateTable } from './entities/rate-table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RateTable])],
  controllers: [RateTablesController],
  providers: [RateTablesService],
  exports: [RateTablesService],
})
export class RateTablesModule {}
